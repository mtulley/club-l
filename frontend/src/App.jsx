// External
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

// Components
import CartSidebar from "./components/CartSidebar.jsx";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

// Pages
import Home from "./pages/Home.jsx";
import TermsOfService from "./pages/TermsOfService.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import CheckoutConfirmation from "./pages/CheckoutConfirmation.jsx";
import ShopOrderConfirmation from "./pages/ShopOrderConfirmation.jsx";

// Styles
import "./styles/App.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const CART_STORAGE_KEY = "clubl-shop-cart";

function getSavedCartItems() {
  try {
    const savedItems = JSON.parse(
      window.sessionStorage.getItem(CART_STORAGE_KEY) || "[]",
    );
    if (!Array.isArray(savedItems)) {
      return [];
    }

    return savedItems.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        (typeof item.id === "string" ||
          (Number.isSafeInteger(item.id) && item.id > 0)) &&
        typeof item.title === "string" &&
        Number.isSafeInteger(Number(item.price)) &&
        Number(item.price) > 0 &&
        Number.isSafeInteger(item.quantity) &&
        item.quantity >= 1 &&
        item.quantity <= 10,
    );
  } catch (error) {
    console.error("Could not restore the saved shop cart.", error);
    return [];
  }
}

function App() {
  const [cartItems, setCartItems] = useState(getSavedCartItems);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  useEffect(() => {
    try {
      window.sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Could not save the shop cart.", error);
    }
  }, [cartItems]);

  useEffect(() => {
    function clearCartAfterPayment() {
      setCartItems([]);
    }

    window.addEventListener("clubl:shop-order-complete", clearCartAfterPayment);
    return () =>
      window.removeEventListener(
        "clubl:shop-order-complete",
        clearCartAfterPayment,
      );
  }, []);

  function addToCart(product) {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        if (existingItem.quantity >= 10) {
          return currentItems;
        }
        return currentItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  }

  function changeCartQuantity(productId, quantity) {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId
          ? { ...item, quantity: Math.min(10, Math.max(1, quantity)) }
          : item,
      ),
    );
  }

  function removeFromCart(productId) {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== productId),
    );
  }

  async function startCheckout() {
    setCheckoutError("");

    try {
      if (!backendUrl) {
        throw new Error("Store checkout is not configured.");
      }

      const endpoint = new URL("/api/checkout/sessions", backendUrl);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": window.crypto.randomUUID(),
        },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: String(item.id),
            quantity: item.quantity,
          })),
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch {
        throw new Error("Could not start checkout. Please try again.");
      }

      if (!response.ok || !data.url) {
        throw new Error(
          data.error || "Could not start checkout. Please try again.",
        );
      }

      const checkoutUrl = new URL(data.url);
      if (
        checkoutUrl.protocol !== "https:" ||
        checkoutUrl.hostname !== "checkout.stripe.com"
      ) {
        throw new Error("The checkout provider returned an invalid URL.");
      }

      window.location.assign(checkoutUrl.href);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Could not start checkout. Please try again.",
      );
      setCheckoutPending(false);
    }
  }

  async function handleCheckout() {
    if (checkoutPending || cartItems.length === 0) {
      return;
    }

    setCheckoutPending(true);
    await startCheckout();
  }

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  return (
    <div className="app">
      <Header cartCount={cartCount} onOpenCart={() => setCartOpen(true)} />
      <main className="main-content">
        <Routes>
          <Route
            index
            element={
              <Home onAddToCart={addToCart} />
            }
          />
          <Route path="/checkout/confirmation" element={<CheckoutConfirmation />} />
          <Route
            path="/shop/order-confirmation"
            element={<ShopOrderConfirmation />}
          />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </main>
      {cartOpen && (
        <CartSidebar
          items={cartItems}
          onClose={() => setCartOpen(false)}
          onQuantityChange={changeCartQuantity}
          onRemoveItem={removeFromCart}
          isCheckingOut={checkoutPending}
          checkoutError={checkoutError}
          onCheckout={handleCheckout}
        />
      )}
      <Footer />
    </div>
  );
}

export default App;
