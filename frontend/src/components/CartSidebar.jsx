import CartItem from "./CartItem.jsx";

import "./styles/CartSidebar.css";

export default function CartSidebar({
  open,
  cart,
  onClose,
  deleteCartItem,
  incrementCartItem,
  decrementCartItem,
}) {
  const isEmpty = cart.length === 0;

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  );

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
          <ul className="cart-items">
            {cart.map((cartItem) => (
              <CartItem
                key={cartItem.id}
                cartItem={cartItem}
                deleteCartItem={deleteCartItem}
                incrementCartItem={incrementCartItem}
                decrementCartItem={decrementCartItem}
              />
            ))}
          </ul>
        )}

        {!isEmpty && (
          <div className="cart-total">
            <strong>Total:</strong>
            <span>${total.toFixed(2)}</span>
          </div>
        )}

        <button className="checkout-button" disabled={isEmpty}>
          Check Out
        </button>
      </aside>
    </>
  );
}
