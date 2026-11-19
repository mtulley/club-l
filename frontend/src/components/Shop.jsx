// External
import { useState, useEffect, useCallback } from "react";

// Styles
import "./styles/Shop.css";

async function getProducts(backendUrl, signal) {
  const response = await fetch(`${backendUrl}/api/products`, { signal });
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("The products response was invalid.");
  }

  return data.filter((product) => product?.active);
}

export default function Shop({ onAddToCart }) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loadProducts = useCallback(
    async (signal) => {
      try {
        const products = await getProducts(backendUrl, signal);
        setProducts(products);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch products from backend:", error);
          setLoadError("Shop items are temporarily unavailable. Please try again later.");
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [backendUrl],
  );

  useEffect(() => {
    const controller = new AbortController();
    async function runLoadProducts() {
      await loadProducts(controller.signal);
    }

    runLoadProducts();

    return () => controller.abort();
  }, [loadProducts]);

  return (
    <div id="shop" className="container shop-container">
      <div className="shop-heading">
        <h3>Shop</h3>
      </div>
      {isLoading ? (
        <p className="shop-status" role="status">
          Loading shop items…
        </p>
      ) : loadError ? (
        <p className="shop-status" role="alert">
          {loadError}
        </p>
      ) : products.length === 0 ? (
        <p className="shop-status" role="status">
          No items in the shop right now. Please check back soon.
        </p>
      ) : (
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
      )}
    </div>
  );
}
