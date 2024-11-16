import { SFNClient, TestStateCommand, TestStateCommandOutput, SFNServiceException } from "@aws-sdk/client-sfn"
import {
  TestFunctionInput,
  TestFunctionOutput,
  TestSingleStateInput,
  TestSingleStateOutput,
  TestSubsetInput,
} from "./types"
import { transformState, wait } from "./utils"
import * as stateMocks from "./stateMocks"

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
        definition: JSON.stringify(transformState(stateDefinition)),
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

export const testSingleState = async ({
  stateDefinition,
  input,
}: TestSingleStateInput): Promise<TestSingleStateOutput> => testState(stateDefinition, input)

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
  const stateDefinition = functionDefinition.States[state]
  const result =
    stateMocks.mockedResult(state, functionDefinition.States[state].Next) ||
    (await testSingleState({ stateDefinition, input }))
  const updatedStack = [...stack, { ...result, stateName: state }]

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
