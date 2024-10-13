import { testSingleState, testFunction, testSubset } from "@chrisdobby/step-by-step"

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
    expect(result.stack).toHaveLength(2)
  })

  it("should test a subset of states", async () => {
    const result = await testSubset({
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
            Next: "State 3",
          },
          "State 3": {
            Type: "Pass",
            Next: "State 4",
          },
          "State 4": {
            Type: "Pass",
            End: true,
          },
        },
      },
      startState: "State 2",
      endState: "State 3",
    })

    expect(result.status).toBe("SUCCEEDED")
    expect(result.stack).toHaveLength(2)
  })

  it("should test a function with a choice state", async () => {
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
            Default: "State 3",
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
      input: { test: 11 },
    })

    expect(result.status).toBe("SUCCEEDED")
    expect(result.stack).toHaveLength(3)
    expect(result.stack[1].stateName).toBe("Choice")
    expect(result.stack[2].stateName).toBe("State 2")
  })

  it("should fail the function when a state fails", async () => {
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
            Type: "Task",
            Resource: "arn:aws:states:::dynamodb:getItem",
            Parameters: {
              TableName: "MyDynamoDBTable",
              Key: {
                Column: {
                  S: "MyEntry",
                },
              },
            },
            Next: "State 3",
          },
          "State 3": {
            Type: "Pass",
            End: true,
          },
        },
      },
    })

    expect(result.status).toBe("FAILED")
    expect(result.stack).toHaveLength(2)
  })
})
