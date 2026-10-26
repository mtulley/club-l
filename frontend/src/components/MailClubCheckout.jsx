import { useCallback, useState } from "react";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js/checkout";
import { loadStripe } from "@stripe/stripe-js";

// VITE_STRIPE_PUBLISHABLE_KEY is public by design. Never put a secret key here.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function MailClubCheckout() {
  const [error, setError] = useState("");

  const fetchClientSecret = useCallback(async () => {
    setError("");
    const response = await fetch(
      "/.netlify/functions/create-checkout-session",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      },
    );

    const data = await response.json();
    if (!response.ok || !data.clientSecret) {
      const message =
        data.error || "Could not start checkout. Please try again.";
      setError(message);
      throw new Error(message);
    }
    return data.clientSecret;
  }, []);

  return (
    <section>
      {error && <p role="alert">{error}</p>}
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ fetchClientSecret }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </section>
  );
}
