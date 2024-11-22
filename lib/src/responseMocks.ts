import {
  LambdaClient,
  CreateFunctionCommand,
  GetFunctionCommand,
  ResourceNotFoundException,
} from "@aws-sdk/client-lambda"
import { readFileSync } from "fs"

import { mock, mockOnce, mockTimes } from "./mocks"
import { ResponseMock, MockedResponse, TestSingleStateInput } from "./types"

const lamdbaClient = new LambdaClient({ region: process.env.AWS_REGION })

const mockFunctionName = "step-by-step-mock-response"
const responseMocks = new Map<string, ResponseMock[]>()

const createLambda = async () => {
  await lamdbaClient.send(
    new CreateFunctionCommand({
      FunctionName: mockFunctionName,
      Runtime: "nodejs20.x",
      Handler: "index.handler",
      Role: process.env.AWS_ROLE_ARN!,
      Code: {
        ZipFile: readFileSync("./step-by-step-mock-response.zip"),
      },
    })
  )
}

const createLambdaIfNotExists = async () => {
  console.log("Creating Lambda function")
  try {
    await lamdbaClient.send(
      new GetFunctionCommand({
        FunctionName: mockFunctionName,
      })
    )
  } catch (e) {
    if (!(e instanceof ResourceNotFoundException)) {
      throw e
    }
    console.log("Creating Lambda function")
    await createLambda()
  }
}

const addPayload = (output: unknown) => JSON.parse(JSON.stringify(output).replaceAll("$.", "$.Payload."))

const getDefaultResultSelector = (response: Record<string, unknown>) =>
  Object.keys(response).reduce(
    (acc, key) => ({
      ...acc,
      [`${key}.$`]: `$.Payload.${key}`,
    }),
    {}
  )

const updateOutputs = (
  stateDefinition: TestSingleStateInput["stateDefinition"],
  response: Record<string, unknown> = {}
) => {
  switch (true) {
    case Boolean(stateDefinition.ResultSelector):
      return {
        ...stateDefinition,
        ResultSelector: addPayload(stateDefinition.ResultSelector),
      }

    case Boolean(stateDefinition.OutputPath):
      return {
        ...stateDefinition,
        OutputPath: addPayload(stateDefinition.OutputPath),
      }

    case Boolean(stateDefinition.ResultPath):
      return {
        ...stateDefinition,
        ResultSelector: stateDefinition.ResultSelector ?? getDefaultResultSelector(response),
      }

    default:
      return { ...stateDefinition, OutputPath: "$.Payload" }
  }
}

export const transformState = async (stateName: string, stateDefinition: TestSingleStateInput["stateDefinition"]) => {
  const mocks = responseMocks.get(stateName)
  if (!mocks || !mocks.length) {
    return stateDefinition
  }

  await createLambdaIfNotExists()
  const [mock] = mocks

  if (mock.deleteWhenUsed) {
    responseMocks.set(stateName, mocks.slice(1))
  }

  return {
    ...stateDefinition,
    ...updateOutputs(stateDefinition, mock.response),
    Resource: "arn:aws:states:::lambda:invoke",
    Parameters: {
      FunctionName: mockFunctionName,
      Payload: { mockResult: mock.response },
    },
  }
}

export const reset = () => responseMocks.clear()

export const mockResponse = mock(responseMocks)
export const mockResponseOnce = mockOnce(responseMocks)
export const mockResponseTimes = mockTimes(responseMocks)
