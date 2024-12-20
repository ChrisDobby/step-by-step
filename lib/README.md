# @chrisdobby/step-by-step

![Release workflow](https://github.com/ChrisDobby/step-by-step/actions/workflows/release.yaml/badge.svg)
[![npm version](https://badge.fury.io/js/@chrisdobby%2Fstep-by-step.svg)](https://badge.fury.io/js/@chrisdobby%2Fstep-by-step)

This is the `@chrisdobby/step-by-step` library.

The library allows developers to test full AWS Step Function State Machines or subsets of states using the [TestState API](https://docs.aws.amazon.com/step-functions/latest/apireference/API_TestState.html#:~:text=You%20can%20test%20a%20state,service%20integration%20request%20and%20response).

## Installation

To install the package use

```
npm install @chrisdobby/step-by-step
```

## Getting started

The library uses two environment variables that must be available:

`AWS_ROLE_ARN` - the AWS role to use to execute the states
`AWS_REGION` - the AWS region

The package can be imported using

```typescript
import { testSingleState, testFunction, testSubset } from '@chrisdobby/step-by-step
```

`step-by-step` can test a full State Machine, a single state or a subset of states.

Test a full State Machine by passing the definition json and an optional input:

```typescript
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
  input: { test: "hello" },
})
```

Test a single state passing just the state definition json and an optional input:

```typescript
const result = await testSingleState({
  stateDefinition: { Type: "Pass", Next: "state 2" },
  input: { test: "hello" },
})
```

Test a subset of states by passing the function definition json, start and stop states, and an optional input:

```typescript
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
        End: true,
      },
    },
  },
  input: { test: "hello" },
  startState: "State 1",
  endState: "State 2",
})
```

## API

### testFunction([options]) => Promise&lt;[result]&gt;

#### options

Type: `Object`<br>

Options object

##### functionDefinition

Type: `Object`<br>

JSON definition of an AWS Step Function State Machine

##### input

Type: `Object`<br>
Default: `undefined`

Optional input to pass to the state machine

#### result

Type: `Object`<br>

Test result

##### status

Type: `'SUCCEEDED' | 'FAILED'` <br>
Default: `undefined`

The execution status of the test

##### output

Type: `Object`<br>
Default: `undefined`

The output of the state machine

##### error

Type: `Object`<br>
Default: `undefined`

##### stack

Type: `Array`<br>

Call stack

### testSingleState([options]) => Promise&lt;[result]&gt;

#### options

Type: `Object`<br>

Options object

##### state

Type: `Object`<br>

JSON definition of a single AWS Step Function State

##### input

Type: `Object`<br>
Default: `undefined`

Optional input to pass to the state machine

#### result

Type: `Object`<br>

Test result

##### status

Type: `'SUCCEEDED' | 'FAILED'` <br>
Default: `undefined`

The execution status of the test

##### output

Type: `Object`<br>
Default: `undefined`

The output of the state

##### error

Type: `Object`<br>
Default: `undefined`

##### nextState

Type: `string`<br>
Default: `undefined`

The next state returned

### testSubset([options]) => Promise&lt;[result]&gt;

#### options

Type: `Object`<br>

Options object

##### functionDefinition

Type: `Object`<br>

JSON definition of an AWS Step Function State Machine

##### input

Type: `Object`<br>
Default: `undefined`

Optional input to pass to the state machine

##### startState

Type: `string`<br>

The name of the state to start testing

##### endState

Type: `string`<br>

The name of the state to stop testing

#### result

Type: `Object`<br>

Test result

##### status

Type: `'SUCCEEDED' | 'FAILED'` <br>
Default: `undefined`

The execution status of the test

##### output

Type: `Object`<br>
Default: `undefined`

The output of the state

##### error

Type: `Object`<br>
Default: `undefined`

##### nextState

Type: `string`<br>
Default: `undefined`

The next state returned

### mockState([stateName], [mockedState])

Mocks a state

#### stateName

Type: `string`<br>

Specifies the state that will be mocked.

#### mockedState

Type: `Object`<br>

##### output

Type: `Object`<br>
Default: `undefined`

The output to return from the state

##### error

Type: `Object`<br>
Default: `undefined`

The error to return from the state

### mockStateOnce([stateName], [mockedState])

Mocks a single state execution

#### stateName

Type: `string`<br>

Specifies the state that will be mocked.

#### mockedState

Type: `Object`<br>

##### output

Type: `Object`<br>
Default: `undefined`

The output to return from the state

##### error

Type: `Object`<br>
Default: `undefined`

The error to return from the state

### mockStateTimes([times], [stateName], [mockedState])

Mocks a state execution for the specified number of times

#### times

Type: `number`<br>

The number of executions to mock with the specified state

#### stateName

Type: `string`<br>

Specifies the state that will be mocked.

#### mockedState

Type: `Object`<br>

##### output

Type: `Object`<br>
Default: `undefined`

The output to return from the state

##### error

Type: `Object`<br>
Default: `undefined`

The error to return from the state

### mockResponse([stateName], [mockedResponse])

Mocks a service response

#### stateName

Type: `string`<br>

Specifies the state that will be mocked.

#### mockedResponse

Type: `Object`<br>
Default: `undefined`

##### response

Type: `Object`<br>

The response to return for the service call

### mockResponseOnce([stateName], [mockedResponse])

Mocks a service response once

#### stateName

Type: `string`<br>

Specifies the state that will be mocked.

#### mockedResponse

Type: `Object`<br>
Default: `undefined`

##### response

Type: `Object`<br>

The response to return for the service call

### mockResponseTimes([times], [stateName], [mockedResponse])

Mocks a service response a specified number of times

#### times

Type: `number`<br>

The number of executions to mock with the specified response

#### stateName

Type: `string`<br>

Specifies the state that will be mocked.

#### mockedResponse

Type: `Object`<br>
Default: `undefined`

##### response

Type: `Object`<br>

The response to return for the service call

### mockResponseInit()

Initialises infrstructure required to mock service responses

### mockResponseTearDown()

Tears down infrastructure used to mock service responses

## Demo

The [demo](../demo/) will run a number of tests using vitest. Ensure the environment variables are set and run

```
npm run test
```

This will build the library and run the tests.
