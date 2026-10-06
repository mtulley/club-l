// External
import { Routes, Route } from "react-router";
import { useState } from "react";

// Components
import Header from "./components/Header.jsx";
import CartSidebar from "./components/CartSidebar.jsx";
import Footer from "./components/Footer.jsx";

// Pages
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import MailClub from "./pages/MailClub.jsx";
import Product from "./pages/Product.jsx";
import OnePage from "./pages/OnePage.jsx";

// Styles
import "./styles/App.css";

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);

  function addToCart(item) {
    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (cartItem) => cartItem.id === item.id,
      );

      if (existingItem) {
        return currentCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }

      return [...currentCart, { ...item, quantity: 1 }];
    });
  }

  function incrementCartItem(id) {
    setCart((currentCart) =>
      currentCart.map((cartItem) =>
        cartItem.id === id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem,
      ),
    );
  }

  function decrementCartItem(id) {
    setCart((currentCart) =>
      currentCart
        .map((cartItem) =>
          cartItem.id === id
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem,
        )
        .filter((cartItem) => cartItem.quantity > 0),
    );
  }

  function deleteCartItem(id) {
    setCart((currentCart) =>
      currentCart.filter((cartItem) => cartItem.id !== id),
    );
  }

  return (
    <div className="app">
      <Header onCartClick={() => setCartOpen(true)} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<OnePage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/mail-club" element={<MailClub />} />
          <Route path="/store/:id" element={<Product />} />
        </Routes>
      </main>
      <CartSidebar
        cart={cart}
        open={cartOpen}
        setCartOpen={setCartOpen}
        onClose={() => setCartOpen(false)}
        incrementCartItem={incrementCartItem}
        decrementCartItem={decrementCartItem}
        deleteCartItem={deleteCartItem}
      />
      <Footer />
    </div>
  );
}

export default App;
