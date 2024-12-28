import { TestExecutionStatus } from "@aws-sdk/client-sfn"

export type StateType = "Task" | "Pass" | "Wait" | "Choice" | "Succeed" | "Fail" | "Parallel" | "Map"
type QueryLanguage = "JSONata" | "JSONPath"
type StateInputOutput = Record<string, unknown> | Record<string, unknown>[]
export type State = {
  QueryLanguage?: QueryLanguage
  End?: boolean
  Next?: string
} & Record<string, unknown>

export type ParallelState = State & {
  Type: "Parallel"
  Branches: TestFunctionInput["functionDefinition"][]
  Next?: string
  End?: boolean
  QueryLanguage?: QueryLanguage
}

type StateDefinition = State & { Type: Omit<StateType, "Parallel"> }

export type TestSingleStateInput = {
  state?: string
  stateDefinition: StateDefinition | ParallelState
  input?: StateInputOutput
  mockedResult?: TestSingleStateOutput | null
}

export type TestSingleStateOutput = {
  error?: {
    message: string
    cause: string
  }
  status?: TestExecutionStatus
  nextState?: string
  output?: StateInputOutput
  stack?: (TestSingleStateOutput & { stateName: string })[]
}

export type TestFunctionInput = {
  functionDefinition: {
    QueryLanguage?: QueryLanguage
    StartAt: string
    States: Record<string, { Type: StateType; End?: boolean; Next?: string } & Record<string, unknown>>
  }
  input?: StateInputOutput
}

type OutputError = {
  message: string
  cause: string
}
export type TestFunctionOutput = {
  error?: OutputError
  status?: TestExecutionStatus
  output?: StateInputOutput
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
