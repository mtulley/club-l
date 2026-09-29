// External

// Components

//Styles
import "./styles/CartSidebar.css";

export default function CartSidebar({ open, cart, onClose }) {
  let isEmpty = false;
  if (cart.length == 0) {
    isEmpty = true;
  }

  return (
    <>
      <div className={`cart-overlay ${open ? "open" : ""}`} onClick={onClose} />

      <aside className={`cart-sidebar ${open ? "open" : ""}`}>
        <div className="cart-header">
          <h4>Cart</h4>

          <button className="close-cart-button" onClick={onClose}>
            ×
          </button>
        </div>

        {isEmpty ? (
          <div className="empty-cart">
            <h3>Your cart is empty</h3>
            <p>Add items from the shop and view them here</p>
          </div>
        ) : (
          <ul>{/* Cart items will go here */}</ul>
        )}

        <button className="checkout-button">Check Out</button>
      </aside>
    </>
  );
}
