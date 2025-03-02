import {
  ParallelState,
  TestSingleStateInput,
  TestSingleStateOutput,
  TestFunctionInput,
  TestFunctionOutput,
} from "./types"

export const testParallelState =
  (testFunction: (input: TestFunctionInput) => Promise<TestFunctionOutput>) =>
  async ({
    stateDefinition,
    input,
  }: {
    stateDefinition: ParallelState
    input: TestSingleStateInput["input"]
  }): Promise<TestSingleStateOutput> => {
    const branchOutputs = await Promise.all(
      (stateDefinition as ParallelState).Branches.map(branch =>
        testFunction({ functionDefinition: { ...branch, QueryLanguage: stateDefinition.QueryLanguage }, input })
      )
    )

    return {
      status: "SUCCEEDED",
      nextState: stateDefinition.Next,
      output: branchOutputs.map(({ output }) => output) as Record<string, unknown>[],
      stack: branchOutputs.map(({ stack }) => stack).flat(),
    }
  }
