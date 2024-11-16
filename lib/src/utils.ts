import { TestSingleStateInput } from "./types"

export const transformState = (stateDefinition: TestSingleStateInput["stateDefinition"]) => {
  switch (stateDefinition.Type) {
    case "Wait":
      return { ...stateDefinition, Seconds: 0 }
    default:
      return stateDefinition
  }
}

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
