// External
import { Link } from "react-router-dom";

// Components

// Styles
import "./styles/Hero.css";

import heroImage from "../assets/hero.png";

export default function Hero() {
  return (
    <div className="hero">
      <img src={heroImage} />
      <div className="hero-content container">
        <h3>Monthly original artwork prints</h3>
      </div>
    </div>
  );
}
