// External

// Components

//Styles
import "./styles/Footer.css";

export default function Footer() {
  return (
    <footer>
      <div className="left-side">
        <p>&copy; 2026</p>
      </div>
      <div className="social-links">
        <a>
          <img src="/insta.png" />
        </a>
        <a>
          <img src="/tiktok.svg" />
        </a>
      </div>
    </footer>
  );
}
