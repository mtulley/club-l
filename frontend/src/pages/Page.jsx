// External
import { useState } from "react";

// Components
import Hero from "../components/Hero.jsx";

//Styles
import "./styles/Page.css";

export default function Page() {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function openStripePage(functionName) {
    setBusy(functionName);
    setError("");
    try {
      const response = await fetch(`/.netlify/functions/${functionName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const result = await response.json();
      if (!response.ok || !result.url) {
        throw new Error(result.error || "Unable to open Stripe right now.");
      }
      window.location.assign(result.url);
    } catch (err) {
      setError(err.message || "Unable to open Stripe right now.");
      setBusy("");
    }
  }

  return (
    <div className="page">
      <Hero />
      <div className="mail-club-container">
        <div className="mail-club-content">
          <div className="mail-club-info">
            <h4>Welcome to my mail club!</h4>
            <p>
              Sign up to recieve monthly artwork packages containing original
              prints, stickers, and more.
              <br />
            </p>
            <button className="signup-button" onClick={() => openStripePage("create-checkout")} disabled={Boolean(busy)}>
              {busy === "create-checkout" ? "Opening checkout…" : "Subscribe"}
            </button>
            <h4>Already a member?</h4>
            <button className="manage-subscription-button" onClick={() => openStripePage("create-portal")} disabled={Boolean(busy)}>
              {busy === "create-portal" ? "Opening portal…" : "Manage Subscription"}
            </button>
            {error && <p role="alert" className="stripe-error">{error}</p>}
          </div>
          <div className="mail-club-example">
            <img src="/mail-club-collage.png" />
          </div>
        </div>
      </div>
    </div>
  );
}
