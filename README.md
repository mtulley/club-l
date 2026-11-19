# Club/L Mail Club

This is an art store ecommerce site that sells artwork prints.

## Visit live site at [club-l.netlify.app](https://club-l.netlify.app)

## Store checkout backend

The Express API creates Stripe-hosted checkout sessions from active product
records in PostgreSQL. It ignores client prices, accepts US shipping only,
offers free shipping, and uses Stripe Tax for tax calculation. Paid orders are
saved from signed Stripe webhooks; apply the migration before enabling checkout:

```powershell
Set-Location backend
Copy-Item .env.example .env
# Fill in the local database settings in .env, then run:
npm run migrate
```

Configure the backend from `backend/.env.example` (use a private production
secret manager for real credentials). Production requires HTTPS for
`FRONTEND_URL`, a live Stripe secret key, the Stripe webhook signing secret,
database credentials, and `DB_SSL=true`. Set `CORS_ORIGINS` to the exact
frontend origins. Configure `TRUST_PROXY_HOPS` only to match the trusted
reverse proxies in front of the API.

The checkout rate limiter uses an in-memory store and is intended for a
single backend instance. Configure a shared rate-limit store before running
multiple API instances.

The subscription portal route accepts only a completed subscription Checkout
Session ID. The confirmation page keeps that ID in the current browser session;
customers who subscribed elsewhere must reopen their successful confirmation
link in that browser. Enable the Stripe Customer Portal in the Stripe dashboard.

Enable Stripe Tax in the Stripe account and configure the account's default
product tax category or assign an appropriate tax category to products. In the
Stripe dashboard, register `POST /api/stripe/webhook` for
`checkout.session.completed` and set its signing secret as
`STRIPE_WEBHOOK_SECRET`. Set the frontend's `VITE_BACKEND_URL` to the deployed
API origin. Do not expose the Stripe secret or webhook secret to the frontend.
The order tables retain customer email and shipping address for fulfillment;
restrict database access and apply an appropriate retention policy. The
current product schema has no stock field, so checkout does not reserve
inventory for limited-run products.
