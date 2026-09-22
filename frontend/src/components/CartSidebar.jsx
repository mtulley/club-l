// External

// Components

//Styles
import "./styles/CartSidebar.css";

export default function CartSidebar({ open, cart, onClose }) {
  return (
    <>
      <div className={`cart-overlay ${open ? "open" : ""}`} onClick={onClose} />

      <aside className={`cart-sidebar ${open ? "open" : ""}`}>
        <div className="cart-header">
          <h4>Cart</h4>

          <button onClick={onClose}>×</button>
        </div>

        <ul>{/* Cart items will go here */}</ul>

        <button className="checkout-button">Check Out</button>
      </aside>
    </>
  );
}
