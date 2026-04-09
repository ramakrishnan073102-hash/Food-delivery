import React, { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Menu, ShoppingCart, User } from "lucide-react";
import { CartContext } from "../context/CartContext"; 

const StickyFooter = () => {
  const navigate = useNavigate();


  const { cart } = useContext(CartContext);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const homeRef    = useRef(null);
  const menuRef    = useRef(null);
  const cartRef    = useRef(null);
  const profileRef = useRef(null);

  const [active, setActive] = useState("home");

  const handleNavigation = (route, buttonName) => {
    setActive(buttonName);
    navigate(route);
  };

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-gray-200 shadow-md md:hidden z-50">
      <div className="flex justify-around items-center py-2">

        {/* Home */}
        <button
          ref={homeRef}
          onClick={() => handleNavigation("/", "home")}
          className={`flex flex-col items-center justify-center text-xs gap-0.5 px-4 py-1 ${
            active === "home" ? "text-orange-500" : "text-gray-500"
          }`}
        >
          <Home size={22} />
          <span>Home</span>
        </button>

        {/* Menu */}
        <button
          ref={menuRef}
          onClick={() => handleNavigation("/menu", "menu")}
          className={`flex flex-col items-center justify-center text-xs gap-0.5 px-4 py-1 ${
            active === "menu" ? "text-orange-500" : "text-gray-500"
          }`}
        >
          <Menu size={22} />
          <span>Menu</span>
        </button>

        {/* Cart — badge shows live count */}
        <button
          ref={cartRef}
          onClick={() => handleNavigation("/cart", "cart")}
          className={`relative flex flex-col items-center justify-center text-xs gap-0.5 px-4 py-1 ${
            active === "cart" ? "text-orange-500" : "text-gray-500"
          }`}
        >
          <div className="relative">
            <ShoppingCart size={22} />
            {/* ── Cart count badge  */}
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2.5 min-w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </div>
          <span>Cart</span>
        </button>

        {/* Profile */}
        <button
          ref={profileRef}
          onClick={() => handleNavigation("/profile", "profile")}
          className={`flex flex-col items-center justify-center text-xs gap-0.5 px-4 py-1 ${
            active === "profile" ? "text-orange-500" : "text-gray-500"
          }`}
        >
          <User size={22} />
          <span>Profile</span>
        </button>

      </div>
    </div>
  );
};

export default StickyFooter;