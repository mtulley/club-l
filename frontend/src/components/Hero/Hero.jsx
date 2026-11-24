// External
// Components

// Styles
import "./Hero.css";

import heroImage from "/hero.png";

export default function Hero() {
  return (
    <div className="hero">
      <img className="hero__background-image" src={heroImage} />
      <h3 className="hero__text">Welcome to Club/L!</h3>
    </div>
  );
}
