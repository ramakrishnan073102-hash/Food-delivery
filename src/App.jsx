import React from "react";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar";
import AppRoutes from "./routes/AppRoutes";
import Footer from "./components/Footer"
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ButtomFooter from "./components/ButtomFooter"
import ScrollToTop from "./components/ScrollToTop"

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>

          <Navbar />
          <AppRoutes />
          <Footer />
          <ButtomFooter/>
          <ScrollToTop/>

        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;