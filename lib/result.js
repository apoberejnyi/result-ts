"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncResult = exports.Result = void 0;
exports.Result = {
    val(val) {
        return { ok: true, val };
    },
    void() {
        return { ok: true, val: undefined };
    },
    err(err) {
        return { ok: false, err };
    },
    all: allResults,
    do: doResult,
};
exports.AsyncResult = {
    async val(val) {
        return { ok: true, val };
    },
    async void() {
        return { ok: true, val: undefined };
    },
    async err(err) {
        return { ok: false, err };
    },
    do: doAsyncResult,
};
function allResults(results) {
    const values = [];
    for (const result of results) {
        if (result.ok) {
            values.push(result.val);
        }
        else {
            return result;
        }
    }
    return exports.Result.val(values);
}
function doResult(callback) {
    try {
        return callback(unwrapResult);
    }
    catch (error) {
        if (error instanceof UnwrapResultError) {
            return exports.Result.err(error.resultError);
        }
        throw error;
    }
}
async function doAsyncResult(callback) {
    try {
        return await callback(unwrapResult);
    }
    catch (error) {
        if (error instanceof UnwrapResultError) {
            return exports.Result.err(error.resultError);
        }
        throw error;
    }
}
function unwrapResult(result) {
    if (result.ok) {
        return result.val;
    }
    throw new UnwrapResultError(result.err);
}
class UnwrapResultError {
    constructor(resultError) {
        this.resultError = resultError;
    }
}
