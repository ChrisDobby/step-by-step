import { ResponseMock, MockedResponse } from "./types"

const responseMocks = new Map<string, ResponseMock[]>()

export const reset = () => responseMocks.clear()

export const mockResponse = (stateName: string, mockedResponse: MockedResponse) => {
  responseMocks.set(
    stateName,
    responseMocks.get(stateName)
      ? [...responseMocks.get(stateName)!, { ...mockedResponse, deleteWhenUsed: false }]
      : [{ ...mockedResponse, deleteWhenUsed: false }]
  )
}

export const mockResponseOnce = (stateName: string, mockedResponse: MockedResponse) => {
  responseMocks.set(
    stateName,
    responseMocks.get(stateName)
      ? [...responseMocks.get(stateName)!, { ...mockedResponse, deleteWhenUsed: true }]
      : [{ ...mockedResponse, deleteWhenUsed: true }]
  )
}

export const mockResponseTimes = (times: number, stateName: string, mockedResponse: MockedResponse) => {
  Array.from({ length: times }).forEach(() => mockResponseOnce(stateName, mockedResponse))
}
