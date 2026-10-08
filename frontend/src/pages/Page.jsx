// External

// Components
import Hero from "../components/Hero.jsx";

//Styles
import "./styles/OnePage.css";

export default function Page() {
  return (
    <div className="page">
      <Hero />
      <div className="mail-club-container">
        <div className="mail-club-content">
          <div className="mail-club-info">
            <h4>Welcome to my mail club!</h4>
            <p>
              Sign up to recieve monthly artwork packages containing original
              prints, stickers, and more.
              <br />
            </p>
            <button className="signup-button">
              <img src="/subscribe.png" />
            </button>
            <h4>Already a member?</h4>
            <button className="manage-subscription-button">
              <img src="/manage-subscription.png" />
            </button>
          </div>
          <div className="mail-club-example">
            <img src="/mail-club-collage.png" />
          </div>
        </div>
      </div>
    </div>
  );
}
