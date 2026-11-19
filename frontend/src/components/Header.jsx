// External
import { Link } from "react-router-dom";

// Components

//Styles
import "./styles/Header.css";

export default function Header() {
  return (
    <header>
      <div className="container">
        <div className="header-left-side">
          <Link to="/" className="header-logo">
            <img src="/club-l.png" />
          </Link>
        </div>
      </div>
    </header>
  );
}
