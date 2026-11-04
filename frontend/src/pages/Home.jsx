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
