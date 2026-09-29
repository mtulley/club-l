import "./styles/CartItem.css";

export default function CartItem({
  cartItem,
  deleteCartItem,
  incrementCartItem,
  decrementCartItem,
}) {
  const { id, name, image, price, quantity } = cartItem;

  return (
    <li className="cart-item">
      <img src={image} alt={name} />

      <div className="cart-item-info">
        <h5>{name}</h5>
        <p>${Number(price).toFixed(2)}</p>
      </div>

      <div className="cart-item-controls">
        <button className="arrow-button" onClick={() => incrementCartItem(id)}>
          &uarr;
        </button>

        <span>{quantity}</span>

        <button className="arrow-button" onClick={() => decrementCartItem(id)}>
          &darr;
        </button>
      </div>

      <button
        className="delete-button"
        onClick={() => deleteCartItem(id)}
        aria-label={`Remove ${name}`}
      >
        &#x1F5D1;
      </button>
    </li>
  );
}
