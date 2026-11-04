import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import "./styles/CheckoutConfirmation.css";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 5;

export default function CheckoutConfirmation() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [state, setState] = useState({ sessionId: null, status: "loading" });
  const visibleState = !sessionId
    ? { status: "invalid" }
    : state.sessionId === sessionId
      ? state
      : { status: "loading" };

  useEffect(() => {
    if (!sessionId) return undefined;

    let cancelled = false;
    let timeoutId;
    let attempts = 0;
    const controller = new AbortController();

    const confirmCheckout = async () => {
      try {
        const response = await fetch(
          `/.netlify/functions/get-checkout-session?session_id=${encodeURIComponent(sessionId)}`,
          { signal: controller.signal, cache: "no-store" },
        );
        const data = await response.json();
        if (cancelled) return;

        if (response.status === 202 && attempts < MAX_POLLS) {
          attempts += 1;
          timeoutId = window.setTimeout(confirmCheckout, POLL_INTERVAL_MS);
          return;
        }

        if (response.ok && data.status === "complete") {
          setState({ sessionId, status: "complete", ...data });
          return;
        }

        if (response.status === 202) {
          setState({ sessionId, status: "processing" });
          return;
        }

        setState({ sessionId, status: "error", message: data.error });
      } catch {
        if (!cancelled) setState({ sessionId, status: "error" });
      }
    };

    confirmCheckout();
    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [sessionId]);

  const isSuccess = visibleState.status === "complete";
  const heading = {
    loading: "Confirming your subscription…",
    complete: "You’re in!",
    processing: "Your payment is processing",
    invalid: "No checkout session found",
    error: "We couldn’t confirm your checkout",
  }[visibleState.status];

  return (
    <section className="checkout-confirmation page" aria-live="polite">
      <div className="checkout-confirmation-card">
        {isSuccess ? (
          <div className="checkout-confirmation-icon" aria-hidden="true">✓</div>
        ) : visibleState.status === "loading" ? (
          <div className="checkout-confirmation-spinner" aria-hidden="true" />
        ) : null}
        <p className="checkout-confirmation-eyebrow">CLUB/L MAIL CLUB</p>
        <h1>{heading}</h1>

        {isSuccess && (
          <>
            <p>
              Thanks for joining! Your subscription is confirmed.
            </p>
            {visibleState.customerEmail && (
              <p>Checkout email: {visibleState.customerEmail}</p>
            )}
            {visibleState.plan && <p className="checkout-confirmation-plan">{visibleState.plan}</p>}
            <p>We can’t wait to send you something lovely in the mail.</p>
          </>
        )}

        {visibleState.status === "loading" && (
          <p>We’re checking your payment with Stripe. This usually takes a moment.</p>
        )}

        {visibleState.status === "processing" && (
          <p>
            Stripe is still processing your payment. If you completed checkout,
            check back here in a moment or look for an update from Stripe.
          </p>
        )}

        {visibleState.status === "invalid" && (
          <p>Open this page from the checkout confirmation link to view your order.</p>
        )}

        {visibleState.status === "error" && (
          <p>
            {visibleState.message ||
              "Please check your email for a Stripe receipt, or contact us if you need help."}
          </p>
        )}

        <Link className="checkout-confirmation-home" to="/">
          Back to Club/L
        </Link>
      </div>
    </section>
  );
}
