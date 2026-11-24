// External
// Components

// Styles
import "./Hero.css";

import heroImage from "/hero.png";

export default function Hero() {
  return (
    <div id="hero">
      <img id="hero__background-image" src={heroImage} />
      <h3 id="hero__text">Welcome to Club/L!</h3>
    </div>
  );
}
