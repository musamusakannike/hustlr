import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { productSchema } from "../validations/commerce.validation";
import { validate } from "../middlewares/validate.middleware";
import { errorHandler } from "../middlewares/error.middleware";

function runValidation(payload: Record<string, unknown>) {
  const req: any = { body: payload };
  let captured: { status: number; body: any } | null = null;
  const res: any = {
    status(code: number) {
      captured = { status: code, body: null };
      return {
        json(body: any) {
          if (captured) captured.body = body;
        },
      };
    },
  };

  const middleware = validate(productSchema, "body");
  let nextCalled = false;
  try {
    middleware(req, res, () => {
      nextCalled = true;
    });
  } catch (err) {
    errorHandler(err, req, res, () => {});
  }

  const out: { status: number; body: any } = captured ?? { status: 200, body: null };
  return { nextCalled, out, req };
}

describe("Product creation validation error messages and mapping", () => {
  it("rejects missing title with user-friendly required message", () => {
    const { nextCalled, out } = runValidation({
      price: 1500,
      stock: 10,
    });

    assert.equal(nextCalled, false);
    assert.equal(out.status, 400);
    assert.equal(out.body.success, false);
    assert.equal(
      out.body.message,
      "Product title is required. Please enter a product title."
    );
    assert.ok(Array.isArray(out.body.details));
    const titleDetail = out.body.details.find((d: any) => d.field === "title");
    assert.ok(titleDetail, "Expected field mapping for title");
    assert.equal(
      titleDetail.message,
      "Product title is required. Please enter a product title."
    );
  });

  it("rejects title with fewer than 2 characters with clear length guidance", () => {
    const { nextCalled, out } = runValidation({
      title: "A",
      price: 1500,
      stock: 10,
    });

    assert.equal(nextCalled, false);
    assert.equal(out.status, 400);
    assert.equal(
      out.body.message,
      "Product title must be at least 2 characters long."
    );
    const titleDetail = out.body.details.find((d: any) => d.field === "title");
    assert.equal(
      titleDetail.message,
      "Product title must be at least 2 characters long."
    );
  });

  it("rejects negative price with clear guidance", () => {
    const { nextCalled, out } = runValidation({
      title: "Ankara Vintage Shirt",
      price: -50,
      stock: 10,
    });

    assert.equal(nextCalled, false);
    assert.equal(out.status, 400);
    assert.equal(
      out.body.message,
      "Price cannot be negative. Please enter 0 or higher."
    );
    const priceDetail = out.body.details.find((d: any) => d.field === "price");
    assert.ok(priceDetail);
    assert.equal(
      priceDetail.message,
      "Price cannot be negative. Please enter 0 or higher."
    );
  });

  it("rejects non-integer stock with whole number guidance", () => {
    const { nextCalled, out } = runValidation({
      title: "Ankara Vintage Shirt",
      price: 5000,
      stock: 3.5,
    });

    assert.equal(nextCalled, false);
    assert.equal(out.status, 400);
    assert.equal(
      out.body.message,
      "Stock quantity must be a whole number."
    );
    const stockDetail = out.body.details.find((d: any) => d.field === "stock");
    assert.ok(stockDetail);
    assert.equal(
      stockDetail.message,
      "Stock quantity must be a whole number."
    );
  });

  it("rejects negative stock with clear guidance", () => {
    const { nextCalled, out } = runValidation({
      title: "Ankara Vintage Shirt",
      price: 5000,
      stock: -2,
    });

    assert.equal(nextCalled, false);
    assert.equal(out.status, 400);
    assert.equal(
      out.body.message,
      "Stock quantity cannot be negative."
    );
  });

  it("successfully passes validation with valid fields", () => {
    const { nextCalled, out, req } = runValidation({
      title: "  Ankara Wrap Dress  ",
      price: 12000,
      stock: 25,
      category: "Dresses",
      status: "active",
    });

    assert.equal(nextCalled, true);
    assert.equal(out.body, null);
    assert.equal(req.body.title, "Ankara Wrap Dress"); // trimmed
    assert.equal(req.body.price, 12000);
    assert.equal(req.body.stock, 25);
  });
});
