// External
import { Route, Routes } from "react-router-dom";

// Components
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

// Pages
import Home from "./pages/Home.jsx";
import TermsOfService from "./pages/TermsOfService.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import CheckoutConfirmation from "./pages/CheckoutConfirmation.jsx";

// Styles
import "./styles/App.css";

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route index element={<Home />} />
          <Route path="/checkout/confirmation" element={<CheckoutConfirmation />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
