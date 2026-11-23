// Components
import Hero from "../../components/Hero/Hero.jsx";
import MailClub from "../../components/MailClub/MailClub.jsx";
import Shop from "../../components/Shop/Shop.jsx";

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
