import Stripe from "stripe";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

export default async (req) => {
  if (req.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const sessionId = new URL(req.url).searchParams.get("session_id");

  if (!secretKey) {
    console.error("Missing STRIPE_SECRET_KEY.");
    return json({ error: "Order confirmation is temporarily unavailable." }, 500);
  }

  if (!sessionId || !/^cs_(test|live)_/.test(sessionId)) {
    return json({ error: "A valid checkout session is required." }, 400);
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    if (session.mode !== "subscription") {
      return json({ error: "This checkout session is not a subscription." }, 400);
    }

    if (session.status !== "complete" || session.payment_status !== "paid") {
      return json({ status: "processing" }, 202);
    }

    const items = session.line_items?.data ?? [];
    const plan = items.length
      ? items
          .map((item) => item.description)
          .filter(Boolean)
          .join(", ")
      : null;

    return json({
      status: "complete",
      customerEmail: session.customer_details?.email ?? session.customer_email ?? null,
      plan,
    });
  } catch (error) {
    if (error.type === "StripeInvalidRequestError" || error.statusCode === 404) {
      return json({ error: "We could not find that checkout session." }, 404);
    }

    console.error("Unable to retrieve Stripe Checkout Session:", error.message);
    return json({ error: "Unable to confirm checkout. Please try again." }, 502);
  }
};
