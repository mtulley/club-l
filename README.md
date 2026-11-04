# Club/L Mail Club

## Visit live site at [club-l.netlify.app](https://club-l.netlify.app)

## Netlify deployment

Connect this repository to Netlify and set the **Base directory** to `frontend` (or use the checked-in `frontend/netlify.toml` settings). Netlify builds the Vite site from `frontend`, publishes `dist`, and deploys the functions from `frontend/netlify/functions`.

Use Node.js 22 or newer. The Stripe functions require no separate server: Netlify runs them as serverless functions.

## Stripe setup

Create recurring Prices in Stripe for the monthly, quarterly, and yearly mail club options. In Stripe, enable the customer portal and copy its customer portal login link (the hosted link that asks customers to enter their email and verifies it).

Set these environment variables in **Netlify Site configuration → Environment variables**, for production and any deploy contexts where you want payments enabled:

| Variable | Required | Value |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | Yes | Secret key for the Stripe account/mode you are deploying (`sk_live_…` in production, `sk_test_…` for test deploys). Never expose this as a `VITE_` variable. |
| `STRIPE_PRICE_ID_MONTHLY` | Yes | Recurring monthly subscription Price ID (`price_…`). |
| `STRIPE_PRICE_ID_QUARTERLY` | Yes | Recurring quarterly subscription Price ID (`price_…`). |
| `STRIPE_PRICE_ID_YEARLY` | Yes | Recurring yearly subscription Price ID (`price_…`). |
| `STRIPE_CUSTOMER_PORTAL_LOGIN_URL` | Yes | Stripe hosted customer portal login link, usually beginning `https://billing.stripe.com/p/login/…`. Configure the portal in the same account/mode. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Yes | Publishable key for the same Stripe account/mode, used by embedded Checkout in the browser. |
| `SITE_URL` | Only for local development | Canonical absolute site URL, such as `http://localhost:8888` with Netlify CLI. Netlify supplies `URL` automatically on deployed sites; `SITE_URL` is the fallback. |

All three Price IDs, the secret key, and the publishable key must belong to the same Stripe account and mode (test or live). Do not set `URL` yourself on Netlify; it is a Netlify-provided deploy URL. The checkout function creates an embedded subscription Checkout Session and returns customers to `/checkout/confirmation`. That page verifies the completed session with Stripe on the server before showing a confirmation. The manage button opens Stripe's hosted portal login, which verifies the subscriber's email before granting access.

For local function development, install Netlify CLI and run `netlify dev` from `frontend`, with the variables above in a local `.env` file there. Keep `.env` out of version control. The storefront itself can build without Stripe keys, but the payment buttons return a configuration error until valid keys are supplied.

## Verify a deploy

Run `npm run lint` and `npm run build` from `frontend`. In the Stripe test mode first, complete a checkout, then use the manage link to confirm the customer can reach the portal. Before launch, use the matching live mode key, Price, and portal login link.
