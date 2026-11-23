// Components
import Hero from "../components/Hero.jsx";
import MailClub from "../components/MailClub.jsx";
import Shop from "../components/Shop.jsx";

// Styles
import "./Home.css";

export default function Home() {
  return (
    <div className="page">
      <Hero />
      <MailClub />
      <Shop />
    </div>
  );
}
