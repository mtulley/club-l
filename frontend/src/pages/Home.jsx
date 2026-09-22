// External

// Components
import Hero from "../components/Hero.jsx";
import Store from "../components/Store.jsx";

//Styles
import "./styles/Home.css";

export default function Home({ addToCart }) {
  return (
    <div className="page">
      <Hero />
      <Store addToCart={addToCart} />
    </div>
  );
}
