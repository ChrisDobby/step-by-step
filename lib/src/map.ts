import { MapState, TestFunctionInput, TestFunctionOutput, TestSingleStateInput, TestSingleStateOutput } from "./types"

const getItems = async ({
  stateDefinition,
  input,
  testSingleState,
}: {
  stateDefinition: MapState
  input: TestSingleStateInput["input"]
  testSingleState: (input: TestSingleStateInput) => Promise<TestSingleStateOutput>
}) => {
  switch (true) {
    case Boolean(stateDefinition.ItemsPath):
      return (
        await testSingleState({
          stateDefinition: {
            QueryLanguage: "JSONPath",
            Type: "Pass",
            End: true,
            InputPath: stateDefinition.ItemsPath,
          },
          input,
        })
      ).output

    case Boolean(stateDefinition.Items):
      const { output } = await testSingleState({
        stateDefinition: {
          QueryLanguage: "JSONata",
          Type: "Pass",
          End: true,
          Output: {
            items: stateDefinition.Items,
          },
        },
        input,
      })

      return output && "items" in output ? output.items : []

    default:
      return input
  }
}

const getFunctionInput = async ({
  stateDefinition,
  input,
  item,
  testSingleState,
}: {
  stateDefinition: MapState
  input: TestSingleStateInput["input"]
  item
  testSingleState: (input: TestSingleStateInput) => Promise<TestSingleStateOutput>
}) => {
  if (!stateDefinition.ItemSelector) {
    return item
  }
}

export const testMapState =
  (
    testFunction: (input: TestFunctionInput) => Promise<TestFunctionOutput>,
    testSingleState: (input: TestSingleStateInput) => Promise<TestSingleStateOutput>
  ) =>
  async ({
    stateDefinition,
    input,
  }: {
    stateDefinition: MapState
    input: TestSingleStateInput["input"]
  }): Promise<TestSingleStateOutput> => {
    const items = await getItems({ stateDefinition, input, testSingleState })

    if (!Array.isArray(items)) {
      throw new Error("Input must be an array")
    }

    const itemOutputs = await Promise.all(
      items.map(item =>
        testFunction({
          functionDefinition: { ...stateDefinition.ItemProcessor, QueryLanguage: stateDefinition.QueryLanguage },
          input: item,
        })
      )
    )

    return {
      status: "SUCCEEDED",
      nextState: stateDefinition.Next,
      output: itemOutputs.map(({ output }) => output) as Record<string, unknown>[],
      stack: itemOutputs.map(({ stack }) => stack).flat(),
    }
  }
