import "dotenv/config";
import { pathToFileURL } from "node:url";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import Stripe from "stripe";
import * as db from "./db.js";

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || process.env.EXPRESS_PORT || 3000);
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const currency = (process.env.STRIPE_CURRENCY || "usd").toLowerCase();
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;
const MAX_CART_LINES = 30;
const MAX_ITEM_QUANTITY = 10;
const MAX_ORDER_QUANTITY = 100;
const MAX_ORDER_TOTAL_CENTS = 99_999_999;

function getFrontendOrigin() {
  let url;

  try {
    url = new URL(frontendUrl);
  } catch {
    throw new Error("FRONTEND_URL must be a valid absolute URL.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("FRONTEND_URL must use HTTP or HTTPS.");
  }

  if (isProduction && url.protocol !== "https:") {
    throw new Error("FRONTEND_URL must use HTTPS in production.");
  }
  if (url.username || url.password) {
    throw new Error("FRONTEND_URL cannot contain credentials.");
  }

  return url.origin;
}

function parseAllowedOrigin(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("CORS_ORIGINS must contain valid absolute origins.");
  }

  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash ||
    (isProduction && url.protocol !== "https:")
  ) {
    throw new Error("CORS_ORIGINS must contain only valid site origins.");
  }

  return url.origin;
}

const frontendOrigin = getFrontendOrigin();
const allowedOrigins = new Set([
  frontendOrigin,
  ...(process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map(parseAllowedOrigin),
]);

if (isProduction) {
  const requiredEnvironment = [
    "DB_HOST",
    "DB_PORT",
    "DB_NAME",
    "DB_USER",
    "DB_PASSWORD",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "FRONTEND_URL",
    "DB_SSL",
    "TRUST_PROXY_HOPS",
  ];
  const missingEnvironment = requiredEnvironment.filter(
    (name) => !process.env[name],
  );

  if (missingEnvironment.length > 0) {
    throw new Error(
      `Missing required production environment: ${missingEnvironment.join(", ")}`,
    );
  }
  if (process.env.DB_SSL !== "true") {
    throw new Error("DB_SSL must be true in production.");
  }
  if (!stripeSecretKey.startsWith("sk_live_")) {
    throw new Error("Production requires a live Stripe secret key.");
  }
  if (!stripeWebhookSecret.startsWith("whsec_")) {
    throw new Error("Production requires a valid Stripe webhook signing secret.");
  }
}

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("EXPRESS_PORT must be a valid TCP port.");
}

if (!/^[a-z]{3}$/.test(currency)) {
  throw new Error("STRIPE_CURRENCY must be a three-letter currency code.");
}

const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0) {
  throw new Error("TRUST_PROXY_HOPS must be a non-negative integer.");
}

app.disable("x-powered-by");
app.set("trust proxy", trustProxyHops);
app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(Object.assign(new Error("Origin is not allowed."), { status: 403 }));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Idempotency-Key", "Stripe-Signature"],
    maxAge: 86400,
  }),
);

const checkoutRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many checkout attempts. Please try again later." },
});

const sessionReadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const billingPortalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

function invalidRequest(message) {
  return Object.assign(new Error(message), { status: 400 });
}

export function parseSubscriptionCheckoutSessionId(body) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).length !== 1 ||
    typeof body.checkoutSessionId !== "string" ||
    !/^cs_(test|live)_[A-Za-z0-9]+$/.test(body.checkoutSessionId)
  ) {
    throw invalidRequest("A valid subscription checkout session is required.");
  }

  return body.checkoutSessionId;
}

export function parseCartItems(body) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).length !== 1 ||
    !Array.isArray(body.items)
  ) {
    throw invalidRequest("Provide a cart with an items array.");
  }

  if (body.items.length < 1 || body.items.length > MAX_CART_LINES) {
    throw invalidRequest(`Cart must contain between 1 and ${MAX_CART_LINES} items.`);
  }

  const seenProductIds = new Set();
  let totalQuantity = 0;

  const items = body.items.map((item) => {
    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item) ||
      Object.keys(item).length !== 2 ||
      !Object.hasOwn(item, "productId") ||
      !Object.hasOwn(item, "quantity")
    ) {
      throw invalidRequest("Each cart item must include only productId and quantity.");
    }

    const productId =
      typeof item.productId === "string"
        ? item.productId
        : Number.isSafeInteger(item.productId) && item.productId > 0
          ? String(item.productId)
          : "";
    if (!/^[A-Za-z0-9_-]{1,64}$/.test(productId)) {
      throw invalidRequest("Cart contains an invalid product ID.");
    }

    if (seenProductIds.has(productId)) {
      throw invalidRequest("Cart cannot contain duplicate product IDs.");
    }
    seenProductIds.add(productId);

    if (
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > MAX_ITEM_QUANTITY
    ) {
      throw invalidRequest(
        `Each product quantity must be between 1 and ${MAX_ITEM_QUANTITY}.`,
      );
    }

    totalQuantity += item.quantity;
    if (totalQuantity > MAX_ORDER_QUANTITY) {
      throw invalidRequest(
        `An order cannot contain more than ${MAX_ORDER_QUANTITY} items.`,
      );
    }

    return { productId, quantity: item.quantity };
  });

  return items;
}

function requireStripe(res) {
  if (!stripe) {
    res.status(503).json({ error: "Checkout is not configured." });
    return false;
  }

  return true;
}

async function savePaidOrder(event) {
  const session = event.data.object;
  if (
    session.metadata?.checkout_type !== "shop_order" ||
    session.mode !== "payment" ||
    session.status !== "complete" ||
    session.payment_status !== "paid"
  ) {
    return;
  }

  const { data: lineItems } = await stripe.checkout.sessions.listLineItems(
    session.id,
    {
      limit: MAX_CART_LINES,
      expand: ["data.price.product"],
    },
  );

  if (lineItems.length === 0 || lineItems.length > MAX_CART_LINES) {
    throw new Error("Paid checkout contains an invalid number of line items.");
  }

  const totalQuantity = lineItems.reduce(
    (total, item) => total + (Number.isSafeInteger(item.quantity) ? item.quantity : 0),
    0,
  );
  if (totalQuantity < 1 || totalQuantity > MAX_ORDER_QUANTITY) {
    throw new Error("Paid checkout contains an invalid total quantity.");
  }

  const shipping = session.shipping_details ||
    session.collected_information?.shipping_details;
  const shippingAddress = shipping?.address
    ? {
        name: shipping.name || null,
        address: {
          line1: shipping.address.line1 || null,
          line2: shipping.address.line2 || null,
          city: shipping.address.city || null,
          state: shipping.address.state || null,
          postal_code: shipping.address.postal_code || null,
          country: shipping.address.country || null,
        },
      }
    : null;
  const customerEmail =
    session.customer_details?.email || session.customer_email || null;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || null;
  const orderCurrency = session.currency?.toLowerCase();
  if (!orderCurrency || !/^[a-z]{3}$/.test(orderCurrency)) {
    throw new Error("Paid checkout has an invalid currency.");
  }

  await db.withTransaction(async (client) => {
    const recordedEvent = await client.query(
      `INSERT INTO stripe_webhook_events (event_id, event_type)
       VALUES ($1, $2)
       ON CONFLICT (event_id) DO NOTHING
       RETURNING event_id`,
      [event.id, event.type],
    );

    if (recordedEvent.rowCount === 0) {
      return;
    }

    const orderResult = await client.query(
      `INSERT INTO shop_orders (
         stripe_checkout_session_id,
         stripe_payment_intent_id,
         customer_email,
         shipping_address,
         fulfillment_status,
         currency,
         amount_subtotal,
         amount_tax,
         amount_shipping,
         amount_total
       )
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (stripe_checkout_session_id) DO NOTHING
       RETURNING id`,
      [
        session.id,
        paymentIntentId,
        customerEmail,
        shippingAddress ? JSON.stringify(shippingAddress) : null,
        shippingAddress ? "unfulfilled" : "needs_review",
        orderCurrency,
        session.amount_subtotal,
        session.total_details?.amount_tax || 0,
        session.total_details?.amount_shipping || 0,
        session.amount_total,
      ],
    );

    if (orderResult.rowCount === 0) {
      return;
    }

    for (const item of lineItems) {
      const quantity = item.quantity;
      const unitAmount = item.price?.unit_amount;
      const title = item.description || "Store product";

      if (
        !Number.isSafeInteger(quantity) ||
        quantity < 1 ||
        !Number.isSafeInteger(unitAmount) ||
        unitAmount < 1 ||
        !Number.isSafeInteger(item.amount_subtotal)
      ) {
        throw new Error("Paid checkout contains an invalid line item.");
      }

      const stripeProduct =
        item.price.product && typeof item.price.product === "object"
          ? item.price.product
          : null;
      const productId = stripeProduct?.metadata?.store_product_id || null;

      await client.query(
        `INSERT INTO shop_order_items (
           order_id,
           stripe_line_item_id,
           product_id,
           product_name,
           quantity,
           unit_amount,
           line_total
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          orderResult.rows[0].id,
          item.id,
          productId,
          title,
          quantity,
          unitAmount,
          item.amount_subtotal,
        ],
      );
    }
  });
}

app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json", limit: "1mb" }),
  async (req, res, next) => {
    if (!stripe || !stripeWebhookSecret) {
      res.status(503).json({ error: "Webhook processing is not configured." });
      return;
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.get("stripe-signature"),
        stripeWebhookSecret,
      );
    } catch {
      res.status(400).json({ error: "Invalid webhook signature." });
      return;
    }

    try {
      if (event.type === "checkout.session.completed") {
        await savePaidOrder(event);
      }
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  },
);

app.use(express.json({ limit: "16kb", strict: true }));

app.post(
  "/api/billing/portal-sessions",
  billingPortalRateLimit,
  async (req, res, next) => {
    let checkoutSessionId;
    try {
      checkoutSessionId = parseSubscriptionCheckoutSessionId(req.body);
    } catch (error) {
      res.status(error.status || 400).json({ error: error.message });
      return;
    }

    if (!requireStripe(res)) {
      return;
    }

    try {
      const checkoutSession =
        await stripe.checkout.sessions.retrieve(checkoutSessionId);
      const customerId =
        typeof checkoutSession.customer === "string"
          ? checkoutSession.customer
          : checkoutSession.customer?.id;

      if (
        checkoutSession.mode !== "subscription" ||
        checkoutSession.status !== "complete" ||
        !["paid", "no_payment_required"].includes(
          checkoutSession.payment_status,
        ) ||
        !checkoutSession.subscription ||
        !customerId
      ) {
        res.status(403).json({
          error: "A completed subscription checkout is required.",
        });
        return;
      }

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: frontendOrigin,
      });

      res.set("Cache-Control", "no-store");
      res.json({ url: portalSession.url });
    } catch (error) {
      if (error.code === "resource_missing") {
        res.status(404).json({
          error: "Subscription checkout session was not found.",
        });
        return;
      }
      next(error);
    }
  },
);

app.get(
  "/api/billing/checkout-sessions/:sessionId",
  sessionReadRateLimit,
  async (req, res, next) => {
    if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(req.params.sessionId)) {
      res.status(400).json({ error: "Invalid checkout session ID." });
      return;
    }

    if (!requireStripe(res)) {
      return;
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(
        req.params.sessionId,
      );
      if (session.mode !== "subscription") {
        res.status(404).json({ error: "Subscription session not found." });
        return;
      }

      res.set("Cache-Control", "no-store");
      if (session.status === "expired") {
        res.status(410).json({ error: "This checkout session has expired." });
        return;
      }

      if (
        session.status !== "complete" ||
        !["paid", "no_payment_required"].includes(session.payment_status)
      ) {
        res.status(202).json({ status: "processing" });
        return;
      }

      res.json({ status: "complete" });
    } catch (error) {
      if (error.code === "resource_missing") {
        res.status(404).json({ error: "Subscription session not found." });
        return;
      }
      next(error);
    }
  },
);

app.get("/api/products", async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT id, title, price, img_url, active
       FROM products
       WHERE active = TRUE
       ORDER BY id`,
    );
    res.set("Cache-Control", "public, max-age=60");
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.get("/api/products/:id", async (req, res, next) => {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(req.params.id)) {
    res.status(400).json({ error: "Invalid product ID." });
    return;
  }

  try {
    const result = await db.query(
      `SELECT id, title, price, img_url, active
       FROM products
       WHERE id::text = $1 AND active = TRUE`,
      [req.params.id],
    );

    if (result.rowCount === 0) {
      res.status(404).json({ error: "Product not found." });
      return;
    }

    res.set("Cache-Control", "public, max-age=60");
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

app.post("/api/checkout/sessions", checkoutRateLimit, async (req, res, next) => {
  let cartItems;
  try {
    cartItems = parseCartItems(req.body);
  } catch (error) {
    res.status(error.status || 400).json({ error: error.message });
    return;
  }

  if (!requireStripe(res)) {
    return;
  }

  const idempotencyKey = req.get("idempotency-key");
  if (
    typeof idempotencyKey !== "string" ||
    !/^[A-Za-z0-9_-]{16,255}$/.test(idempotencyKey)
  ) {
    res.status(400).json({ error: "A valid Idempotency-Key header is required." });
    return;
  }

  try {
    const productIds = cartItems.map((item) => item.productId);
    const result = await db.query(
      `SELECT id::text AS id, title, price
       FROM products
       WHERE active = TRUE AND id::text = ANY($1::text[])`,
      [productIds],
    );

    const productsById = new Map(
      result.rows.map((product) => [String(product.id), product]),
    );
    if (productsById.size !== cartItems.length) {
      res.status(400).json({ error: "One or more cart products are unavailable." });
      return;
    }

    let orderTotal = 0;
    const lineItems = cartItems.map(({ productId, quantity }) => {
      const product = productsById.get(productId);
      const unitAmount = Number(product.price);

      if (
        typeof product.title !== "string" ||
        !product.title.trim() ||
        product.title.length > 200 ||
        !Number.isSafeInteger(unitAmount) ||
        unitAmount < 1 ||
        unitAmount > MAX_ORDER_TOTAL_CENTS
      ) {
        throw Object.assign(new Error("A cart product is not configured for checkout."), {
          status: 409,
        });
      }

      orderTotal += unitAmount * quantity;
      if (orderTotal > MAX_ORDER_TOTAL_CENTS) {
        throw Object.assign(new Error("Cart total exceeds the checkout limit."), {
          status: 400,
        });
      }

      return {
        quantity,
        price_data: {
          currency,
          unit_amount: unitAmount,
          tax_behavior: "exclusive",
          product_data: {
            name: product.title,
            metadata: { store_product_id: productId },
          },
        },
      };
    });

    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card"],
        line_items: lineItems,
        automatic_tax: { enabled: true },
        billing_address_collection: "auto",
        shipping_address_collection: { allowed_countries: ["US"] },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: { amount: 0, currency },
              display_name: "Free shipping",
            },
          },
        ],
        success_url: `${frontendOrigin}/shop/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendOrigin}/#shop`,
        metadata: { checkout_type: "shop_order" },
        payment_intent_data: {
          metadata: { checkout_type: "shop_order" },
        },
      },
      { idempotencyKey },
    );

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    res.status(201).json({ url: session.url });
  } catch (error) {
    if (error.status) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    next(error);
  }
});

app.get(
  "/api/checkout/sessions/:sessionId",
  sessionReadRateLimit,
  async (req, res, next) => {
    if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(req.params.sessionId)) {
      res.status(400).json({ error: "Invalid checkout session ID." });
      return;
    }

    if (!requireStripe(res)) {
      return;
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(
        req.params.sessionId,
      );
      if (
        session.mode !== "payment" ||
        session.metadata?.checkout_type !== "shop_order"
      ) {
        res.status(404).json({ error: "Checkout session not found." });
        return;
      }

      res.set("Cache-Control", "no-store");
      res.json({
        status: session.status,
        paymentStatus: session.payment_status,
        amountTotal: session.amount_total,
        currency: session.currency,
      });
    } catch (error) {
      if (error.code === "resource_missing") {
        res.status(404).json({ error: "Checkout session not found." });
        return;
      }
      next(error);
    }
  },
);

app.use((req, res) => {
  res.status(404).json({ error: "Not found." });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  const status = Number.isInteger(error.status) ? error.status : 500;
  console.error("API request failed", {
    method: req.method,
    route: req.route?.path || "unmatched",
    status,
    message: error.message,
  });

  if (status === 403) {
    res.status(403).json({ error: "Origin is not allowed." });
    return;
  }
  if (status === 400) {
    res.status(400).json({ error: "Invalid request." });
    return;
  }
  if (status === 413) {
    res.status(413).json({ error: "Request body is too large." });
    return;
  }

  res.status(500).json({ error: "Internal server error." });
});

async function startServer() {
  if (isProduction) {
    const result = await db.query(
      `SELECT
         to_regclass('products') AS products,
         to_regclass('shop_orders') AS shop_orders,
         to_regclass('shop_order_items') AS shop_order_items,
         to_regclass('stripe_webhook_events') AS stripe_webhook_events`,
    );
    const missingTables = Object.entries(result.rows[0])
      .filter(([, tableName]) => !tableName)
      .map(([tableName]) => tableName);

    if (missingTables.length > 0) {
      throw new Error(
        `Required database tables are missing: ${missingTables.join(", ")}.`,
      );
    }
  }

  app.listen(port, () => {
    console.log(`Server listening on port ${port}.`);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer().catch(async (error) => {
    console.error("Backend startup failed:", error.message);
    await db.close();
    process.exitCode = 1;
  });
}

export { app };
