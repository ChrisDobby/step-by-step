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

export type TestFunctionOutput = {
  error?: {
    message: string
    cause: string
  }
  status?: TestExecutionStatus
  output?: Record<string, unknown>
  stack: (TestSingleStateOutput & { stateName: string })[]
}
