// External

// Components

//Styles
import "./styles/StoreItem.css";

export default function StoreItem({ name, image, price, addToCart }) {
  return (
    <div className="store-item">
      <img src={image} alt={name} />

      <div className="store-item-info">
        <h4>{name}</h4>
        <p>${price}</p>
      </div>

      <button onClick={addToCart}>Add To Cart</button>
    </div>
  );
}
