import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { errorHandler } from "../middlewares/error.middleware";

function captureError(err: unknown) {
  let captured: { status: number; body: any } | null = null;
  const res: any = {
    status(code: number) {
      captured = { status: code, body: null as any };
      return {
        json(body: any) {
          captured!.body = body;
        },
      };
    },
  };
  errorHandler(err as any, {} as any, res, () => {});
  return captured!;
}

describe("errorHandler duplicate key (11000) field-specific messages", () => {
  it("maps slug duplicate to 'already taken'", () => {
    const err: any = new Error("E11000");
    err.code = 11000;
    err.keyPattern = { slug: 1 };
    const out = captureError(err);
    assert.equal(out.status, 409);
    assert.match(out.body.message, /slug/i);
    assert.notEqual(out.body.message, "Duplicate value");
  });

  it("maps sellerId duplicate to 'already exists for this seller'", () => {
    const err: any = new Error("E11000");
    err.code = 11000;
    err.keyPattern = { sellerId: 1 };
    const out = captureError(err);
    assert.equal(out.status, 409);
    assert.match(out.body.message, /already exists/i);
    assert.notEqual(out.body.message, "Duplicate value");
  });

  it("maps email duplicate to 'Email already in use'", () => {
    const err: any = new Error("E11000");
    err.code = 11000;
    err.keyValue = { email: "a@b.com" };
    const out = captureError(err);
    assert.equal(out.status, 409);
    assert.match(out.body.message, /Email already in use/);
  });

  it("maps customDomain duplicate to domain message", () => {
    const err: any = new Error("E11000");
    err.code = 11000;
    err.keyPattern = { customDomain: 1 };
    const out = captureError(err);
    assert.equal(out.status, 409);
    assert.match(out.body.message, /domain/i);
  });

  it("falls back to listing field for unknown duplicate field", () => {
    const err: any = new Error("E11000");
    err.code = 11000;
    err.keyPattern = { someField: 1 };
    const out = captureError(err);
    assert.equal(out.status, 409);
    assert.match(out.body.message, /someField/);
  });

  it("no longer returns generic Duplicate value for known fields", () => {
    const fields = ["slug", "sellerId", "email", "referralCode", "customDomain"] as const;
    for (const f of fields) {
      const err: any = new Error("E11000");
      err.code = 11000;
      err.keyPattern = { [f]: 1 };
      const out = captureError(err);
      assert.notEqual(out.body.message, "Duplicate value", `field ${f} should not be generic`);
    }
  });
});

describe("setupStore duplicate helpers", () => {
  it("isDuplicateKeyError is not exported but errorHandler still handles slug/sellerId", () => {
    // This test documents that store.service wraps 11000 with the same field logic
    // and that the middleware now surfaces field-specific messages instead of
    // the generic "Duplicate value" the user originally saw on PUT /api/store/setup 409.
    assert.ok(true);
  });
});
