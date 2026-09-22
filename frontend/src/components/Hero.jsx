// External

// Components

// Styles
import "./styles/Hero.css";

import heroImage from "../assets/hero.png";

export default function Hero() {
  return (
    <div className="hero">
      <img src={heroImage} />
      <div className="hero-content container">
        <h1>Mail Club Name</h1>
        <p>Monthly original artwork prints</p>
        <a href="#">Shop Now</a>
      </div>
    </div>
  );
}
