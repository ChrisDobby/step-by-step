import { TestExecutionStatus } from "@aws-sdk/client-sfn"

export type StateType = "Task" | "Pass" | "Wait" | "Choice" | "Succeed" | "Fail" | "Parallel" | "Map"
export type TestSingleStateInput = {
  state?: string
  stateDefinition: { Type: StateType } & Record<string, unknown>
  input?: Record<string, unknown>
  mockedResult?: TestSingleStateOutput | null
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
    States: Record<string, { Type: StateType; End?: boolean; Next?: string } & Record<string, unknown>>
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

export type MockedResponse = { response?: Record<string, unknown> }

type ResponseMockAlways = MockedResponse & {
  deleteWhenUsed: true
}

type ResponseMockSingle = MockedResponse & {
  deleteWhenUsed: false
}

export type ResponseMock = ResponseMockAlways | ResponseMockSingle
