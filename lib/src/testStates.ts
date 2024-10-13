import { SFNClient, TestStateCommand, TestStateCommandOutput, SFNServiceException } from "@aws-sdk/client-sfn"
import {
  StateMock,
  MockedState,
  TestFunctionInput,
  TestFunctionOutput,
  TestSingleStateInput,
  TestSingleStateOutput,
  TestSubsetInput,
} from "./types"
import { wait } from "./utils"

const client = new SFNClient({ region: process.env.AWS_REGION })

const stateMocks = new Map<string, StateMock[]>()

const mockedResult = (stateName: string, nextState?: string) => {
  const mocks = stateMocks.get(stateName)

  if (!mocks) {
    return null
  }

  const [mock] = mocks

  if (mock.deleteWhenUsed) {
    stateMocks.set(stateName, mocks.slice(1))
  }

  return {
    error: mock.error,
    status: mock.error ? ("FAILED" as const) : ("SUCCEEDED" as const),
    nextState: mock.nextState || nextState,
    output: mock.output,
  }
}

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
    mockedResult(state, functionDefinition.States[state].Next) || (await testSingleState({ stateDefinition, input }))
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
  stateMocks.clear()
}

export const mockState = (stateName: string, mockedState: MockedState) => {
  stateMocks.set(
    stateName,
    stateMocks.get(stateName)
      ? [...stateMocks.get(stateName)!, { ...mockedState, deleteWhenUsed: false }]
      : [{ ...mockedState, deleteWhenUsed: false }]
  )
}

export const mockStateOnce = (stateName: string, mockedState: MockedState) => {
  stateMocks.set(
    stateName,
    stateMocks.get(stateName)
      ? [...stateMocks.get(stateName)!, { ...mockedState, deleteWhenUsed: true }]
      : [{ ...mockedState, deleteWhenUsed: true }]
  )
}

export const mockStateTimes = (times: number, stateName: string, mockedState: MockedState) => {
  Array.from({ length: times }).forEach(() => mockStateOnce(stateName, mockedState))
}
