import Stripe from "stripe";

export const config = {
  // Keep the raw request body available for Stripe signature verification.
  // Netlify Request.text() provides the body as received by the function.
};

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
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    console.error("Missing Stripe secret or webhook signing secret.");
    return json({ error: "Webhook is not configured." }, 500);
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return json({ error: "Missing Stripe signature." }, 400);
  }

  let event;
  try {
    const stripe = new Stripe(secretKey);
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error(
      "Stripe webhook signature verification failed:",
      error.message,
    );
    return json({ error: "Invalid webhook signature." }, 400);
  }

  // This confirms the event is authentic and received. Add durable fulfillment
  // or notification logic before relying on this webhook to ship monthly prints.
  switch (event.type) {
    case "checkout.session.completed":
      console.log("Checkout completed:", event.data.object.id);
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      console.log("Subscription event:", event.type, event.data.object.id);
      break;
    case "invoice.paid":
      console.log("Invoice paid:", event.data.object.id);
      break;
    case "invoice.payment_failed":
      console.log("Invoice payment failed:", event.data.object.id);
      break;
    default:
      console.log("Unhandled Stripe event:", event.type);
  }

  return json({ received: true });
};
