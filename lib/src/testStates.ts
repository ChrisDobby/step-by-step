import { SFNClient, TestStateCommand, TestStateCommandOutput, SFNServiceException } from "@aws-sdk/client-sfn"
import {
  ParallelState,
  TestFunctionInput,
  TestFunctionOutput,
  TestSingleStateInput,
  TestSingleStateOutput,
  TestSubsetInput,
} from "./types"
import { transformState, wait } from "./utils"
import * as stateMocks from "./stateMocks"
import * as responseMocks from "./responseMocks"

const client = new SFNClient({ region: process.env.AWS_REGION })

const MAX_ATTEMPTS = 5
const testState = async (
  stateDefinition: TestSingleStateInput["stateDefinition"],
  input: TestSingleStateInput["input"],
  attempt = 1
) => {
  let result: TestStateCommandOutput = { status: "FAILED", $metadata: {} }
  try {
    result = await client.send(
      new TestStateCommand({
        definition: JSON.stringify(stateDefinition),
        roleArn: process.env.AWS_ROLE_ARN!,
        input: JSON.stringify(input),
      })
    )
  } catch (e) {
    if (e instanceof SFNServiceException && e.name === "ThrottlingException") {
      if (attempt === MAX_ATTEMPTS) {
        throw e
      }

      await wait(attempt * 1000)
      return testState(stateDefinition, input, attempt + 1)
    }

    throw e
  }

  return {
    error: result.error ? { message: result.error!, cause: result.cause! } : undefined,
    status: result.status,
    nextState: result.nextState,
    output: result.output ? JSON.parse(result.output) : undefined,
  }
}

const testParallelState = async ({
  stateDefinition,
  input,
}: {
  stateDefinition: ParallelState
  input: TestSingleStateInput["input"]
}): Promise<TestSingleStateOutput> => {
  const branchOutputs = await Promise.all(
    (stateDefinition as ParallelState).Branches.map(branch =>
      testFunction({ functionDefinition: { ...branch, QueryLanguage: stateDefinition.QueryLanguage }, input })
    )
  )

  return {
    status: "SUCCEEDED",
    nextState: stateDefinition.Next,
    output: branchOutputs.map(({ output }) => output) as Record<string, unknown>[],
    stack: branchOutputs.map(({ stack }) => stack).flat(),
  }
}

export const testSingleState = async ({
  state = "step-by-step-single-state",
  stateDefinition,
  input,
  mockedResult,
}: TestSingleStateInput): Promise<TestSingleStateOutput> => {
  if (mockedResult) {
    return mockedResult
  }

  switch (stateDefinition.Type) {
    case "Parallel":
      return testParallelState({ stateDefinition: stateDefinition as ParallelState, input })

    default:
      return testState(transformState(responseMocks.transformState(state, stateDefinition)), input)
  }
}

const execute = async ({
  functionDefinition,
  input,
  state,
  stack = [],
  endState,
}: TestFunctionInput & {
  state: string
  stack?: TestFunctionOutput["stack"]
  endState?: string
}): Promise<TestFunctionOutput> => {
  const stateDefinition = functionDefinition.QueryLanguage
    ? {
        ...functionDefinition.States[state],
        QueryLanguage: functionDefinition.States[state].QueryLanguage || functionDefinition.QueryLanguage,
      }
    : functionDefinition.States[state]

  const { stack: singleStateStack, ...result } = await testSingleState({
    state,
    stateDefinition,
    input,
    mockedResult: stateMocks.mockedResult(state, functionDefinition.States[state].Next),
  })
  const updatedStack = [...stack, ...(singleStateStack || []), { ...result, stateName: state }]

  return stateDefinition.End || state === endState || result.status === "FAILED"
    ? { ...result, stack: updatedStack }
    : execute({ functionDefinition, input: result.output, state: result.nextState!, stack: updatedStack, endState })
}

export const testFunction = async ({ functionDefinition, input }: TestFunctionInput) =>
  execute({ functionDefinition, input, state: functionDefinition.StartAt })

export const testSubset = async ({ functionDefinition, input, startState, endState }: TestSubsetInput) =>
  execute({ functionDefinition, input, state: startState, endState })

export const resetMocks = () => {
  stateMocks.reset()
}
