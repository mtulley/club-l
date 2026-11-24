// External
import { useState, useEffect } from "react";

// API
import api from "../../api/api.js";

// Components
import ShopItem from "../ShopItem/ShopItem.jsx";

// Styles
import "./Shop.css";

function Shop() {
  const [shopItems, setShopItems] = useState([]);
  const [loadingShopItems, setLoadingShopItems] = useState(true);
  const [errorLoadingShopItems, setErrorLoadingShopItems] = useState(false);

  const LOADING_MESSAGE = "Loading shop items. Please wait a moment...";
  const ERROR_MESSAGE = "Error loading shop items. Please try again later.";

  useEffect(() => {
    async function loadShopItems() {
      try {
        const response = await api.fetchProducts();
        setShopItems(response);
      } catch (error) {
        console.error("API Error: ", error);
        setErrorLoadingShopItems(true);
      } finally {
        setLoadingShopItems(false);
      }
    }

    loadShopItems();
  }, []);

  return (
    <section className="shop container">
      <h3 className="shop__header">Shop</h3>
      {loadingShopItems ? (
        <h4 className="shop__loading-message">{LOADING_MESSAGE}</h4>
      ) : errorLoadingShopItems ? (
        <h4 className="shop__error-message">{ERROR_MESSAGE}</h4>
      ) : (
        <ul className="shop__item-list">
          {shopItems.map((item) => (
            <li key={item.id}>
              <ShopItem item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default Shop;
