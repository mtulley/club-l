// External
import { Link } from "react-router-dom";

// Components

//Styles
import "./styles/Footer.css";

export default function Footer() {
  return (
    <footer>
      <div className="left-side">
        <Link to="/terms-of-service">
          <p>Terms of Service</p>
        </Link>
        <Link to="/privacy-policy">
          <p>Privacy Policy</p>
        </Link>
      </div>
      <div className="social-links">
        <a>
          <img src="/insta.png" />
        </a>
        <a>
          <img src="/tiktok.png" />
        </a>
      </div>
    </footer>
  );
}
