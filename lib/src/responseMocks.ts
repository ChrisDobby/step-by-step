import { mock, mockOnce, mockTimes } from "./mocks"
import { ResponseMock, MockedResponse, TestSingleStateInput } from "./types"
import { createLambdaIfNotExists, deleteLambda, mockFunctionName } from "./utils"

const responseMocks = new Map<string, ResponseMock[]>()

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

export const transformState = (stateName: string, stateDefinition: TestSingleStateInput["stateDefinition"]) => {
  const mocks = responseMocks.get(stateName)
  if (!mocks || !mocks.length) {
    return stateDefinition
  }

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

export const init = () => createLambdaIfNotExists()
export const tearDown = () => deleteLambda()
export const reset = () => responseMocks.clear()

export const mockResponse = mock(responseMocks)
export const mockResponseOnce = mockOnce(responseMocks)
export const mockResponseTimes = mockTimes(responseMocks)
