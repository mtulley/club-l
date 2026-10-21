
const Stripe = require("stripe");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method not allowed",
    };
  }

  try {
    // The customer must be identified securely before
    // creating a Customer Portal session.
    const { customerId } = JSON.parse(event.body || "{}");

    if (!customerId || typeof customerId !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "A valid customer is required.",
        }),
      };
    }

    // IMPORTANT: In production, verify that the customer
    // belongs to the authenticated user before using this ID.
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.URL,
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (error) {
    console.error("Portal session creation failed:", error.message);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Unable to open subscription management.",
      }),
    };
  }
};
