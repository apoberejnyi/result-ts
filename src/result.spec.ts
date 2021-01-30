import { Result } from "./result";

describe("Result", () => {
  describe("General", () => {
    it("should provide type-narrowing API", () => {
      const x = Result.val("foo");
      const y = x.ok ? Result.val(x.val + "bar") : Result.err(1);

      expect(y).toEqual({ ok: true, val: "foobar" });
    });
  });

  describe("Do", () => {
    it("should run result", () => {
      const res = Result.do(($) => {
        const x = $(Result.val("foo"));
        const y = $(Result.val("bar"));
        return Result.val(x + y);
      });

      expect(res).toEqual({ ok: true, val: "foobar" });
    });

    it("should short-circuit on errors", () => {
      const spy = jest.fn();

      const res = Result.do(($) => {
        const x = $(Result.val("foo"));
        const y = $(Result.err(1));
        spy();
        return Result.val(x + y);
      });

      expect(res).toEqual({ ok: false, err: 1 });
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
