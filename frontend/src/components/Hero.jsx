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
        <h1>Club L</h1>
        <p>Monthly original artwork prints</p>
        <Link to="/mail-club">Visit Mail Club</Link>
      </div>
    </div>
  );
}
