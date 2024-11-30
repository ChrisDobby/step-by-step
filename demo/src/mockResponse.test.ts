import { testFunction, mockResponse, mockResponseInit, mockResponseTearDown } from "@chrisdobby/step-by-step"

describe("mock response tests", () => {
  beforeAll(mockResponseInit)
  afterAll(mockResponseTearDown)

  const httpTask = {
    Type: "Task",
    Resource: "arn:aws:states:::http:invoke",
    Parameters: {
      ApiEndpoint: "https://67346234723.execute-api.eu-west-1.amazonaws.com/prod/test",
      Method: "GET",
      Authentication: {
        ConnectionArn:
          "arn:aws:events:us-east-2:111111111111:connection/test-api-key/04b89ea4-821b-43c5-a191-2359669b9fc1",
      },
    },
    End: true,
  }

  const httpResponse = {
    ResponseBody: {
      name: "Chris Dobson",
      email: "chrisdobby.dev@gmail.com",
    },
    StatusCode: 200,
    StatusText: "OK",
  }

  it("should mock a response", async () => {
    mockResponse("State 1", { response: httpResponse })

    const result = await testFunction({
      functionDefinition: {
        StartAt: "State 1",
        States: {
          "State 1": httpTask,
        },
      },
    })

    expect(result.status).toBe("SUCCEEDED")
    expect(result.stack[0].output).toEqual(httpResponse)
  })

  it("should set the output of a mocked response", async () => {
    mockResponse("State 1", { response: httpResponse })

    const result = await testFunction({
      functionDefinition: {
        StartAt: "State 1",
        States: {
          "State 1": {
            ...httpTask,
            OutputPath: "$.ResponseBody",
          },
        },
      },
    })

    expect(result.status).toBe("SUCCEEDED")
    expect(result.stack[0].output).toEqual(httpResponse.ResponseBody)
  })

  it("should transform a mocked response", async () => {
    mockResponse("State 1", { response: httpResponse })

    const result = await testFunction({
      functionDefinition: {
        StartAt: "State 1",
        States: {
          "State 1": {
            ...httpTask,
            ResultSelector: {
              "body.$": "$.ResponseBody",
            },
          },
        },
      },
    })

    expect(result.status).toBe("SUCCEEDED")
    expect(result.stack[0].output).toEqual({ body: httpResponse.ResponseBody })
  })

  it("should set ResultPath from mocked response", async () => {
    mockResponse("State 1", { response: httpResponse })

    const result = await testFunction({
      functionDefinition: {
        StartAt: "State 1",
        States: {
          "State 1": {
            ...httpTask,
            ResultPath: "$.mocked",
          },
        },
      },
    })

    expect(result.status).toBe("SUCCEEDED")
    expect(result.stack[0].output).toEqual({ mocked: httpResponse })
  })

  it("should handle all output options set", async () => {
    mockResponse("State 1", { response: httpResponse })

    const result = await testFunction({
      functionDefinition: {
        StartAt: "State 1",
        States: {
          "State 1": {
            ...httpTask,
            ResultSelector: {
              "body.$": "$.ResponseBody",
            },
            ResultPath: "$.mocked",
            OutputPath: "$.mocked.body.name",
          },
        },
      },
    })

    expect(result.status).toBe("SUCCEEDED")
    expect(result.stack[0].output).toEqual(httpResponse.ResponseBody.name)
  })
})
