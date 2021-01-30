# Result-TS

Type-safe modelling of errors with a very simple API.

## Philosophy

Explicit typings for error cases is a powerful tool for better-quality code.
It allows for better understanding of the problem domain and it's edge-cases, without referring to the documentation.

There are multiple popular TypeScript libraries that provide monadic structures from functional programming.
One of these monads, `Either`, is commonly used for error handling.
However, you might not want to learn the Either monad and a whole lot of functional programming paradigms,
if all you need are error signatures in your code.
And if your codebase is written in OOP-style, `Either` might not fit at all.

The goal of this library, is to provide a _TypeScript-ideomatic error-handling API that is easy to understand for developers with different skill levels_. Functior, monad etc. functions are not provided on purpose. If you prefer to have a full FP-experience, this library is not the best choise.
The design is primarily inspired by Golang.

## Basic API

Library provides two generic types: `Result` and `AsyncResult` (the same, but wrapped in Promise).
First type argument is the success value, the second one is error value.

With `result-ts`, you should not `throw` errors that occur in your program.
Instead, you wrap them in `Result.err` and `return`.
Success cases should are in `Result.val`:

```typescript
function reserveRestaurantTable(
  date: Date,
  peopleCount: number
): AsyncResult<Reservation, NoSeatsAvailable> {
  // ...some code here
  if (reservation) {
    return Result.val(reservation);
  } else {
    return Result.err(new NoSeatsAvailable(date));
  }
}

function displayReservationResult(
  result: Result<Reservation, NoSeatsAvailable>
): void {
  if (result.ok) {
    const reservation = result.val;
    // result.err is not available here
    console.log(`Got reservation ${reservation.id}`);
  } else {
    const error = result.err;
    // result.val is not available here
    console.log(`Got error: ${error.message}`);
  }
}
```

## Do-notation API

For combining multiple functions that might fail, there's a `do` utility available.
This is similar async/await for Promises and to do-notation from Haskell.

```typescript
// Functions that might fail

function getNamePrefix(
  user: User,
  format: Format
): Result<string, UnknownFormat> {
  return Result.val("Mr.");
}

function getFirstName(
  user: User,
  format: Format
): Result<string, UnknownFormat> {
  return Result.val("John");
}

function getLastName(
  user: User,
  format: Format
): Result<string, UnknownFormat> {
  return Result.val("Doe");
}

// A function that combines everything together

function getFormattedName(
  user: User,
  format: Format
): Result<string, UnknownFormat> {
  return Result.do(($) => {
    const prefix: string = $(getNamePrefix());
    const firstName: string = $(getFirstName());
    const lastName: string = $(getLastName());
    return Result.val(prefix + " " + firstName + " " + lastName);
  });
}
```

Do notation short-circuits in case of error, just like exceptions:

```typescript
function createUser(
  unvalidatedUser: UnvalidatedUser
): AsyncResult<void, UserValidationError> {
  // Note that we are using AsyncResult here
  return AsyncResult.do(async ($) => {
    const user: User = $(await validateUser(unvalidatedUser));
    // Will not save the user if validation fails
    return db.saveUser(user);
  });
}
```

## Result.all

Just like with Promise.all, you can _sequence_ multiple results together:

```typescript
const results = [Result.val(1), Result.val(2), Result.val(3)];
const result = Result.all(results); // equals to Result.val([1, 2, 3])
```

## TODO

- publish to npm
- 100% test coverage
- .all for AsyncResult
- document all exposed functions
