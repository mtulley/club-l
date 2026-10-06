// Extneral
import { useState, useEffect } from "react";

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
        <img className="shop-heading" src="/shop.PNG" />
        <ul className="store-grid">
          {storeItems.map((item) => (
            <li key={item.id}>
              <StoreItem item={item} addToCart={() => addToCart(item)} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
