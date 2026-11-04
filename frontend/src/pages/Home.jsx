import { useState } from "react";

import Hero from "../components/Hero.jsx";
import MailClubCheckout from "../components/MailClubCheckout.jsx";
import "./styles/Home.css";

export default function Home() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <div className="page">
      <Hero />
      <div className="mail-club-container">
        <div className="mail-club-content">
          <div className="mail-club-info">
            <h4>Welcome to my mail club!</h4>
            <p>
              Sign up for artwork packages containing original prints, stickers,
              and more.
            </p>
            <button
              className="signup-button"
              type="button"
              onClick={() => setCheckoutOpen(true)}
            >
              Subscribe
            </button>
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
