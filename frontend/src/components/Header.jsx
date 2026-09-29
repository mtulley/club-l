// External
import { NavLink } from "react-router";

// Components

//Styles
import "./styles/Header.css";

export default function Header({ onCartClick }) {
  return (
    <header>
      <div className="container">
        <div className="header-left-side">
          <h3>laurennnnn.zip</h3>
          <nav>
            <ul>
              <li>
                <NavLink to="/">Home</NavLink>
              </li>
              <li>
                <NavLink to="/about">About</NavLink>
              </li>
              <li>
                <NavLink to="/mail-club">Mail Club</NavLink>
              </li>
            </ul>
          </nav>
        </div>
        <div className="header-right-side">
          <a onClick={onCartClick} className="cart-button">
            <img alt="Shopping cart" src="/shopping-cart.svg" />
          </a>
        </div>
      </div>
    </header>
  );
}
