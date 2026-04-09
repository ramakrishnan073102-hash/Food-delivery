import React, {
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { Menu, X, ShoppingCart, LogOut, LogIn, User } from "lucide-react";
import { showAlert } from "../utils/alert";
import Swal from "sweetalert2";
import logo from "../assets/logo/logo.png";

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const { totalItems, clearCart } = useContext(CartContext); // ← use totalItems, not cart.length
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // ── Scroll shadow effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // ── Protected route: redirect to login if not logged in
  const handleProtectedRoute = useCallback(
    (path) => {
      closeMenu();
      if (!user) {
        showAlert({
          title: "Login Required 🔐",
          text: "Please login to continue 😄",
          icon: "warning",
        }).then(() => navigate("/login"));
        return;
      }
      navigate(path);
    },
    [user, navigate, closeMenu]
  );

  // ── Logout with confirmation
  const handleLogout = useCallback(() => {
    closeMenu();
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, logout",
    }).then((res) => {
      if (res.isConfirmed) {
        logout();
        clearCart();
        showAlert({ title: "Logged Out 👋", icon: "success" }).then(() =>
          navigate("/")
        );
      }
    });
  }, [logout, clearCart, navigate, closeMenu]);

  // ── Desktop auth button
  // While loading === true → pulse placeholder (prevents Login/Logout flash)
  const AuthButton = useCallback(() => {
    if (loading) {
      return <div className="w-20 h-9 bg-orange-100 rounded-full animate-pulse" />;
    }
    if (user) {
      return (
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            <User size={13} />
            {user.name}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={() => navigate("/login")}
        className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-sm font-semibold px-4 py-2 rounded-full transition"
      >
        <LogIn size={14} />
        Login
      </button>
    );
  }, [loading, user, handleLogout, navigate]);

  // ── Mobile auth button
  const MobileAuthButton = useCallback(() => {
    if (loading) {
      return <div className="w-full h-10 bg-orange-100 rounded-xl animate-pulse" />;
    }
    if (user) {
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5">
            <User size={15} className="text-orange-500" />
            <span className="text-sm font-semibold text-orange-700">{user.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-left bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm px-4 py-2.5 rounded-xl transition"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      );
    }
    return (
      <div className="flex justify-center">
        <button
          onClick={() => { closeMenu(); navigate("/login"); }}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm px-6 py-2.5 rounded-full transition"
        >                                             
          <LogIn size={15} />
          Login
        </button>
      </div>
    );
  }, [loading, user, handleLogout, navigate, closeMenu]);

  return (
    <nav
      className={`sticky top-0 z-50 flex justify-between items-center px-6 md:px-12 py-3 transition-all duration-300 ${isScrolled ? "bg-white shadow-md" : "bg-white/70 backdrop-blur-lg"
        }`}
    >
      {/* ── LOGO */}
      <Link to="/" className="flex items-center gap-2" onClick={closeMenu}>
        <img src={logo} alt="Hungryhub logo" className="h-12" />
        <span className="text-xl font-bold text-orange-500">Hungryhub</span>
      </Link>

      {/* ── DESKTOP NAV */}
      <div className="hidden md:flex items-center gap-6">
        <Link className="font-bold hover:text-orange-500 transition-colors" to="/">
          Home
        </Link>

        <Link className="font-bold hover:text-orange-500 transition-colors" to="/menu">
          Menu
        </Link>

        <button
          onClick={() => handleProtectedRoute("/deliveryaddress")}
          className="font-bold hover:text-orange-500 transition-colors"
        >
          Address
        </button>

        <Link className="font-bold hover:text-orange-500 transition-colors" to="/terms">
          Terms
        </Link>

        <Link className="font-bold hover:text-orange-500 transition-colors" to="/profile">
          Profile
        </Link>

        {/* Cart button — shows real quantity sum, not item count */}
        <button
          onClick={() => handleProtectedRoute("/cart")}
          className="flex items-center gap-1.5 font-bold hover:text-orange-500 transition-colors relative"
        >
          <ShoppingCart size={18} />
          Cart
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-3 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </button>

        <AuthButton />
      </div>

      {/* ── MOBILE HAMBURGER */}
      <div className="md:hidden flex items-center gap-3">
        {/* Cart icon on mobile header */}


        <button
          onClick={() => handleProtectedRoute("/cart")}
          className="relative p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
        >
          <ShoppingCart size={20} className="text-gray-700" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {totalItems > 9 ? "9+" : totalItems}
            </span>
          )}
        </button>

        <button
          onClick={toggleMenu}
          className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── MOBILE MENU DRAWER */}
      {menuOpen && (
        <div
          className="absolute top-16 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-xl flex flex-col gap-2 px-6 py-5 md:hidden z-50"
          style={{ animation: "slideDown 0.22s ease both" }}
        >
          <Link onClick={closeMenu} to="/"
            className="flex items-center gap-2 font-semibold text-gray-700 hover:text-orange-500 py-2.5 border-b border-gray-100 transition-colors">
            🏠 Home
          </Link>

          <Link onClick={closeMenu} to="/menu"
            className="flex items-center gap-2 font-semibold text-gray-700 hover:text-orange-500 py-2.5 border-b border-gray-100 transition-colors">
            🍽️ Menu
          </Link>

          <button
            onClick={() => handleProtectedRoute("/deliveryaddress")}
            className="flex items-center gap-2 font-semibold text-gray-700 hover:text-orange-500 py-2.5 border-b border-gray-100 transition-colors text-left">
            📍 Address
          </button>

          <Link onClick={closeMenu} to="/terms"
            className="flex items-center gap-2 font-semibold text-gray-700 hover:text-orange-500 py-2.5 border-b border-gray-100 transition-colors">
            📄 Terms
          </Link>

          <Link onClick={closeMenu} to="/profile"
            className="flex items-center gap-2 font-semibold text-gray-700 hover:text-orange-500 py-2.5 border-b border-gray-100 transition-colors">
            👤 Profile
          </Link>

          <button
            onClick={() => handleProtectedRoute("/cart")}
            className="flex items-center justify-between font-semibold text-gray-700 hover:text-orange-500 py-2.5 border-b border-gray-100 transition-colors">
            <span>🛒 Cart</span>
            {totalItems > 0 && (
              <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-bold">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>

          <div className="pt-2">
            <MobileAuthButton />
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;