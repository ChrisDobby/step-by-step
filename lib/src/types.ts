import { TestExecutionStatus } from "@aws-sdk/client-sfn"

export type TestSingleStateInput = {
  stateDefinition: Record<string, unknown>
  input?: Record<string, unknown>
}

export type TestSingleStateOutput = {
  error?: {
    message: string
    cause: string
  }
  status?: TestExecutionStatus
  nextState?: string
  output?: Record<string, unknown>
}

export type TestFunctionInput = {
  functionDefinition: {
    StartAt: string
    States: Record<string, { Type: string; End?: boolean; Next?: string } & Record<string, unknown>>
  }
  input?: Record<string, unknown>
}

type OutputError = {
  message: string
  cause: string
}
export type TestFunctionOutput = {
  error?: OutputError
  status?: TestExecutionStatus
  output?: Record<string, unknown>
  stack: (TestSingleStateOutput & { stateName: string })[]
}

export type TestSubsetInput = TestFunctionInput & {
  startState: string
  endState: string
}

export type MockedState = { output?: Record<string, unknown>; error?: OutputError; nextState?: string }

type StateMockAlways = MockedState & {
  deleteWhenUsed: true
}

type StateMockSingle = MockedState & {
  deleteWhenUsed: false
}

export type StateMock = StateMockAlways | StateMockSingle
