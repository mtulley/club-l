// External
import { useState, useEffect } from "react";

// Styles
import "./styles/Shop.css";

export default function Shop({ onAddToCart }) {
  const express_url = import.meta.env.VITE_BACKEND_URL;
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${express_url}/api/products`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
      })
      .then(setProducts)
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch products from backend:", error);
        }
      });

    return () => controller.abort();
  }, [express_url]);

  return (
    <div id="shop" className="container shop-container">
      <div className="shop-heading">
        <h3>Shop</h3>
      </div>
      <ul className="shop-items">
        {products.map((product) => (
          <li key={product.id}>
            <img
              src={product.img_url}
              alt={`Image of product titled ${product.title}`}
            ></img>
            <h4>{product.title}</h4>
            <div className="shop-product-purchase">
              <p>{`$${(product.price / 100).toFixed(2)}`}</p>
              <button type="button" onClick={() => onAddToCart(product)}>
                Add to cart
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
