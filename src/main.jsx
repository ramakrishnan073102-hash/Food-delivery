import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";



const isNewSession = !sessionStorage.getItem("appSession");

if (isNewSession) {
  // ① Mark this tab as active
  sessionStorage.setItem("appSession", "true");

  sessionStorage.removeItem("promoInput");
  sessionStorage.removeItem("promoDiscount");
  sessionStorage.removeItem("promoUsed");

  
  localStorage.removeItem("cart_guest");
}


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);