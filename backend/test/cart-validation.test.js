import assert from "node:assert/strict";
import test from "node:test";
import { parseCartItems } from "../src/server.js";

test("accepts a bounded cart and normalizes product IDs", () => {
  assert.deepEqual(
    parseCartItems({ items: [{ productId: 42, quantity: 2 }] }),
    [{ productId: "42", quantity: 2 }],
  );
});

test("rejects client-supplied prices and extra product fields", () => {
  assert.throws(
    () =>
      parseCartItems({
        items: [{ productId: "42", quantity: 1, price: 1 }],
      }),
    { status: 400 },
  );
});

test("rejects duplicate IDs, invalid IDs, and out-of-range quantities", () => {
  assert.throws(
    () =>
      parseCartItems({
        items: [
          { productId: "42", quantity: 1 },
          { productId: "42", quantity: 1 },
        ],
      }),
    /duplicate product IDs/,
  );
  assert.throws(
    () =>
      parseCartItems({
        items: [{ productId: "42 OR 1=1", quantity: 1 }],
      }),
    /invalid product ID/,
  );
  assert.throws(
    () =>
      parseCartItems({
        items: [{ productId: "42", quantity: 11 }],
      }),
    /quantity must be between/,
  );
});

test("rejects carts exceeding the line and item limits", () => {
  assert.throws(
    () =>
      parseCartItems({
        items: Array.from({ length: 31 }, (_, index) => ({
          productId: String(index + 1),
          quantity: 1,
        })),
      }),
    /between 1 and 30/,
  );
  assert.throws(
    () =>
      parseCartItems({
        items: Array.from({ length: 11 }, (_, index) => ({
          productId: String(index + 1),
          quantity: 10,
        })),
      }),
    /cannot contain more than 100/,
  );
});
