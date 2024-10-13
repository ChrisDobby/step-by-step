import { MockedState, StateMock } from "./types"

const stateMocks = new Map<string, StateMock[]>()

export const mockedResult = (stateName: string, nextState?: string) => {
  const mocks = stateMocks.get(stateName)

  if (!mocks) {
    return null
  }

  const [mock] = mocks

  if (mock.deleteWhenUsed) {
    stateMocks.set(stateName, mocks.slice(1))
  }

  return {
    error: mock.error,
    status: mock.error ? ("FAILED" as const) : ("SUCCEEDED" as const),
    nextState: mock.nextState || nextState,
    output: mock.output,
  }
}

export const reset = () => stateMocks.clear()

export const mockState = (stateName: string, mockedState: MockedState) => {
  stateMocks.set(
    stateName,
    stateMocks.get(stateName)
      ? [...stateMocks.get(stateName)!, { ...mockedState, deleteWhenUsed: false }]
      : [{ ...mockedState, deleteWhenUsed: false }]
  )
}

export const mockStateOnce = (stateName: string, mockedState: MockedState) => {
  stateMocks.set(
    stateName,
    stateMocks.get(stateName)
      ? [...stateMocks.get(stateName)!, { ...mockedState, deleteWhenUsed: true }]
      : [{ ...mockedState, deleteWhenUsed: true }]
  )
}

export const mockStateTimes = (times: number, stateName: string, mockedState: MockedState) => {
  Array.from({ length: times }).forEach(() => mockStateOnce(stateName, mockedState))
}
