import { TestSingleStateInput } from "./types"
import {
  LambdaClient,
  CreateFunctionCommand,
  GetFunctionCommand,
  ResourceNotFoundException,
  ResourceConflictException,
  InvokeCommand,
  DeleteFunctionCommand,
} from "@aws-sdk/client-lambda"

const lamdbaClient = new LambdaClient({ region: process.env.AWS_REGION })

export const mockFunctionName = "step-by-step-mock-response"

export const transformState = (stateDefinition: TestSingleStateInput["stateDefinition"]) => {
  switch (stateDefinition.Type) {
    case "Wait":
      return { ...stateDefinition, Seconds: 0 }
    default:
      return stateDefinition
  }
}

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const checkIfLambdaExists = async () => {
  try {
    await lamdbaClient.send(
      new GetFunctionCommand({
        FunctionName: mockFunctionName,
      })
    )

    return true
  } catch (e) {
    if (!(e instanceof ResourceNotFoundException)) {
      throw e
    }
  }

  return false
}

const canInvokeLambda = async () => {
  try {
    await lamdbaClient.send(
      new InvokeCommand({
        FunctionName: mockFunctionName,
        Payload: JSON.stringify({ mockResult: {} }),
      })
    )

    return true
  } catch (e) {
    if (e instanceof ResourceConflictException) {
      return false
    }

    throw e
  }
}

const waitForLambda = async () =>
  new Promise<void>(async resolve => {
    while (!(await canInvokeLambda())) {
      await wait(1000)
    }

    resolve()
  })

export const createLambdaIfNotExists = async () => {
  if (await checkIfLambdaExists()) {
    return
  }

  await lamdbaClient.send(
    new CreateFunctionCommand({
      FunctionName: mockFunctionName,
      Runtime: "nodejs22.x",
      Handler: "index.handler",
      Role: process.env.AWS_ROLE_ARN!,
      Code: {
        S3Bucket: "chrisdobby-step-by-step",
        S3Key: "step-by-step-mock-response.zip",
      },
    })
  )

  await waitForLambda()
}

export const deleteLambda = () =>
  lamdbaClient.send(
    new DeleteFunctionCommand({
      FunctionName: mockFunctionName,
    })
  )
