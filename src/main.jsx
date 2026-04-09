import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// ─── FRESH SESSION DETECTION ──────────────────────────────────────────────────
// sessionStorage is automatically wiped when the browser tab is closed.
// So if "appSession" is missing → this is a brand new open → clean stale data.
// If "appSession" exists → user is navigating within the same session → do nothing.

const isNewSession = !sessionStorage.getItem("appSession");

if (isNewSession) {
  // ① Mark this tab as active
  sessionStorage.setItem("appSession", "true");

  // ② Wipe promo codes so they never bleed into a new order
  sessionStorage.removeItem("promoInput");
  sessionStorage.removeItem("promoDiscount");
  sessionStorage.removeItem("promoUsed");

  // ③ Remove any guest cart that may have leaked to localStorage
  localStorage.removeItem("cart_guest");
}
// ─────────────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);