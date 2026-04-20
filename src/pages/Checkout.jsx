import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import logo from "../assets/logo/logo.png"
import {
  MapPin, Phone, User, Home, Briefcase,
  CheckCircle, ChevronRight, ShieldCheck, Clock,
} from "lucide-react";
import { Steps, ConfigProvider } from "antd";
import {
  ShoppingCartOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";

// ─── Razorpay 
const RAZORPAY_KEY_ID = "rzp_test_SfeLlF57PYZ7bE";
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src     = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const ORDER_SUMMARY_KEY = "orderSummary";
const ORDER_HISTORY_KEY = "orderHistory";
const orderHistoryKey   = (email) => `orderHistory_${email}`;
const addressKey        = (email) => `deliveryAddresses_${email}`;

const CheckoutSchema = Yup.object().shape({
  name:    Yup.string().min(2, "Too short").required("Name is required"),
  phone:   Yup.string().matches(/^[0-9]{10}$/, "Enter valid 10-digit number").required("Phone is required"),
  address: Yup.string().min(10, "Enter full address").required("Address is required"),
  city:    Yup.string().required("City is required"),
  pincode: Yup.string().matches(/^[0-9]{6}$/, "Enter valid 6-digit pincode").required("Pincode is required"),
});

const generateOrderId = () =>
  "ORD-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();

const antTheme = {
  token: { colorPrimary: "#f97316", borderRadius: 10 },
  components: {
    Steps: {
      colorPrimary: "#f97316", finishIconBorderColor: "#22c55e",
      colorTextDescription: "rgba(255,255,255,0.7)", colorText: "#ffffff",
      colorSplit: "rgba(255,255,255,0.3)",
    },
  },
};

const paymentLabel = (method) =>
  method === "cod"  ? "Cash on Delivery"
  : method === "upi"  ? "UPI / GPay"
  : method === "card" ? "Credit / Debit Card"
  : method;

const showOrderSuccessPopup = (orderId, grandTotal, payMethod, customerName) => {
  const methodIcons = { cod: "💵", upi: "📱", card: "💳" };
  const icon   = methodIcons[payMethod] || "💳";
  const isPaid = payMethod !== "cod";

  return Swal.fire({
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:8px 0;">
        <div style="width:88px;height:88px;border-radius:50%;background:linear-gradient(135deg,#22c55e,#16a34a);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;box-shadow:0 8px 32px rgba(34,197,94,0.35);animation:popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h2 style="font-size:24px;font-weight:800;color:#111827;margin:0 0 6px;letter-spacing:-0.5px;animation:fadeUp 0.4s 0.15s ease both;">Order Placed! 🎉</h2>
        <p style="color:#6b7280;font-size:14px;margin:0 0 24px;animation:fadeUp 0.4s 0.22s ease both;">Your food is being prepared and will arrive soon</p>
        <div style="background:#f9fafb;border:1px solid #f3f4f6;border-radius:16px;padding:16px;margin-bottom:16px;animation:fadeUp 0.4s 0.3s ease both;text-align:left;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <span style="font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Order ID</span>
            <span style="font-size:13px;font-weight:700;color:#374151;background:#fff;border:1px solid #e5e7eb;padding:3px 10px;border-radius:999px;">${orderId}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <span style="font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Customer</span>
            <span style="font-size:13px;font-weight:700;color:#374151;">${customerName}</span>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
            <span style="font-size:12px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">Payment</span>
            <span style="font-size:13px;font-weight:700;color:#374151;">${icon} ${paymentLabel(payMethod)}</span>
          </div>
          <div style="border-top:1px dashed #e5e7eb;padding-top:12px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:13px;font-weight:700;color:#374151;">Grand Total</span>
            <span style="font-size:20px;font-weight:900;color:#f97316;">₹${Number(grandTotal).toFixed(0)}</span>
          </div>
        </div>
        <div style="display:inline-flex;align-items:center;gap:6px;background:${isPaid ? "#dcfce7" : "#fef3c7"};color:${isPaid ? "#15803d" : "#92400e"};border:1px solid ${isPaid ? "#bbf7d0" : "#fde68a"};font-size:12px;font-weight:700;padding:6px 14px;border-radius:999px;margin-bottom:20px;animation:fadeUp 0.4s 0.38s ease both;">
          ${isPaid ? "✅ Payment Successful" : "⏳ Pay on Delivery"}
        </div>
        <div style="display:flex;align-items:center;justify-content:center;gap:8px;background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:10px 16px;animation:fadeUp 0.4s 0.44s ease both;">
          <span style="font-size:18px;">🛵</span>
          <span style="font-size:13px;font-weight:600;color:#c2410c;">Estimated delivery: <strong>30–40 minutes</strong></span>
        </div>
      </div>
      <style>
        @keyframes popIn{from{opacity:0;transform:scale(0.5);}to{opacity:1;transform:scale(1);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
        .swal2-popup{border-radius:24px!important;padding:32px 24px 24px!important;}
        .swal2-confirm{background:linear-gradient(135deg,#f97316,#ea580c)!important;border-radius:12px!important;font-weight:700!important;padding:12px 32px!important;font-size:15px!important;box-shadow:0 4px 14px rgba(249,115,22,0.4)!important;border:none!important;}
        .swal2-confirm:hover{background:linear-gradient(135deg,#ea580c,#c2410c)!important;}
        .swal2-actions{margin-top:20px!important;}
      </style>
    `,
    showConfirmButton: true,
    confirmButtonText: "🏠 Back to Home",
    allowOutsideClick: false,
    allowEscapeKey:    false,
  });
};

const Checkout = () => {
  const navigate  = useNavigate();
  const location  = useLocation();             
  const { user }                        = useAuth();
  const { cart, totalPrice, clearCart } = useContext(CartContext);

  // ── KEY FIX: read promo passed from Cart.jsx 
  const promoCode     = location.state?.promoCode     || "";
  const promoDiscount = location.state?.promoDiscount || 0;
  const promoSaving   = location.state?.promoSaving   || 0;
  // 

  const [savedSummary,   setSavedSummary]   = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddr,   setSelectedAddr]   = useState(null);
  const [paymentMethod,  setPaymentMethod]  = useState("cod");
  const [visible,        setVisible]        = useState(false);
  const [currentStep,    setCurrentStep]    = useState(1);

  const setFieldRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const data = localStorage.getItem(ORDER_SUMMARY_KEY);
    if (data) setSavedSummary(JSON.parse(data));
    if (user) {
      const email     = (user.email || user).toLowerCase();
      const addresses = JSON.parse(localStorage.getItem(addressKey(email))) || [];
      setSavedAddresses(addresses);
    }
    setTimeout(() => setVisible(true), 50);
    loadRazorpay();
  }, [user]);

  
  const { cgst, sgst, deliveryFee, platformFee, baseGrandTotal } = useMemo(() => {
    if (cart.length === 0) return { cgst: 0, sgst: 0, deliveryFee: 0, platformFee: 0, baseGrandTotal: 0 };
    const cgst           = totalPrice * 0.025;
    const sgst           = totalPrice * 0.025;
    const deliveryFee    = 40;
    const platformFee    = 7;
    const baseGrandTotal = totalPrice + cgst + sgst + deliveryFee + platformFee;
    return { cgst, sgst, deliveryFee, platformFee, baseGrandTotal };
  }, [cart, totalPrice]);


  const grandTotal = useMemo(
    () => Math.max(0, baseGrandTotal - promoSaving),
    [baseGrandTotal, promoSaving]
  );

  useEffect(() => {
    if (cart.length === 0) return;
    const summary = {
      cart: cart.map(i => ({
        id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image || "",
      })),
      totalPrice, cgst, sgst, deliveryFee, platformFee,
      promoCode, promoDiscount, promoSaving,
      grandTotal,
    };
    localStorage.setItem(ORDER_SUMMARY_KEY, JSON.stringify(summary));
    setSavedSummary(summary);
 
  }, [cart, totalPrice]);

  const summary = useMemo(() =>
    cart.length > 0
      ? { cart, totalPrice, cgst, sgst, deliveryFee, platformFee, promoCode, promoDiscount, promoSaving, grandTotal }
      : savedSummary || { cart: [], totalPrice: 0, cgst: 0, sgst: 0, deliveryFee: 0, platformFee: 0, promoCode: "", promoDiscount: 0, promoSaving: 0, grandTotal: 0 },
  [cart, totalPrice, cgst, sgst, deliveryFee, platformFee, promoCode, promoDiscount, promoSaving, grandTotal, savedSummary]);

  const totalItems = useMemo(() =>
    summary.cart.reduce((s, i) => s + i.quantity, 0),
  [summary.cart]);

  const handleSelectAddress = useCallback((addr, idx, setFieldValue) => {
    setSelectedAddr(idx);
    setFieldValue("name",    addr.name);
    setFieldValue("phone",   addr.phone);
    setFieldValue("address", addr.address);
    setFieldValue("city",    addr.city);
    setFieldValue("pincode", addr.zipCode);
  }, []);


  const saveOrderToHistory = useCallback((values, razorpayData = null) => {
    const newOrder = {
      orderId:       generateOrderId(),
      placedAt:      new Date().toISOString(),
      placedAtLocal: new Date().toLocaleString("en-IN"),
      customer: {
        name: values.name, phone: values.phone,
        address: values.address, city: values.city, pincode: values.pincode,
      },
      payment: {
        method:      paymentMethod,
        methodLabel: paymentLabel(paymentMethod),
        status:      paymentMethod === "cod" ? "Pending (COD)" : "Paid",
        ...(razorpayData && {
          razorpayPaymentId: razorpayData.razorpay_payment_id,
          razorpayOrderId:   razorpayData.razorpay_order_id,
          razorpaySignature: razorpayData.razorpay_signature,
        }),
      },
      items: summary.cart.map(i => ({
        id: i.id, name: i.name, image: i.image || "",
        price: i.price, quantity: i.quantity, lineTotal: i.price * i.quantity,
      })),
      totalItems,
       
      pricing: {
        subtotal:      summary.totalPrice,
        cgst:          parseFloat(Number(summary.cgst).toFixed(2)),
        sgst:          parseFloat(Number(summary.sgst).toFixed(2)),
        deliveryFee:   summary.deliveryFee,
        platformFee:   summary.platformFee,
        promoCode:     summary.promoCode     || "",
        promoDiscount: summary.promoDiscount || 0,
        promoSaving:   summary.promoSaving   || 0,
        grandTotal:    parseFloat(Number(summary.grandTotal).toFixed(2)),
      },
      orderStatus:       "Confirmed",
      estimatedDelivery: "30–40 mins",
    };
    const email   = user ? (user.email || user).toLowerCase() : null;
    const histKey = email ? orderHistoryKey(email) : ORDER_HISTORY_KEY;
    const existing = JSON.parse(localStorage.getItem(histKey)) || [];
    existing.unshift(newOrder);
    localStorage.setItem(histKey,           JSON.stringify(existing));
    localStorage.setItem(ORDER_SUMMARY_KEY, JSON.stringify(newOrder));
    return newOrder;
  }, [summary, totalItems, paymentMethod, user]);

  const openRazorpay = useCallback((values, setSubmitting) => {
    const amountInPaise = Math.round(Number(summary.grandTotal) * 100);
    const options = {
      key:         RAZORPAY_KEY_ID,
      amount:      amountInPaise,
      currency:    "INR",
      logo:        "logo",
      name:        "Hungryhub",
      description: `Order of ${totalItems} item${totalItems > 1 ? "s" : ""}`,
      prefill: {
        name:    values.name,
        contact: `+91${values.phone}`,
        email:   user ? (user.email || `${values.phone}@guest.com`) : `${values.phone}@guest.com`,
      },
      theme: { color: "#f97316" },
      method: paymentMethod === "upi"
        ? { upi: true, card: false, netbanking: false, wallet: false }
        : { card: true, upi: false, netbanking: false, wallet: false },
      modal: {
        ondismiss: () => {
          setCurrentStep(1);
          setSubmitting(false);
          Swal.fire({ title: "Payment Cancelled", text: "Your order was not placed.", icon: "info", confirmButtonColor: "#f97316" });
        },
      },
      handler: (response) => {
        const placed = saveOrderToHistory(values, response);
        clearCart();
        showOrderSuccessPopup(placed.orderId, placed.pricing.grandTotal, paymentMethod, values.name)
          .then(() => { window.scrollTo({ top: 0, behavior: "instant" }); navigate("/"); });
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) => {
      setCurrentStep(1);
      setSubmitting(false);
      Swal.fire({
        title: "Payment Failed ❌",
        html: `<p style="color:#374151;font-size:14px">${response.error.description}</p>`,
        icon: "error", confirmButtonColor: "#f97316",
      });
    });
    rzp.open();
  }, [summary.grandTotal, totalItems, paymentMethod, user, saveOrderToHistory, clearCart, navigate]);

  const handleSubmit = useCallback(async (values, { setSubmitting }) => {
    if (!user) {
      Swal.fire("Login Required 🔐", "Please login to continue", "warning").then(() => navigate("/login"));
      setSubmitting(false);
      return;
    }
    if (summary.cart.length === 0) {
      Swal.fire("Cart Empty 😢", "Add items first", "warning");
      setSubmitting(false);
      return;
    }
    setCurrentStep(2);

    if (paymentMethod === "cod") {
      const res = await Swal.fire({
        title: "Confirm Order?",
        html: `
          <p style="font-size:15px;color:#374151;margin-bottom:6px">
            Total: <strong style="color:#f97316;font-size:18px">₹${Number(summary.grandTotal).toFixed(0)}</strong>
          </p>
          ${summary.promoCode ? `<p style="font-size:12px;color:#16a34a;margin-bottom:4px">🏷️ Promo <strong>${summary.promoCode}</strong> applied (−₹${summary.promoSaving})</p>` : ""}
          <p style="font-size:13px;color:#9ca3af">Payment: ${paymentLabel(paymentMethod)}</p>
        `,
        icon: "question", showCancelButton: true,
        confirmButtonColor: "#f97316", cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, Place Order 🎉", cancelButtonText: "Review again",
      });
      if (res.isConfirmed) {
        const placed = saveOrderToHistory(values);
        clearCart();
        showOrderSuccessPopup(placed.orderId, placed.pricing.grandTotal, paymentMethod, values.name)
          .then(() => { window.scrollTo({ top: 0, behavior: "instant" }); navigate("/"); });
      } else {
        setCurrentStep(1);
      }
      setSubmitting(false);
      return;
    }

    const loaded = await loadRazorpay();
    if (!loaded) {
      setCurrentStep(1); setSubmitting(false);
      Swal.fire({ title: "Payment Gateway Error", text: "Unable to load Razorpay. Check your internet connection.", icon: "error", confirmButtonColor: "#f97316" });
      return;
    }
    openRazorpay(values, setSubmitting);
  }, [user, summary, paymentMethod, saveOrderToHistory, clearCart, navigate, openRazorpay]);

  const handlePaymentMethod = useCallback((method) => setPaymentMethod(method), []);

  const stepItems = [
    { title: "Cart",     subTitle: "Items added",       icon: <ShoppingCartOutlined /> },
    { title: "Delivery", subTitle: "Address & details", icon: <EnvironmentOutlined />  },
    { title: "Payment",  subTitle: "Confirm & pay",     icon: <CreditCardOutlined />   },
  ];

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.4s ease, transform 0.4s ease" }}
    >
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-6">Checkout</h1>
          <ConfigProvider theme={antTheme}>
            <Steps current={currentStep} items={stepItems} style={{ maxWidth: 520 }} className="checkout-steps" />
          </ConfigProvider>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-5">
          <Formik
            initialValues={{ name: "", phone: "", address: "", city: "", pincode: "" }}
            validationSchema={CheckoutSchema}
            onSubmit={handleSubmit}
          >
            {({ submitForm, setFieldValue, isSubmitting }) => {
              setFieldRef.current = setFieldValue;
              return (
                <>
                  {savedAddresses.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                      <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <MapPin size={16} className="text-orange-500" /> Saved Addresses
                      </h3>
                      <div className="space-y-2">
                        {savedAddresses.map((addr, idx) => (
                          <div key={idx} onClick={() => handleSelectAddress(addr, idx, setFieldValue)}
                            className={`border-2 p-3 rounded-xl cursor-pointer transition-all ${selectedAddr === idx ? "border-orange-500 bg-orange-50" : "border-gray-100 hover:border-orange-200"}`}>
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2 mb-1">
                                {addr.type === "Home" ? <Home size={14} className="text-orange-500" /> : addr.type === "Work" ? <Briefcase size={14} className="text-orange-500" /> : <MapPin size={14} className="text-orange-500" />}
                                <span className="text-xs font-bold text-orange-500 uppercase">{addr.type}</span>
                              </div>
                              {selectedAddr === idx && <CheckCircle size={16} className="text-green-500" />}
                            </div>
                            <p className="font-semibold text-gray-800 text-sm">{addr.name}</p>
                            <p className="text-gray-500 text-xs mt-0.5">{addr.address}, {addr.city} – {addr.zipCode}</p>
                            <p className="text-gray-400 text-xs">📞 {addr.phone}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <User size={16} className="text-orange-500" /> Delivery Details
                    </h3>
                    <Form className="flex flex-col gap-4">
                      {[
                        { name: "name",    label: "Full Name",        placeholder: "Enter your full name",      type: "text" },
                        { name: "phone",   label: "Phone Number",     placeholder: "10-digit mobile number",   type: "text", icon: true },
                        { name: "address", label: "Delivery Address", placeholder: "House/flat no., street...", type: "textarea" },
                      ].map((f) => (
                        <div key={f.name}>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">{f.label}</label>
                          {f.type === "textarea" ? (
                            <Field as="textarea" name={f.name} rows={3} placeholder={f.placeholder}
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition resize-none" />
                          ) : f.icon ? (
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Phone size={15} /></span>
                              <Field name={f.name} placeholder={f.placeholder}
                                className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
                            </div>
                          ) : (
                            <Field name={f.name} placeholder={f.placeholder}
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
                          )}
                          <ErrorMessage name={f.name} component="p" className="text-red-400 text-xs mt-1" />
                        </div>
                      ))}
                      <div className="grid grid-cols-2 gap-3">
                        {[{ name: "city", label: "City", placeholder: "City" }, { name: "pincode", label: "Pincode", placeholder: "6-digit pincode" }].map((f) => (
                          <div key={f.name}>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">{f.label}</label>
                            <Field name={f.name} placeholder={f.placeholder}
                              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition" />
                            <ErrorMessage name={f.name} component="p" className="text-red-400 text-xs mt-1" />
                          </div>
                        ))}
                      </div>
                    </Form>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-orange-500" /> Payment Method
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: "cod",  label: "Cash on Delivery", emoji: "💵" },
                        { id: "upi",  label: "UPI / GPay",        emoji: "📱" },
                        { id: "card", label: "Credit / Debit",    emoji: "💳" },
                      ].map((method) => (
                        <div key={method.id} onClick={() => handlePaymentMethod(method.id)}
                          className={`border-2 rounded-xl p-3 cursor-pointer text-center transition-all ${paymentMethod === method.id ? "border-orange-500 bg-orange-50" : "border-gray-100 hover:border-orange-200"}`}>
                          <div className="text-2xl mb-1">{method.emoji}</div>
                          <p className="text-xs font-bold text-gray-700">{method.label}</p>
                          {paymentMethod === method.id && <p className="text-[10px] text-orange-500 mt-0.5">✓ Selected</p>}
                          {(method.id === "upi" || method.id === "card") && <p className="text-[9px] text-gray-400 mt-1">via Razorpay</p>}
                        </div>
                      ))}
                    </div>
                    {(paymentMethod === "upi" || paymentMethod === "card") && (
                      <div className="mt-3 flex items-center justify-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                        <p className="text-xs text-blue-700 font-medium">Secured by <strong>Razorpay</strong> · 256-bit SSL encrypted</p>
                      </div>
                    )}
                  </div>

                  <button onClick={submitForm} disabled={isSubmitting}
                    className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition">
                    {isSubmitting ? "Processing..." : paymentMethod === "cod" ? "Place Order" : "Proceed to Pay"}
                    <ChevronRight size={20} />
                  </button>

                  <div className="flex justify-center gap-6 text-xs text-gray-400">
                    {["🔒 100% Secure", "🚀 Fast Delivery", "✅ Fresh & Hot"].map((t) => <span key={t}>{t}</span>)}
                  </div>
                </>
              );
            }}
          </Formik>
        </div>

        {/* ── ORDER SUMMARY */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 lg:sticky lg:top-6">
            <h2 className="text-lg font-extrabold text-gray-800 mb-4">Order Summary</h2>
            <div className="bg-orange-50 rounded-xl px-4 py-2.5 flex items-center gap-2 mb-4">
              <Clock size={14} className="text-orange-500" />
              <p className="text-xs text-orange-700 font-medium">Estimated delivery: <strong>30–40 mins</strong></p>
            </div>

            {/* Promo badge — visible if promo was applied in cart */}
            {summary.promoCode && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 mb-4">
                <span className="text-green-600 text-sm">🏷️</span>
                <div>
                  <p className="text-green-700 font-bold text-sm">{summary.promoCode} applied</p>
                  <p className="text-green-500 text-xs">You save ₹{summary.promoSaving} with this promo</p>
                </div>
              </div>
            )}

            {summary.cart.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm">Your cart is empty 🛒</p>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 mb-4">
                {summary.cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img src={item.image || "https://placehold.co/56x56"} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />
                      <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                      <p className="text-gray-400 text-xs">₹{item.price} × {item.quantity}</p>
                    </div>
                    <p className="font-bold text-gray-800 text-sm shrink-0">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-dashed border-gray-200 pt-4 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between"><span>Subtotal ({totalItems} items)</span><span className="font-semibold text-gray-800">₹{summary.totalPrice}</span></div>
              <div className="flex justify-between"><span>CGST (2.5%)</span><span>₹{Number(summary.cgst).toFixed(0)}</span></div>
              <div className="flex justify-between"><span>SGST (2.5%)</span><span>₹{Number(summary.sgst).toFixed(0)}</span></div>
              <div className="flex justify-between"><span>Delivery Fee</span><span>₹{summary.deliveryFee}</span></div>
              <div className="flex justify-between"><span>Platform Fee</span><span>₹{summary.platformFee}</span></div>
              {summary.promoSaving > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Promo Discount ({summary.promoCode})</span>
                  <span>− ₹{summary.promoSaving}</span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
              <span className="font-extrabold text-gray-800">Grand Total</span>
              <span className="font-extrabold text-orange-500 text-xl">₹{Number(summary.grandTotal).toFixed(0)}</span>
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-2">Inclusive of all taxes & fees</p>
          </div>
        </div>
      </div>

      <style>{`
        .checkout-steps .ant-steps-item-finish .ant-steps-item-icon{background-color:#22c55e!important;border-color:#22c55e!important;}
        .checkout-steps .ant-steps-item-finish .ant-steps-item-icon .ant-steps-icon{color:#fff!important;}
        .checkout-steps .ant-steps-item-process .ant-steps-item-icon{background-color:#fff!important;border-color:#fff!important;}
        .checkout-steps .ant-steps-item-process .ant-steps-item-icon .ant-steps-icon{color:#f97316!important;}
        .checkout-steps .ant-steps-item-wait .ant-steps-item-icon{background-color:rgba(255,255,255,0.2)!important;border-color:rgba(255,255,255,0.4)!important;}
        .checkout-steps .ant-steps-item-wait .ant-steps-item-icon .ant-steps-icon{color:rgba(255,255,255,0.7)!important;}
        .checkout-steps .ant-steps-item-tail::after,.checkout-steps .ant-steps-item-tail{background-color:rgba(255,255,255,0.3)!important;}
        .checkout-steps .ant-steps-item-finish>.ant-steps-item-container>.ant-steps-item-tail::after{background-color:#22c55e!important;}
        .checkout-steps .ant-steps-item-title{color:#fff!important;font-weight:600!important;}
        .checkout-steps .ant-steps-item-subtitle{color:rgba(255,255,255,0.65)!important;font-size:11px!important;}
        .swal2-popup.swal2-modal{max-width:420px!important;}
      `}</style>
    </div>
  );
};

export default Checkout;