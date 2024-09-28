import { testSingleState } from "@chrisdobby/step-by-step"

describe("simple tests", () => {
  it("should test a single state", async () => {
    const result = await testSingleState({
      stateDefinition: JSON.stringify({ Type: "Pass", Next: "state 2" }),
    })

    expect(result.status).toBe("SUCCEEDED")
  })
})
