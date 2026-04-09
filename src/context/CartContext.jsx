import { createContext, useState, useCallback, useMemo, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext";

export const CartContext = createContext();

// ── Per-user localStorage key — guests get null (no persistence)
const getCartKey = (email) => (email ? `cart_${email}` : null);

// ── Safely read a user's cart from localStorage
const loadCart = (email) => {
  const key = getCartKey(email);
  if (!key) return []; // guest — always start empty
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  // ── Since AuthContext reads localStorage synchronously, user is already
  // correct on the very first render — so we can load the right cart immediately
  const [cart, setCart] = useState(() => loadCart(user?.email));

  // ── When user logs in / logs out / switches account → load their cart
  useEffect(() => {
    setCart(loadCart(user?.email));
  }, [user?.email]);

  // ── Persist to localStorage for logged-in users only
  // Guests never write → no bleed between sessions
  useEffect(() => {
    const key = getCartKey(user?.email);
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(cart));
  }, [cart, user?.email]);

  // ── Cart actions ──────────────────────────────────────────────────────────

  const addToCart = useCallback((item) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === item.id);
      if (exists) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const increaseQty = useCallback((id) => {
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + 1 } : i))
    );
  }, []);

  const decreaseQty = useCallback((id) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    const key = getCartKey(user?.email);
    if (key) localStorage.removeItem(key);
  }, [user?.email]);

  const totalPrice = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      increaseQty,
      decreaseQty,
      removeFromCart,
      clearCart,
      totalPrice,
      totalItems,
    }),
    [cart, addToCart, increaseQty, decreaseQty, removeFromCart, clearCart, totalPrice, totalItems]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};