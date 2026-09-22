// Extneral
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Components
import StoreItem from "./StoreItem";

// Styles
import "./styles/Store.css";

export default function Store({ addToCart }) {
  const [storeItems, setStoreItems] = useState([]);

  const getStoreItems = async () => {
    const url = "http://localhost:3000/store-items";

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      setStoreItems(data);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    getStoreItems();
  }, []);

  return (
    <div className="store">
      <div className="container">
        <h3>Shop</h3>
        <ul className="store-grid">
          {storeItems.map((item) => (
            <li key={item.id}>
              <Link className="store-link" to={`/store/${item.id}`}>
                <StoreItem {...item} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
