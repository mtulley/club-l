// External
import { Routes, Route } from "react-router";
import { useState } from "react";

// Components
import Header from "./components/Header.jsx";
import CartSidebar from "./components/CartSidebar.jsx";

// Pages
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import MailClub from "./pages/MailClub.jsx";
import Product from "./pages/Product.jsx";

// Styles
import "./styles/App.css";

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState([]);

  function addToCart(cartItem) {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === cartItem.id);

      if (existingItem) {
      }
    });
  }

  return (
    <div>
      <Header onCartClick={() => setCartOpen(true)} />
      <main>
        <Routes>
          <Route path="/" element={<Home addToCart={addToCart} />} />
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
      />
    </div>
  );
}

export default App;
