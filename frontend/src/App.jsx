// External
import { Route, Routes } from "react-router-dom";

// Components
import Header from "./components/Header/Header.jsx";
import Footer from "./components/Footer/Footer.jsx";

// Pages
import Home from "./pages/Home/Home.jsx";
import TermsOfService from "./pages/TermsOfService/TermsOfService.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy.jsx";

// Styles
import "./App.css";

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Routes>
          <Route index element={<Home />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
