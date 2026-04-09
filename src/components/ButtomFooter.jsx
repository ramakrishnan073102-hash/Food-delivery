import { Link } from "react-router-dom";
import logo from "../assets/logo/logo.png";
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  ArrowUp,
} from "lucide-react";

// ── Ant Design social icons 
import {
  InstagramOutlined,
  XOutlined,
  FacebookOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";

// ─── Static Data  
const QUICK_LINKS = [
  { label: "Home",               to: "/"                },
  { label: "Menu",               to: "/menu"            },
  { label: "Cart",               to: "/cart"            },
  { label: "Checkout",           to: "/checkout"        },
  { label: "Terms & Conditions", to: "/terms"           },
];

const ACCOUNT_LINKS = [
  { label: "Login",              to: "/login"           },
  { label: "Sign Up",            to: "/signup"          },
  { label: "Profile",            to: "/profile"         },
  { label: "Delivery Addresses", to: "/deliveryaddress" },
];

// ── Social links now use Ant Design icon components  
const SOCIAL_LINKS = [
  { icon: InstagramOutlined, href: "https://www.instagram.com/?hl=en", label: "Instagram" },
  { icon: XOutlined,         href: "https://x.com/",                   label: "X"         },
  { icon: FacebookOutlined,  href: "https://www.facebook.com/",        label: "Facebook"  },
  { icon: YoutubeOutlined,   href: "https://www.youtube.com/",         label: "Youtube"   },
];

// ─── Footer Component  
const Footer = () => {
  const logoRef   = useRef(null);
  const footerRef = useRef(null);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [logoVisible, setLogoVisible]     = useState(true);
  const [footerVisible, setFooterVisible] = useState(false);
  const [email, setEmail]                 = useState("");
  const [subscribed, setSubscribed]       = useState(false);

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setFooterVisible(true); observer.disconnect(); } },
      { threshold: 0.05 }
    );
    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleScrollTop   = useCallback(() => window.scrollTo({ top: 0, behavior: "smooth" }), []);
  const handleLogoError   = useCallback(() => setLogoVisible(false), []);
  const handleEmailChange = useCallback((e) => setEmail(e.target.value), []);
  const handleSubscribe   = useCallback((e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  }, [email]);

  return (
    <>
      <footer
        ref={footerRef}
        className="bg-gray-900 text-gray-300"
        style={{
          opacity:    footerVisible ? 1 : 0,
          transform:  footerVisible ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
        }}
      >
        {/* TOP DECORATIVE WAVE */}
        <div className="w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0,30 C360,60 1080,0 1440,30 L1440,0 L0,0 Z" fill="#f97316" opacity="0.15" />
            <path d="M0,40 C480,10 960,70 1440,40 L1440,0 L0,0 Z" fill="#f97316" opacity="0.08" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-10 pt-10 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

            {/* ── BRAND COLUMN  */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-3">
                {logoVisible && (
                  <img
                    ref={logoRef}
                    src={logo}
                    alt="HungryHub Logo"
                    className="h-10 w-auto object-contain"
                    onError={handleLogoError}
                  />
                )}
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  Hungry<span className="text-orange-500">Hub</span>
                </span>
              </Link>

              <p className="text-sm text-gray-400 leading-relaxed">
                Delivering happiness to your doorstep. Fresh food, fast
                delivery, and flavours you'll love — every single time.
              </p>

              {/* ── SOCIAL ICONS — Ant Design   */}
              <div className="flex gap-3 pt-1">
                {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="w-9 h-9 rounded-full bg-gray-800 hover:bg-orange-500 flex items-center justify-center transition-colors duration-200 text-gray-300 hover:text-white"
                  >
                    {/* Ant Design icons are React components — render as JSX */}
                    <Icon style={{ fontSize: 18 }} />
                  </a>
                ))}
              </div>

              {/* Newsletter */}
              <div className="pt-2">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Newsletter</p>
                {subscribed ? (
                  <p className="text-green-400 text-sm font-medium">✅ You're subscribed!</p>
                ) : (
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="your@email.com"
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                    <button
                      type="submit"
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 rounded-lg transition-colors font-semibold"
                    >
                      Join
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* ── QUICK LINKS  */}
            <div>
              <h3 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Quick Links</h3>
              <ul className="space-y-2">
                {QUICK_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-orange-400 transition-colors group">
                      <ChevronRight size={14} className="text-orange-500 opacity-0 group-hover:opacity-100 -ml-1 transition-opacity" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── MY ACCOUNT  */}
            <div>
              <h3 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">My Account</h3>
              <ul className="space-y-2">
                {ACCOUNT_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-orange-400 transition-colors group">
                      <ChevronRight size={14} className="text-orange-500 opacity-0 group-hover:opacity-100 -ml-1 transition-opacity" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── CONTACT  */}
            <div>
              <h3 className="text-white font-bold mb-4 uppercase tracking-widest text-xs">Contact Us</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-start gap-3">
                  <MapPin size={16} className="text-orange-500 mt-0.5 shrink-0" />
                  <span>123 Food Street, Koramangala, Bengaluru – 560034</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-orange-500 shrink-0" />
                  <a href="tel:+919876543210" className="hover:text-orange-400 transition-colors">+91 98765 43210</a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-orange-500 shrink-0" />
                  <a href="mailto:support@hungryhub.in" className="hover:text-orange-400 transition-colors">support@hungryhub.in</a>
                </li>
              </ul>

              <div className="mt-5">
                <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Download App</p>
                <div className="flex gap-2 flex-wrap">
                  <span className="text-xs bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg text-gray-300 hover:border-orange-500 hover:text-white cursor-pointer transition-colors">
                    🍎 App Store
                  </span>
                  <span className="text-xs bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg text-gray-300 hover:border-orange-500 hover:text-white cursor-pointer transition-colors">
                    🤖 Google Play
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── BOTTOM BAR   */}
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-500">
            <p>
              © {currentYear}{" "}
              <span className="text-orange-400 font-semibold"><a href="/" className="hover:text-orange-400 transition-colors">HungryHub</a></span>. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link to="/terms" className="hover:text-orange-400 transition-colors">Terms</Link>
              <span className="text-gray-700">|</span>
              <a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a>
              <span className="text-gray-700">|</span>
              <a href="#" className="hover:text-orange-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ── BACK TO TOP */}
      {showScrollTop && (
        <button
          onClick={handleScrollTop}
          aria-label="Back to top"
          className="fixed bottom-17 right-6 z-50 w-11 h-11  bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300"
          style={{ animation: "fadeInUp 0.3s ease" }}
        >
          <ArrowUp size={20} />
        </button>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </>
  );
};

export default Footer;