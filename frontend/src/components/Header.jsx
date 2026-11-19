// External
import { Link } from "react-router-dom";

// Components

// Styles
import "./styles/Header.css";

// Images
import headerLogo from "/images/club-l.png";

export default function Header({ cartCount, onOpenCart }) {
  return (
    <header>
      <div className="container">
        <div className="header-left-side">
          <Link
            to="/"
            className="header-logo"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img src={headerLogo} />
          </Link>
        </div>
        <nav className="header-nav" aria-label="Main navigation">
          <ul>
            <li>
              <a href="#mail-club">Mail Club</a>
            </li>
            <li>
              <a href="#shop">Shop</a>
            </li>
          </ul>
        </nav>
        <button
          className="header-cart-button"
          type="button"
          onClick={onOpenCart}
          aria-label={`Open cart, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
          aria-haspopup="dialog"
        >
          Cart <span aria-live="polite">{cartCount}</span>
        </button>
      </div>
    </header>
  );
}
