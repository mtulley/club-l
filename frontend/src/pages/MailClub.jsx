// External

// Components
import Hero from "../components/Hero.jsx";

//Styles
import "./styles/MailClub.css";

export default function MailClub() {
  return (
    <div className="page">
      <Hero />
      <div className="mail-club-container">
        <div className="mail-club-content">
          <div className="mail-club-info">
            <h4>Welcome to the Mail Club!</h4>
            <p>
              Sign up to recieve monthly artwork packages containing original
              prints, stickers, and more.
              <br />
              <br />
              If you like what you see in the example on the right and in the
              shop, consider signing up for the next month's mail club!
            </p>
            <button className="signup-button">Sign up</button>
            <h4>Already a member?</h4>
            <button className="manage-sub-button">Manage Subscription</button>
          </div>
          <div className="mail-club-example">
            <img src="/mail-club-collage.png" />
          </div>
        </div>
      </div>
    </div>
  );
}
