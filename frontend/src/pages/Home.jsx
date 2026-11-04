import { useState } from "react";

import Hero from "../components/Hero.jsx";
import MailClubCheckout from "../components/MailClubCheckout.jsx";
import "./styles/Home.css";

export default function Home() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState("");

  const openSubscriptionPortal = async () => {
    setPortalLoading(true);
    setPortalError("");

    try {
      const response = await fetch("/.netlify/functions/customer-portal-link", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error || "The subscription portal is unavailable right now.");
      }

      window.location.assign(data.url);
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
      <div className="mail-club-container">
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
              {portalLoading ? "Opening subscription portal…" : "Manage subscription"}
            </button>
            {portalError && <p className="stripe-error" role="alert">{portalError}</p>}
            {checkoutOpen && (
              <MailClubCheckout onClose={() => setCheckoutOpen(false)} />
            )}
          </div>
          <div className="mail-club-example">
            <img
              src="/mail-club-collage.png"
              alt="Examples of Mail Club artwork"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
