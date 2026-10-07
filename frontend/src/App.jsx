// External

// Components
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";

// Pages
import Page from "./pages/Page.jsx";

// Styles
import "./styles/App.css";

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Page />
      </main>
      <Footer />
    </div>
  );
}

export default App;
