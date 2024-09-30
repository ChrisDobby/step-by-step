import { testSingleState } from "@chrisdobby/step-by-step"
import { testFunction } from "@chrisdobby/step-by-step/dist/testStates"

describe("simple tests", () => {
  it("should test a single state", async () => {
    const result = await testSingleState({
      stateDefinition: { Type: "Pass", Next: "state 2" },
    })

    expect(result.status).toBe("SUCCEEDED")
  })

  it("should test a function", async () => {
    const result = await testFunction({
      functionDefinition: {
        StartAt: "State 1",
        States: {
          "State 1": {
            Type: "Pass",
            Parameters: {
              result: "state1",
            },
            Next: "State 2",
          },
          "State 2": {
            Type: "Pass",
            End: true,
          },
        },
      },
    })

    expect(result.status).toBe("SUCCEEDED")
    console.log(result)
  })
})
