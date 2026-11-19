// External
import { useState } from "react";

// Components
import Hero from "../components/Hero.jsx";
import MailClubCheckout from "../components/MailClubCheckout.jsx";
import Shop from "../components/Shop.jsx";

// Styles
import "./styles/Home.css";

// Images
import mailClubCollage from "/images/mail-club-collage.png";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const SUBSCRIPTION_SESSION_KEY = "clubl-subscription-checkout-session";

export default function Home({ onAddToCart }) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");

  const openSubscriptionPortal = async () => {
    setPortalLoading(true);
    setPortalError("");

    try {
      if (!backendUrl) {
        throw new Error("Subscription management is not configured.");
      }

      const checkoutSessionId = window.sessionStorage.getItem(
        SUBSCRIPTION_SESSION_KEY,
      );
      if (!checkoutSessionId) {
        throw new Error(
          "To manage your subscription, use the browser where you completed checkout. If you no longer have it, please contact support.",
        );
      }

      const response = await fetch(
        new URL("/api/billing/portal-sessions", backendUrl),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ checkoutSessionId }),
          cache: "no-store",
        },
      );
      if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new Error(
          "The subscription portal is temporarily unavailable. Please try again later.",
        );
      }

      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(
          data.error || "The subscription portal is unavailable right now.",
        );
      }

      const portalUrl = new URL(data.url);
      if (
        portalUrl.protocol !== "https:" ||
        portalUrl.hostname !== "billing.stripe.com"
      ) {
        throw new Error("The billing provider returned an invalid URL.");
      }

      window.location.assign(portalUrl.href);
    } catch (error) {
      setPortalError(
        error instanceof Error
          ? error.message
          : "The subscription portal is unavailable right now.",
      );
      setPortalLoading(false);
    }
  };

  return (
    <div className="page">
      <Hero />
      <div id="mail-club" className="mail-club-container">
        <div className="mail-club-content">
          <div className="mail-club-info">
            <h4>Welcome to my mail club!</h4>
            <p>
              When you subscribe to Club/L you will receive a monthly package
              which includes a 5x7 print, a letter, & sticker(s). All items are
              original and made by me each month.
            </p>
            <button
              className="signup-button"
              type="button"
              onClick={() => setCheckoutOpen(true)}
            >
              Subscribe
            </button>
            <button
              className="manage-subscription-button"
              type="button"
              onClick={openSubscriptionPortal}
              disabled={portalLoading}
            >
              {portalLoading
                ? "Opening subscription portal…"
                : "Manage subscription"}
            </button>
            {portalError && (
              <p className="stripe-error" role="alert">
                {portalError}
              </p>
            )}
            {checkoutOpen && (
              <MailClubCheckout onClose={() => setCheckoutOpen(false)} />
            )}
          </div>
          <div className="mail-club-example">
            <img src={mailClubCollage} alt="Examples of Mail Club artwork" />
          </div>
        </div>
      </div>
      <Shop onAddToCart={onAddToCart} />
    </div>
  );
}
