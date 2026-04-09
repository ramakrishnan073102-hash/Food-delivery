import { useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const MenuCard = ({ food }) => {
  const { addToCart, cart } = useContext(CartContext);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [added, setAdded] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const btnRef = useRef(null);

  const formattedPrice = useMemo(() => `₹${food.price}`, [food.price]);

  const cartQty = useMemo(() => {
    const found = cart?.find((c) => c.id === food.id);
    return found ? found.quantity : 0;
  }, [cart, food.id]);

  const tag = useMemo(() => {
    const tags = ["Bestseller", "Chef's Pick", "Popular", "Must Try", "New"];
    return food.id % 3 === 0 ? tags[food.id % tags.length] : null;
  }, [food.id]);

  const handleAdd = useCallback(() => {
    if (!user) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to add items to your cart",
        icon: "warning",
        confirmButtonColor: "#f97316",
        confirmButtonText: "Login Now",
        showCancelButton: true,
        cancelButtonColor: "#6b7280",
        cancelButtonText: "Maybe later",
      }).then((res) => {
        if (res.isConfirmed) navigate("/login");
      });
      return;
    }

    addToCart(food);
    setAdded(true);

    if (btnRef.current) {
      btnRef.current.style.transform = "scale(0.93)";
      setTimeout(() => {
        if (btnRef.current) btnRef.current.style.transform = "scale(1)";
      }, 150);
    }
  }, [user, addToCart, food, navigate]);

  useEffect(() => {
    if (!added) return;
    const timer = setTimeout(() => setAdded(false), 1500);
    return () => clearTimeout(timer);
  }, [added]);

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full border border-gray-100">
      <div className="relative overflow-hidden h-48 bg-gray-100">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        )}

        <img
          src={food.image}
          alt={food.name}
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            imgLoaded ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-black/30 to-transparent" />

        {tag && (
          <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow">
            {tag}
          </span>
        )}

        {user && cartQty > 0 && (
          <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
            {cartQty}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        {food.category && (
          <span className="text-[10px] font-semibold text-orange-500 uppercase tracking-widest mb-1">
            {food.category}
          </span>
        )}

        <h2 className="text-base font-bold text-gray-800 leading-snug line-clamp-2 mb-1">
          {food.name}
        </h2>

        <p className="text-gray-400 text-xs leading-relaxed flex-1">
          Fresh ingredients Made to order
        </p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-xl font-extrabold text-gray-800">{formattedPrice}</p>
            <p className="text-[10px] text-gray-400">incl. taxes</p>
          </div>

          <button
            ref={btnRef}
            onClick={handleAdd}
            style={{ transition: "transform 0.15s ease, background 0.2s ease" }}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm
              ${added
                ? "bg-green-500 shadow-green-200"
                : "bg-orange-500 hover:bg-orange-600 shadow-orange-200 hover:shadow-md"
              }`}
          >
            {added ? (
              <span>Added</span>
            ) : (
              <>
                <span className="text-base leading-none">+</span>
                <span>Add</span>
              </>
            )}
          </button>
        </div>

        {user && cartQty > 0 && (
          <p className="text-[10px] text-green-500 font-semibold mt-2">
            {cartQty} already in your cart
          </p>
        )}

        {!user && (
          <p className="text-[10px] text-gray-400 mt-2">
            Login to save items to cart
          </p>
        )}
      </div>
    </div>
  );
};

export default MenuCard;
