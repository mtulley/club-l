import Stripe from "stripe";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req) => {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID;
  const siteUrl = process.env.URL;

  if (!secretKey || !priceId || !siteUrl) {
    console.error(
      "Missing STRIPE_SECRET_KEY, STRIPE_PRICE_ID, or Netlify URL.",
    );
    return json({ error: "Checkout is not configured yet." }, 500);
  }

  try {
    const stripe = new Stripe(secretKey);

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded_page",
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      return_url: `${siteUrl}/mail-club?session_id={CHECKOUT_SESSION_ID}`,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB"],
      },
    });

    if (!session.client_secret) {
      console.error("Stripe Checkout Session did not return a client_secret.");
      return json({ error: "Could not start checkout." }, 502);
    }

    return json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error("Unable to create Stripe Checkout Session:", error.message);
    return json({ error: "Unable to start checkout. Please try again." }, 500);
  }
};
