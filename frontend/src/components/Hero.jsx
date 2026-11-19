// External
// Components

// Styles
import "./styles/Hero.css";

import heroImage from "/hero.png";

export default function Hero() {
  return (
    <div className="hero">
      <img src={heroImage} />
      <div className="hero-content container">
        <h3>Welcome to Club/L!</h3>
      </div>
    </div>
  );
}
