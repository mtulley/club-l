// External
import { Link } from "react-router-dom";

// Components

// Styles
import "./styles/Footer.css";

// Images
import tiktokIcon from "/images/icons/tiktok.png";
import instagramIcon from "/images/icons/insta.png";

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
        <a
          href="https://www.instagram.com/clublprints?vrfl=ZHpmYXMwNXZkbDE4"
          target="_blank"
        >
          <img src={instagramIcon} />
        </a>
        <a>
          <img src={tiktokIcon} />
        </a>
      </div>
    </footer>
  );
}
