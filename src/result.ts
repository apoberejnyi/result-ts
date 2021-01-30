export type Result<ValueT, ErrorT> =
  | { ok: true; val: ValueT }
  | { ok: false; err: ErrorT };

export type AsyncResult<ValueT, ErrorT> = Promise<Result<ValueT, ErrorT>>;

export const Result = {
  val<ValueT>(val: ValueT): Result<ValueT, never> {
    return { ok: true, val };
  },
  void(): Result<void, never> {
    return { ok: true, val: undefined };
  },
  err<ErrorT>(err: ErrorT): Result<never, ErrorT> {
    return { ok: false, err };
  },

  all: allResults,
  do: doResult,
};

export const AsyncResult = {
  async val<ValueT>(val: ValueT): Promise<Result<ValueT, never>> {
    return { ok: true, val };
  },
  async void(): Promise<Result<void, never>> {
    return { ok: true, val: undefined };
  },
  async err<ErrorT>(err: ErrorT): Promise<Result<never, ErrorT>> {
    return { ok: false, err };
  },
  do: doAsyncResult,
};

function allResults<ValueT1, ValueT2, ErrorT1, ErrorT2>(
  results: [Result<ValueT1, ErrorT1>, Result<ValueT1, ValueT2>]
): Result<[ValueT1, ValueT2], ErrorT1 | ErrorT2>;
function allResults<ValueT1, ValueT2, ValueT3, ErrorT1, ErrorT2, ErrorT3>(
  results: [
    Result<ValueT1, ErrorT1>,
    Result<ValueT1, ErrorT2>,
    Result<ValueT3, ErrorT3>
  ]
): Result<[ValueT1, ValueT2, ValueT3], ErrorT1 | ErrorT2 | ErrorT3>;
function allResults<
  ValueT1,
  ValueT2,
  ValueT3,
  ValueT4,
  ErrorT1,
  ErrorT2,
  ErrorT3,
  ErrorT4
>(
  results: [
    Result<ValueT1, ErrorT1>,
    Result<ValueT1, ErrorT2>,
    Result<ValueT3, ErrorT3>,
    Result<ValueT4, ErrorT4>
  ]
): Result<
  [ValueT1, ValueT2, ValueT3, ValueT4],
  ErrorT1 | ErrorT2 | ErrorT3 | ErrorT4
>;
function allResults<
  ValueT1,
  ValueT2,
  ValueT3,
  ValueT4,
  ValueT5,
  ErrorT1,
  ErrorT2,
  ErrorT3,
  ErrorT4,
  ErrorT5
>(
  results: [
    Result<ValueT1, ErrorT1>,
    Result<ValueT1, ErrorT2>,
    Result<ValueT3, ErrorT3>,
    Result<ValueT4, ErrorT4>,
    Result<ValueT5, ErrorT5>
  ]
): Result<
  [ValueT1, ValueT2, ValueT3, ValueT4, ValueT5],
  ErrorT1 | ErrorT2 | ErrorT3 | ErrorT4 | ErrorT5
>;
function allResults<ValueT1, ErrorT1>(
  results: Result<ValueT1, ErrorT1>[]
): Result<ValueT1[], ErrorT1> {
  const values: ValueT1[] = [];
  for (const result of results) {
    if (result.ok) {
      values.push(result.val);
    } else {
      return result;
    }
  }
  return Result.val(values);
}

function doResult<ValueT, ErrorT>(
  callback: (
    run: <ValueK>(result: Result<ValueK, ErrorT>) => ValueK
  ) => Result<ValueT, ErrorT>
) {
  try {
    return callback(unwrapResult);
  } catch (error) {
    if (error instanceof UnwrapResultError) {
      return Result.err(error.resultError);
    }

    throw error;
  }
}

async function doAsyncResult<ValueT, ErrorT>(
  callback: (
    unwrap: <ValueK>(result: Result<ValueK, ErrorT>) => ValueK
  ) => AsyncResult<ValueT, ErrorT>
) {
  try {
    return await callback(unwrapResult);
  } catch (error) {
    if (error instanceof UnwrapResultError) {
      return Result.err(error.resultError);
    }

    throw error;
  }
}

function unwrapResult<ValueK, ErrorT>(result: Result<ValueK, ErrorT>): ValueK {
  if (result.ok) {
    return result.val;
  }

  throw new UnwrapResultError(result.err);
}

class UnwrapResultError<ErrorT> {
  constructor(public readonly resultError: ErrorT) {}
}
