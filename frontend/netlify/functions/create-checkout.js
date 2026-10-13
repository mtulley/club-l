import Stripe from "stripe";

const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
const json = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { ...json(405, { error: "Method not allowed." }), headers: { ...headers, Allow: "POST" } };
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.SITE_URL;
  if (!secretKey || !priceId || !siteUrl) {
    console.error("Stripe checkout configuration is incomplete.");
    return json(500, { error: "Checkout is not configured yet. Please try again later." });
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: new URL("/?checkout=success", siteUrl).toString(),
      cancel_url: new URL("/?checkout=cancelled", siteUrl).toString(),
      allow_promotion_codes: true,
    });
    return json(200, { url: session.url });
  } catch (error) {
    console.error("Stripe checkout session creation failed:", error.message);
    return json(502, { error: "Unable to start checkout. Please try again." });
  }
}
