import { SFNClient, TestStateCommand } from "@aws-sdk/client-sfn"
import { TestFunctionInput, TestFunctionOutput, TestSingleStateInput, TestSingleStateOutput, TestSubsetInput } from "./types"

const client = new SFNClient({ region: process.env.AWS_REGION })

export const testSingleState = async ({ stateDefinition, input }: TestSingleStateInput): Promise<TestSingleStateOutput> => {
  const result = await client.send(
    new TestStateCommand({
      definition: JSON.stringify(stateDefinition),
      roleArn: process.env.AWS_ROLE_ARN!,
      input: JSON.stringify(input),
    })
  )

  return {
    error: result.error ? { message: result.error!, cause: result.cause! } : undefined,
    status: result.status,
    nextState: result.nextState,
    output: result.output ? JSON.parse(result.output) : undefined,
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
  const stateDefinition = functionDefinition.States[state]
  const result = await testSingleState({ stateDefinition, input })
  const updatedStack = [...stack, { ...result, stateName: state }]
  console.log("state", state, endState)
  return stateDefinition.End || state === endState
    ? { ...result, stack: updatedStack }
    : execute({ functionDefinition, input: result.output, state: result.nextState!, stack: updatedStack, endState })
}

export const testFunction = async ({ functionDefinition, input }: TestFunctionInput) => execute({ functionDefinition, input, state: functionDefinition.StartAt })

export const testSubset = async ({ functionDefinition, input, startState, endState }: TestSubsetInput) => execute({ functionDefinition, input, state: startState, endState })
