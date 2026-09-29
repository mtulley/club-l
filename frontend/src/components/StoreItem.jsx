// External
import { Link } from "react-router-dom";

// Components

//Styles
import "./styles/StoreItem.css";

export default function StoreItem({ item, addToCart }) {
  const { name, image, price } = item;

  return (
    <div className="store-item">
      <Link className="store-link" to={`/store/${item.id}`}>
        <img src={image} alt={name} />
        <div className="store-item-info">
          <h4>{name}</h4>
          <p>${price}</p>
        </div>
      </Link>
      <button onClick={addToCart}>Add To Cart</button>
    </div>
  );
}
