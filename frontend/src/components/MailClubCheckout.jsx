import { useCallback, useEffect, useState } from "react";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import "./styles/MailClubCheckout.css";

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

export default function MailClubCheckout({ onClose }) {
  const [error, setError] = useState(
    publishableKey ? "" : "Checkout is not configured yet.",
  );

  const fetchClientSecret = useCallback(async () => {
    setError("");

    try {
      const response = await fetch(
        "/.netlify/functions/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Could not start checkout. Please try again.");
      }

      if (!response.ok || !data.clientSecret) {
        throw new Error(
          data.error || "Could not start checkout. Please try again.",
        );
      }

      return data.clientSecret;
    } catch (checkoutError) {
      const message =
        checkoutError instanceof Error
          ? checkoutError.message
          : "Could not start checkout. Please try again.";
      setError(message);
      throw checkoutError;
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="mail-club-checkout-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className="mail-club-checkout-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Mail Club checkout"
      >
        <button
          className="mail-club-checkout-close"
          onClick={onClose}
          aria-label="Close checkout"
          type="button"
        >
          &times;
        </button>

        {error && <p role="alert">{error}</p>}

        {stripePromise && (
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ fetchClientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        )}
      </section>
    </div>
  );
}
