import { MockedResponse, MockedState, ResponseMock, StateMock } from "./types"

export const mock =
  (mocks: Map<string, (ResponseMock | StateMock)[]>) => (stateName: string, mocked: MockedResponse | MockedState) => {
    mocks.set(
      stateName,
      mocks.get(stateName)
        ? [...mocks.get(stateName)!, { ...mocked, deleteWhenUsed: false }]
        : [{ ...mocked, deleteWhenUsed: false }]
    )
  }

export const mockOnce =
  (mocks: Map<string, (ResponseMock | StateMock)[]>) => (stateName: string, mocked: MockedResponse | MockedState) => {
    mocks.set(
      stateName,
      mocks.get(stateName)
        ? [...mocks.get(stateName)!, { ...mocked, deleteWhenUsed: true }]
        : [{ ...mocked, deleteWhenUsed: true }]
    )
  }

export const mockTimes =
  (mocks: Map<string, (ResponseMock | StateMock)[]>) =>
  (times: number, stateName: string, mocked: MockedResponse | MockedState) => {
    Array.from({ length: times }).forEach(() => mockOnce(mocks)(stateName, mocked))
  }
