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

  const portalLoginUrl = process.env.STRIPE_CUSTOMER_PORTAL_LOGIN_URL;
  if (!portalLoginUrl) {
    console.error("Missing STRIPE_CUSTOMER_PORTAL_LOGIN_URL.");
    return json({ error: "The subscription portal is not configured yet." }, 503);
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(portalLoginUrl);
  } catch {
    console.error("STRIPE_CUSTOMER_PORTAL_LOGIN_URL is not a valid URL.");
    return json({ error: "The subscription portal is not configured correctly." }, 500);
  }

  if (
    parsedUrl.protocol !== "https:" ||
    parsedUrl.hostname !== "billing.stripe.com" ||
    !parsedUrl.pathname.startsWith("/p/login/")
  ) {
    console.error("STRIPE_CUSTOMER_PORTAL_LOGIN_URL must be a Stripe portal login link.");
    return json({ error: "The subscription portal is not configured correctly." }, 500);
  }

  return json({ url: parsedUrl.toString() });
};
