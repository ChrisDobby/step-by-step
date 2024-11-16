import { testFunction, mockResponse } from "@chrisdobby/step-by-step"

describe("mock response tests", () => {
  it("should mock a response", async () => {
    const response = {
      ResponseBody: {
        name: "Chris Dobson",
        email: "chrisdobby.dev@gmail.com",
      },
      StatusCode: 200,
      StatusText: "OK",
    }
    mockResponse("State 1", { response })

    const result = await testFunction({
      functionDefinition: {
        StartAt: "State 1",
        States: {
          "State 1": {
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
          },
        },
      },
    })

    expect(result.status).toBe("SUCCEEDED")
    expect(result.stack[0].output).toEqual(response)
  })

  it("should transform a mocked response", async () => {})
})
