import { testSingleState, testFunction } from "@chrisdobby/step-by-step"

describe("map tests", () => {
  it("should test a map state", async () => {
    const result = await testSingleState({
      stateDefinition: {
        Type: "Map",
        End: true,
        ItemProcessor: {
          ProcessorConfig: {
            Mode: "INLINE",
          },
          StartAt: "Pass",
          States: {
            Pass: {
              Type: "Pass",
              End: true,
              Parameters: {
                "inputId.$": "$.id",
              },
            },
          },
        },
      },
      input: [{ id: "item-1" }, { id: "item-2" }],
    })

    expect(result.status).toBe("SUCCEEDED")
    expect(result.output).toEqual([{ inputId: "item-1" }, { inputId: "item-2" }])
    expect(result.stack).toHaveLength(2)
  })

  it("should test a map state with ItemsPath", async () => {
    const result = await testSingleState({
      stateDefinition: {
        Type: "Map",
        End: true,
        ItemProcessor: {
          ProcessorConfig: {
            Mode: "INLINE",
          },
          StartAt: "Pass",
          States: {
            Pass: {
              Type: "Pass",
              End: true,
              Parameters: {
                "inputId.$": "$.id",
              },
            },
          },
        },
        ItemsPath: "$.items",
      },
      input: { items: [{ id: "item-1" }, { id: "item-2" }] },
    })

    expect(result.status).toBe("SUCCEEDED")
    expect(result.output).toEqual([{ inputId: "item-1" }, { inputId: "item-2" }])
    expect(result.stack).toHaveLength(2)
  })

  it("should test a map state with Items", async () => {
    const result = await testSingleState({
      stateDefinition: {
        Type: "Map",
        End: true,
        ItemProcessor: {
          ProcessorConfig: {
            Mode: "INLINE",
          },
          StartAt: "Pass",
          States: {
            Pass: {
              Type: "Pass",
              End: true,
              Parameters: {
                "inputId.$": "$.id",
              },
            },
          },
        },
        Items: "{% $states.input.items %}",
      },
      input: { items: [{ id: "item-1" }, { id: "item-2" }] },
    })

    expect(result.status).toBe("SUCCEEDED")
    expect(result.output).toEqual([{ inputId: "item-1" }, { inputId: "item-2" }])
    expect(result.stack).toHaveLength(2)
  })

  it.only("should test a map state with JSONPath ItemSelector", async () => {
    const result = await testSingleState({
      stateDefinition: {
        QueryLanguage: "JSONPath",
        Type: "Map",
        End: true,
        ItemProcessor: {
          ProcessorConfig: {
            Mode: "INLINE",
          },
          StartAt: "Pass",
          States: {
            Pass: {
              Type: "Pass",
              End: true,
            },
          },
        },
        ItemSelector: { "selector.$": "$.selector" },
        ItemsPath: "$.items",
      },
      input: { items: [{ id: "item-1" }, { id: "item-2" }], selector: "A selector" },
    })

    expect(result.status).toBe("SUCCEEDED")
    expect(result.output).toEqual([{ selector: "A selector" }, { selector: "A selector" }])
    expect(result.stack).toHaveLength(2)
  })
})
