import { mock, mockOnce, mockTimes } from "./mocks"
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

export const mockState = mock(stateMocks)
export const mockStateOnce = mockOnce(stateMocks)
export const mockStateTimes = mockTimes(stateMocks)
