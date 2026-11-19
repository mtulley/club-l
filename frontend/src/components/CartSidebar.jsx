// External
import { useEffect } from "react";

// Styles
import "./styles/CartSidebar.css";

export default function CartSidebar({
  items,
  onClose,
  onQuantityChange,
  onRemoveItem,
  isCheckingOut,
  checkoutError,
  onCheckout,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );

  return (
    <div
      className="cart-sidebar-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <aside
        className="cart-sidebar"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-sidebar-title"
      >
        <div className="cart-sidebar-header">
          <h2 id="cart-sidebar-title">Your cart</h2>
          <button
            className="cart-sidebar-close"
            type="button"
            onClick={onClose}
            aria-label="Close cart"
          >
            &times;
          </button>
        </div>

        {items.length === 0 ? (
          <p className="cart-sidebar-empty">Your cart is empty.</p>
        ) : (
          <>
            <ul className="cart-sidebar-items">
              {items.map((item) => (
                <li className="cart-sidebar-item" key={item.id}>
                  <img
                    src={item.img_url}
                    alt={`Image of ${item.title}`}
                    className="cart-sidebar-item-image"
                  />
                  <div className="cart-sidebar-item-details">
                    <h3>{item.title}</h3>
                    <p className="cart-sidebar-item-price">
                      ${(item.price / 100).toFixed(2)}
                    </p>
                    <div className="cart-sidebar-item-actions">
                      <div
                        className="cart-sidebar-quantity"
                        aria-label={`Quantity of ${item.title}`}
                      >
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.title}`}
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            onQuantityChange(item.id, item.quantity - 1)
                          }
                        >
                          &minus;
                        </button>
                        <span aria-live="polite">{item.quantity}</span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.title}`}
                          disabled={item.quantity >= 10}
                          onClick={() =>
                            onQuantityChange(item.id, item.quantity + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="cart-sidebar-remove"
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="cart-sidebar-line-total">
                    ${((item.price * item.quantity) / 100).toFixed(2)}
                  </p>
                </li>
              ))}
            </ul>

            <div className="cart-sidebar-summary">
              <div>
                <span>Subtotal</span>
                <strong>${(subtotal / 100).toFixed(2)}</strong>
              </div>
              <p>Shipping and taxes calculated at checkout.</p>
              {checkoutError && (
                <p className="cart-sidebar-error" role="alert">
                  {checkoutError}
                </p>
              )}
              <button
                className="cart-sidebar-checkout"
                type="button"
                onClick={onCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? "Opening secure checkout…" : "Secure checkout"}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
