const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
const json = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { ...json(405, { error: "Method not allowed." }), headers: { ...headers, Allow: "POST" } };
  }

  const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.SITE_URL;
  const portalLoginUrl = process.env.STRIPE_CUSTOMER_PORTAL_LOGIN_URL;
  if (!siteUrl || !portalLoginUrl) {
    console.error("Stripe customer portal login URL is not configured.");
    return json(500, { error: "Subscription management is not configured yet. Please try again later." });
  }

  try {
    // Stripe's hosted customer portal login verifies the customer by email,
    // avoiding an unauthenticated email-to-customer lookup in this function.
    const url = new URL(portalLoginUrl);
    if (url.protocol !== "https:" || url.hostname !== "billing.stripe.com") {
      return json(500, { error: "The Stripe customer portal URL is invalid." });
    }
    url.searchParams.set("redirect", new URL("/", siteUrl).toString());
    return json(200, { url: url.toString() });
  } catch (error) {
    console.error("Stripe customer portal URL is invalid:", error.message);
    return json(500, { error: "The Stripe customer portal is not configured correctly." });
  }
}
