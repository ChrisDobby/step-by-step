import { testFunction, mockState, mockStateOnce, mockStateTimes, resetMocks } from "@chrisdobby/step-by-step"

describe("mock state tests", () => {
  beforeEach(resetMocks)

  it("should mock a state", async () => {
    mockState("State 1", { output: { mocked: true } })
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
    expect(result.stack[0].output).toEqual({ mocked: true })
  })

  it("should mock the next state", async () => {
    mockState("State 1", { output: { mocked: true }, nextState: "State 3" })
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
          "State 3": {
            Type: "Pass",
            End: true,
          },
        },
      },
    })

    expect(result.status).toBe("SUCCEEDED")
    expect(result.stack[0].output).toEqual({ mocked: true })
    expect(result.stack[1].stateName).toEqual("State 3")
  })

  it("should mock a state for the specific number of times", async () => {
    mockStateOnce("State 1", { output: { test: 8 } })
    mockStateTimes(3, "State 1", { output: { test: 9 } })
    mockState("State 1", { output: { test: 11 } })
    const result = await testFunction({
      functionDefinition: {
        StartAt: "State 1",
        States: {
          "State 1": {
            Type: "Pass",
            Next: "Choice",
          },
          Choice: {
            Type: "Choice",
            Choices: [
              {
                Variable: "$.test",
                NumericGreaterThan: 10,
                Next: "State 2",
              },
            ],
            Default: "State 1",
          },
          "State 2": {
            Type: "Pass",
            End: true,
          },
        },
      },
    })

    expect(result.status).toBe("SUCCEEDED")
    expect(result.stack).toHaveLength(11)
    expect(result.stack[0].output).toEqual({ test: 8 })
    expect(result.stack[2].output).toEqual({ test: 9 })
    expect(result.stack[4].output).toEqual({ test: 9 })
    expect(result.stack[6].output).toEqual({ test: 9 })
    expect(result.stack[8].output).toEqual({ test: 11 })
  })

  it("should mock an error", async () => {
    mockState("State 1", { error: { message: "test", cause: "test" } })
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

    expect(result.status).toBe("FAILED")
    expect(result.stack).toHaveLength(1)
  })
})
