import { testSingleState, testFunction, testSubset } from "@chrisdobby/step-by-step"

it("should execute a wait state", async () => {
  const result = await testSingleState({
    stateDefinition: {
      Type: "Wait",
      Seconds: 300,
      End: true,
    },
  })

  expect(result.status).toBe("SUCCEEDED")
})
