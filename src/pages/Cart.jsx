import {
  useContext,
  useMemo,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { showAlert } from "../utils/alert";
import Swal from "sweetalert2";
import { Trash2, ShoppingBag, ChevronRight, Tag, Clock } from "lucide-react";

const clearPromoStorage = () => {
  sessionStorage.removeItem("promoInput");
  sessionStorage.removeItem("promoDiscount");
  sessionStorage.removeItem("promoUsed");
};

const Cart = () => {
  const navigate = useNavigate();
  const renderCount = useRef(0);

  const { user } = useAuth();
  const {
    cart,
    increaseQty,
    decreaseQty,
    removeFromCart,
    clearCart,
    totalPrice,
  } = useContext(CartContext);

  const [visible, setVisible] = useState(false);

  const [promoInput, setPromoInput] = useState(() => {
    if (sessionStorage.getItem("promoUsed") === "true") {
      clearPromoStorage();
      return "";
    }
    return sessionStorage.getItem("promoInput") || "";
  });

  const [promoDiscount, setPromoDiscount] = useState(() => {
    if (sessionStorage.getItem("promoUsed") === "true") return 0;
    return Number(sessionStorage.getItem("promoDiscount")) || 0;
  });

  const [promoError, setPromoError] = useState("");

  useEffect(() => {
    renderCount.current += 1;
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (cart.length === 0) {
      clearPromoStorage();
      setPromoInput("");
      setPromoDiscount(0);
      setPromoError("");
    }
  }, [cart.length]);

  const finalTotal = useMemo(() => totalPrice, [totalPrice]);

  const { deliveryFee, platformFee, discount, grandTotal } = useMemo(() => {
    const deliveryFee = finalTotal > 0 ? 40 : 0;
    const platformFee = finalTotal > 0 ? 5 : 0;
    const discount = finalTotal > 0 ? 20 + promoDiscount : 0;
    const grandTotal = finalTotal + deliveryFee + platformFee - discount;
    return { deliveryFee, platformFee, discount, grandTotal };
  }, [finalTotal, promoDiscount]);

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const handleCheckout = useCallback(() => {
    if (!user) {
      showAlert({
        title: "Login Required 🔐",
        text: "Please login to continue",
        icon: "warning",
      }).then(() => navigate("/login"));
      return;
    }
    if (cart.length === 0) {
      showAlert({
        title: "Cart is Empty 😢",
        text: "Add items first",
        icon: "warning",
      });
      return;
    }

    sessionStorage.setItem("promoUsed", "true");

    navigate("/checkout", {
      state: {
        promoCode: promoInput,
        promoDiscount: promoDiscount,
        grandTotal: grandTotal,
      },
    });
  }, [user, cart, navigate, promoInput, promoDiscount, grandTotal]);

  const handleRemove = useCallback(
    (id) => {
      Swal.fire({
        title: "Remove item?",
        text: "This item will be removed from your cart",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, remove",
      }).then((res) => {
        if (res.isConfirmed) removeFromCart(id);
      });
    },
    [removeFromCart]
  );

  const handleClearCart = useCallback(() => {
    Swal.fire({
      title: "Clear entire cart?",
      text: "All items will be removed",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, clear",
    }).then((res) => {
      if (res.isConfirmed) {
        clearCart();
        clearPromoStorage();
        setPromoInput("");
        setPromoDiscount(0);
        setPromoError("");
      }
    });
  }, [clearCart]);

  const topRef = useRef(null);

  useEffect(() => {
    if (renderCount.current > 1) {
      window.scrollTo({ top: 0, behavior: "smooth"});
    }
  }, []);

  const handleApplyPromo = useCallback(() => {
    const code = promoInput.trim().toUpperCase();
    const PROMOS = { HUNGRY50: 50, FIRST100: 100, SAVE30: 30, FOOD70: 70 };
    if (PROMOS[code]) {
      setPromoDiscount(PROMOS[code]);
      setPromoError("");
      sessionStorage.setItem("promoInput", code);
      sessionStorage.setItem("promoDiscount", PROMOS[code]);
    } else {
      setPromoDiscount(0);
      setPromoError("Invalid promo code. Try HUNGRY50");
      sessionStorage.removeItem("promoInput");
      sessionStorage.removeItem("promoDiscount");
    }
  }, [promoInput]);

  const handleRemovePromo = useCallback(() => {
    setPromoInput("");
    setPromoDiscount(0);
    setPromoError("");
    clearPromoStorage();
  }, []);

  const handleContinueShopping = useCallback(() => {
    navigate("/menu");
  }, [navigate]);

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity 0.4s ease, transform 0.4s ease",
      }}
    >
      <div className="bg-linear-to-r from-orange-500 to-orange-400 py-8 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Your Cart 🛒
            </h1>
            <p className="text-orange-100 text-sm mt-1">
              {cart.length === 0
                ? "No items yet"
                : `${totalItems} item${totalItems !== 1 ? "s" : ""} · ₹${finalTotal} subtotal`}
            </p>
          </div>
          <button
            onClick={handleContinueShopping}
            className="flex items-center gap-1.5 text-white text-sm font-semibold border border-white/40 px-4 py-2 rounded-full hover:bg-white/10 transition"
          >
            <ShoppingBag size={16} />
            Add More
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {cart.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-7xl mb-6">🛒</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-400 mb-8">
              Looks like you haven't added anything yet. Let's fix that!
            </p>
            <button
              onClick={handleContinueShopping}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold text-base transition shadow-lg shadow-orange-200"
            >
              Browse Menu 🍔
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500 font-medium">
                  {cart.length} item type{cart.length > 1 ? "s" : ""} in cart
                </p>
                <button
                  onClick={handleClearCart}
                  className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition"
                >
                  <Trash2 size={13} />
                  Clear all
                </button>
              </div>

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="relative shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-xl"
                    />
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-gray-800 text-base truncate">
                      {item.name}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Fresh ingredients · Made to order
                    </p>

                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                      <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                        <button
                          onClick={() => decreaseQty(item.id)}
                          className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 font-bold hover:bg-orange-50 hover:text-orange-500 transition text-lg leading-none"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-bold text-gray-800 text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => increaseQty(item.id)}
                          className="w-7 h-7 rounded-lg bg-orange-500 shadow-sm flex items-center justify-center text-white font-bold hover:bg-orange-600 transition text-lg leading-none"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-extrabold text-gray-800 text-base">
                          ₹{item.price * item.quantity}
                        </p>
                        <p className="text-xs text-gray-400">
                          ₹{item.price} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-gray-300 hover:text-red-400 transition self-start mt-1"
                    title="Remove item"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              ))}

              <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-3 flex items-center gap-3">
                <Clock size={18} className="text-orange-500 shrink-0" />
                <p className="text-sm text-orange-700 font-medium">
                  Estimated delivery: <span className="font-bold">30-40 minutes</span>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Tag size={16} className="text-orange-500" />
                  Promo Code
                </h3>

                {promoDiscount > 0 ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
                    <div>
                      <p className="text-green-700 font-bold text-sm">{promoInput}</p>
                      <p className="text-green-500 text-xs mt-0.5">
                        ✓ You save ₹{promoDiscount} extra
                      </p>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="text-green-400 hover:text-red-400 transition text-xl font-bold leading-none ml-3"
                      title="Remove promo"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => {
                          setPromoInput(e.target.value);
                          setPromoError("");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleApplyPromo()}
                        placeholder="Enter code (e.g. HUNGRY50)"
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 uppercase"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 rounded-xl transition"
                      >
                        Apply
                      </button>
                    </div>
                    {promoError && (
                      <p className="text-red-400 text-xs mt-2">{promoError}</p>
                    )}
                    <p className="text-gray-400 text-xs mt-2">
                      Example: HUNGRY50 for ₹50 off
                    </p>
                  </>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-20">
                <h2 className="text-lg font-extrabold text-gray-800 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-semibold text-gray-800">₹{finalTotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-gray-800">₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Platform Fee</span>
                    <span className="font-semibold text-gray-800">₹{platformFee}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>
                      Discount {promoDiscount > 0 && `+ Promo (${promoInput})`}
                    </span>
                    <span className="font-semibold">- ₹{discount}</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-gray-200 my-4" />

                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-gray-800 text-base">Grand Total</span>
                  <span className="font-extrabold text-orange-500 text-xl">₹{grandTotal}</span>
                </div>

                <p className="text-[10px] text-gray-400 text-center mt-2">
                  Inclusive of all taxes
                </p>

                <button
                  onClick={handleCheckout}
                  className="w-full mt-5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition"
                >
                  Proceed to Checkout
                  <ChevronRight size={18} />
                </button>

                <button
                  onClick={handleContinueShopping}
                  className="w-full mt-2 text-gray-400 hover:text-orange-500 text-sm py-2 transition font-medium"
                >
                  ← Continue Shopping
                </button>

                <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-gray-100">
                  {["🔒 Secure", "🚀 Fast Delivery", "✅ Fresh Food"].map((badge) => (
                    <span key={badge} className="text-[10px] text-gray-400 font-medium">
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
