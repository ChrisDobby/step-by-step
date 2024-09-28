import { SFNClient, TestExecutionStatus, TestStateCommand } from "@aws-sdk/client-sfn"

const client = new SFNClient({ region: process.env.AWS_REGION })

type TestSingleStateInput = {
  stateDefinition: string
}

type TestSingleStateOutput = {
  error?: {
    message: string
    cause: string
  }
  status?: TestExecutionStatus
  nextState?: string
  output?: Record<string, unknown>
}

export const testSingleState = async ({ stateDefinition }: TestSingleStateInput): Promise<TestSingleStateOutput> => {
  const result = await client.send(
    new TestStateCommand({
      definition: stateDefinition,
      roleArn: process.env.AWS_ROLE_ARN!,
    })
  )

  return {
    error: result.error ? { message: result.error!, cause: result.cause! } : undefined,
    status: result.status,
    nextState: result.nextState,
    output: result.output ? JSON.parse(result.output) : undefined,
  }
}
