import { testSingleState, testFunction } from "@chrisdobby/step-by-step"

describe("parallel tests", () => {
  it("should test a parallel state", async () => {
    const result = await testSingleState({
      stateDefinition: {
        Type: "Parallel",
        End: true,
        Branches: [
          {
            StartAt: "State1",
            States: {
              State1: {
                QueryLanguage: "JSONata",
                Type: "Pass",
                Output: { branch: 1 },
                End: true,
              },
            },
          },
          {
            StartAt: "State2",
            States: {
              State2: {
                QueryLanguage: "JSONata",
                Type: "Pass",
                Output: { branch: 2 },
                End: true,
              },
            },
          },
        ],
      },
    })

    expect(result.status).toBe("SUCCEEDED")
    expect(result.output).toEqual([{ branch: 1 }, { branch: 2 }])
    expect(result.stack).toHaveLength(2)
  })

  it("should test a parallel state as part of a function", async () => {
    const result = await testFunction({
      functionDefinition: {
        QueryLanguage: "JSONata",
        StartAt: "ParallelState",
        States: {
          ParallelState: {
            Type: "Parallel",
            Next: "CombineResults",
            Branches: [
              {
                StartAt: "State1",
                States: {
                  State1: {
                    Type: "Pass",
                    Output: { branch: 1 },
                    End: true,
                  },
                },
              },
              {
                StartAt: "State2",
                States: {
                  State2: {
                    Type: "Pass",
                    Output: { branch: 2 },
                    End: true,
                  },
                },
              },
            ],
          },
          CombineResults: {
            Type: "Pass",
            End: true,
            QueryLanguage: "JSONPath",
            Parameters: {
              "output1.$": "$[0]",
              "output2.$": "$[1]",
            },
          },
        },
      },
    })

    expect(result.status).toBe("SUCCEEDED")
    expect(result.stack).toHaveLength(4)
    expect(result.output).toEqual({ output1: { branch: 1 }, output2: { branch: 2 } })
  })
})
