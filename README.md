# Club/L Mail Club

## Visit live site at [club-l.netlify.app](https://club-l.netlify.app)

## Netlify deployment

Connect this repository to Netlify and set the **Base directory** to `frontend` (or use the checked-in `frontend/netlify.toml` settings). Netlify builds the Vite site from `frontend`, publishes `dist`, and deploys the functions from `frontend/netlify/functions`.

Use Node.js 22 or newer. The Stripe functions require no separate server: Netlify runs them as serverless functions.

## Stripe setup

Create one recurring monthly Price in Stripe. The checkout function reads its Price ID from `STRIPE_PRICE_ID`. In Stripe, enable the customer portal, allow customers to cancel subscriptions in the portal configuration, and copy its customer portal login link (the hosted link that asks customers to enter their email and verifies it). Customers can start a new subscription from the Subscribe button after canceling.

Set these environment variables in **Netlify Site configuration → Environment variables**, for production and any deploy contexts where you want payments enabled:

| Variable | Required | Value |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | Yes | Secret key for the Stripe account/mode you are deploying (`sk_live_…` in production, `sk_test_…` for test deploys). Never expose this as a `VITE_` variable. |
| `STRIPE_PRICE_ID` | Yes | The recurring monthly subscription Price ID (`price_…`). |
| `STRIPE_WEBHOOK_SECRET` | Yes, if using the webhook | Signing secret for the Stripe webhook endpoint configured below (`whsec_…`). |
| `STRIPE_CUSTOMER_PORTAL_LOGIN_URL` | Yes | Stripe hosted customer portal login link, usually beginning `https://billing.stripe.com/p/login/…`. Configure the portal in the same account/mode. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Yes | Publishable key for the same Stripe account/mode, used by embedded Checkout in the browser. |
| `SITE_URL` | Only for local development | Canonical absolute site URL, such as `http://localhost:8888` with Netlify CLI. Netlify supplies `URL` automatically on deployed sites; `SITE_URL` is the fallback. |

The Price ID, secret key, publishable key, and webhook signing secret must belong to the same Stripe account and mode (test or live). Do not set `URL` yourself on Netlify; it is a Netlify-provided deploy URL. The checkout function creates an embedded monthly subscription Checkout Session and returns customers to `/checkout/confirmation`. That page verifies the completed session with Stripe on the server before showing a confirmation. The Manage subscription button opens Stripe's hosted customer portal login, which verifies the subscriber's email before allowing them to manage or cancel their subscription. The storefront does not have customer sign-in, so it cannot securely identify a customer for an embedded billing portal session.

In Stripe Workbench, add a webhook endpoint for `https://<your-site-domain>/.netlify/functions/stripe-webhook` and subscribe to `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`, and `invoice.payment_failed`. Store that endpoint's signing secret as `STRIPE_WEBHOOK_SECRET` in Netlify. The webhook verifies and logs these events; it does not store orders or trigger shipping. Orders and renewals are fulfilled manually by reviewing payments and subscriptions in the Stripe Dashboard, so check it regularly and track which shipments have been sent.

For local function development, install Netlify CLI and run `netlify dev` from `frontend`, with the variables above in a local `.env` file there. Keep `.env` out of version control. The storefront itself can build without Stripe keys, but the payment buttons return a configuration error until valid keys are supplied.

## Verify a deploy

Run `npm run lint` and `npm run build` from `frontend`. In the Stripe test mode first, complete a checkout, then use the manage link to confirm the customer can reach the portal. Before launch, use the matching live mode key, Price, and portal login link.
