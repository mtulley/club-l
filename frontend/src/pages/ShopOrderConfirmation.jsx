// External
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

// Styles
import "./styles/ShopOrderConfirmation.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function ShopOrderConfirmation() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [state, setState] = useState({ status: "loading" });
  const visibleState = sessionId ? state : { status: "invalid" };

  useEffect(() => {
    if (!sessionId) {
      return undefined;
    }

    const controller = new AbortController();
    let cancelled = false;

    async function verifyCheckout() {
      try {
        if (!backendUrl) {
          throw new Error("Order confirmation is not configured.");
        }

        const endpoint = new URL(
          `/api/checkout/sessions/${encodeURIComponent(sessionId)}`,
          backendUrl,
        );
        const response = await fetch(endpoint, {
          signal: controller.signal,
          cache: "no-store",
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Could not verify this order.");
        }
        if (cancelled) return;

        if (data.status === "complete" && data.paymentStatus === "paid") {
          setState({ status: "complete" });
          try {
            window.sessionStorage.removeItem("clubl-shop-cart");
          } catch (storageError) {
            console.error("Could not clear the completed shop cart.", storageError);
          }
          window.dispatchEvent(new Event("clubl:shop-order-complete"));
        } else if (data.status === "expired") {
          setState({ status: "expired" });
        } else {
          setState({ status: "processing" });
        }
      } catch (error) {
        if (cancelled || error.name === "AbortError") return;
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Could not verify this order.",
        });
      }
    }

    verifyCheckout();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [sessionId]);

  const headings = {
    loading: "Confirming your order…",
    complete: "Thank you for your order!",
    processing: "Your payment is processing",
    expired: "This checkout session expired",
    invalid: "No order session found",
    error: "We couldn’t verify your order",
  };

  return (
    <section className="shop-order-confirmation page" aria-live="polite">
      <div className="shop-order-confirmation-card">
        <p className="shop-order-confirmation-eyebrow">CLUB/L PRINT SHOP</p>
        <h1>{headings[visibleState.status]}</h1>
        {visibleState.status === "loading" && (
          <p>We’re confirming your payment securely with Stripe.</p>
        )}
        {visibleState.status === "complete" && (
          <p>Your payment is confirmed. Thanks for supporting Club/L.</p>
        )}
        {visibleState.status === "processing" && (
          <p>
            Stripe is still processing your payment. Please check your email
            for a receipt or come back in a moment.
          </p>
        )}
        {visibleState.status === "expired" && (
          <p>Your payment was not completed. You can return to the shop to try again.</p>
        )}
        {visibleState.status === "invalid" && (
          <p>Open this page from the checkout confirmation link to view your order.</p>
        )}
        {visibleState.status === "error" && (
          <p role="alert">
            {visibleState.message} Check your email for a Stripe receipt if you
            completed payment.
          </p>
        )}
        <Link className="shop-order-confirmation-link" to="/#shop">
          Return to the shop
        </Link>
      </div>
    </section>
  );
}
