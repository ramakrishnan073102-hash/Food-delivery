import jsPDF from "jspdf";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { showAlert } from "../utils/alert";


const profileKey = (email) => `profile_${email}`;
const addressKey = (email) => `deliveryAddresses_${email}`;

const orderHistoryKey = (email) => `orderHistory_${email}`;
const ADDRESS_TYPES = ["Home", "Work", "Other"];


const EMPTY_ADDR = { name: "", phone: "", address: "", city: "", zipCode: "", type: "Home" };

// ── Status colour map
const STATUS_STYLES = {
  Confirmed:   "bg-green-50 text-green-600 border-green-200",
  Preparing:   "bg-yellow-50 text-yellow-600 border-yellow-200",
  "On the way":"bg-blue-50 text-blue-600 border-blue-200",
  Delivered:   "bg-gray-100 text-gray-500 border-gray-200",
  Cancelled:   "bg-red-50 text-red-400 border-red-200",
};

// ── Invoice preview (opens in new tab)
const previewInvoice = (order) => {
  const pricing = order.pricing || {};
  const itemRows = (order.items || []).map((item, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#fafafa'}">
      <td style="padding:9px 12px;color:#6b7280">${i + 1}</td>
      <td style="padding:9px 12px;font-weight:600;color:#111827">${item.name || ""}</td>
      <td style="padding:9px 12px;text-align:right;color:#4b5563">&#8377;${item.price}</td>
      <td style="padding:9px 12px;text-align:center;color:#4b5563">${item.quantity}</td>
      <td style="padding:9px 12px;text-align:right;font-weight:700;color:#111827">&#8377;${item.lineTotal}</td>
    </tr>`).join("");

  const statusColors = {
    Confirmed:"#16a34a", Preparing:"#d97706",
    "On the way":"#2563eb", Delivered:"#6b7280", Cancelled:"#dc2626"
  };
  const sc = statusColors[order.orderStatus] || "#16a34a";

  const paid = order.payment?.status || "";
  const paidColor = paid === "Paid" ? "#16a34a" : "#d97706";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Invoice ${order.orderId}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#f3f4f6;padding:32px 16px}
    .page{max-width:720px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10)}
    .header{background:#f97316;padding:28px 32px;display:flex;justify-content:space-between;align-items:flex-start}
    .brand{color:#fff}.brand h1{font-size:24px;font-weight:800;letter-spacing:-0.5px}
    .brand p{font-size:12px;opacity:.85;margin-top:2px}
    .inv-meta{text-align:right;color:#fff}.inv-meta .label{font-size:10px;opacity:.75;text-transform:uppercase;letter-spacing:.5px}
    .inv-meta .value{font-size:13px;font-weight:700;margin-top:1px}
    .inv-meta .date{font-size:11px;opacity:.8;margin-top:3px}
    .info{display:grid;grid-template-columns:1fr 1fr;gap:0;background:#f9fafb;border-bottom:1px solid #e5e7eb}
    .info-box{padding:20px 28px}.info-box .lbl{font-size:10px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px}
    .info-box .name{font-size:14px;font-weight:700;color:#111827;margin-bottom:3px}
    .info-box .sub{font-size:12px;color:#6b7280;line-height:1.6}
    .info-box .status-pill{display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;background:${paidColor}20;color:${paidColor};margin-top:4px}
    .divider{border:none;border-top:1px solid #e5e7eb;margin:0 28px}
    table{width:100%;border-collapse:collapse;margin-bottom:0}
    thead tr{background:#f97316}
    thead th{padding:10px 12px;color:#fff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
    thead th:nth-child(3),thead th:nth-child(4),thead th:nth-child(5){text-align:right}
    thead th:nth-child(4){text-align:center}
    tbody td{font-size:13px;border-bottom:1px solid #f3f4f6}
    .totals{padding:20px 28px 0;display:flex;justify-content:flex-end}
    .totals-inner{width:260px}
    .totals-row{display:flex;justify-content:space-between;font-size:13px;color:#6b7280;padding:4px 0}
    .totals-row span:last-child{font-weight:600;color:#374151}
    .totals-divider{border:none;border-top:1.5px dashed #f97316;margin:10px 0}
    .grand{display:flex;justify-content:space-between;background:#fff7ed;border-radius:10px;padding:10px 14px;margin-top:4px}
    .grand span:first-child{font-size:14px;font-weight:700;color:#f97316}
    .grand span:last-child{font-size:16px;font-weight:800;color:#f97316}
    .footer-row{display:flex;justify-content:space-between;align-items:center;padding:18px 28px;border-top:1px solid #e5e7eb;margin-top:20px}
    .status-badge{padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;color:#fff;background:${sc}}
    .footer-note{font-size:11px;color:#9ca3af;text-align:right;line-height:1.6}
    @media print{body{padding:0;background:#fff}.page{box-shadow:none;border-radius:0}
      .no-print{display:none!important}}
  </style>
</head>
<body>
  <div style="text-align:center;margin-bottom:16px" class="no-print">
    <button onclick="window.print()" style="background:#f97316;color:#fff;border:none;padding:10px 28px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;margin-right:8px">🖨️ Print</button>
    <button onclick="window.close()" style="background:#f3f4f6;color:#374151;border:none;padding:10px 20px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer">✕ Close</button>
  </div>
  <div class="page">
    <div class="header">
      <div class="brand"><h1>HungryHub</h1><p>Fresh Food, Fast Delivery</p></div>
      <div class="inv-meta">
        <div class="label">Tax Invoice</div>
        <div class="value">${order.orderId}</div>
        <div class="date">${order.placedAtLocal || ""}</div>
      </div>
    </div>
    <div class="info">
      <div class="info-box">
        <div class="lbl">Billed To</div>
        <div class="name">${order.customer?.name || ""}</div>
        <div class="sub">${order.customer?.address || ""}, ${order.customer?.city || ""} &ndash; ${order.customer?.pincode || ""}<br/>&#128222; ${order.customer?.phone || ""}</div>
      </div>
      <div class="info-box" style="border-left:1px solid #e5e7eb">
        <div class="lbl">Payment</div>
        <div class="name">${order.payment?.methodLabel || ""}</div>
        <div class="sub">Est. Delivery: ${order.estimatedDelivery || "30–40 mins"}</div>
        <span class="status-pill">${paid}</span>
      </div>
    </div>
    <table>
      <thead><tr>
        <th style="width:36px">#</th>
        <th style="text-align:left">Item</th>
        <th>Price</th><th>Qty</th><th>Total</th>
      </tr></thead>
      <tbody>${itemRows}</tbody>
    </table>
    <div class="totals">
      <div class="totals-inner">
        <div class="totals-row"><span>Subtotal</span><span>&#8377;${pricing.subtotal || 0}</span></div>
        <div class="totals-row"><span>CGST (2.5%)</span><span>&#8377;${Number(pricing.cgst||0).toFixed(2)}</span></div>
        <div class="totals-row"><span>SGST (2.5%)</span><span>&#8377;${Number(pricing.sgst||0).toFixed(2)}</span></div>
        <div class="totals-row"><span>Delivery Fee</span><span>&#8377;${pricing.deliveryFee || 0}</span></div>
        <div class="totals-row"><span>Platform Fee</span><span>&#8377;${pricing.platformFee || 0}</span></div>
        <hr class="totals-divider"/>
        <div class="grand"><span>Grand Total</span><span>&#8377;${Number(pricing.grandTotal||0).toFixed(0)}</span></div>
      </div>
    </div>
    <div class="footer-row">
      <span class="status-badge">${order.orderStatus || "Confirmed"}</span>
      <div class="footer-note">Thank you for ordering with HungryHub!<br/>support@hungryhub.in &bull; Computer-generated invoice</div>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, "_blank");
  if (win) win.focus();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};

// ── Invoice generator
const generateInvoice = (order) => {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const margin = 18;
  let y = 0;

  // ── helpers
  const rgb  = (r, g, b) => doc.setTextColor(r, g, b);
  const font = (style, size) => { doc.setFontSize(size); doc.setFont("helvetica", style); };
  const line = (y1, color = [229, 231, 235]) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.line(margin, y1, W - margin, y1);
  };

  // ── HEADER BAND (orange)
  doc.setFillColor(249, 115, 22);
  doc.rect(0, 0, W, 36, "F");

  font("bold", 22);
  rgb(255, 255, 255);
  doc.text("HungryHub", margin, 15);
  font("normal", 8);
  doc.text("Fresh Food, Fast Delivery", margin, 21);

  font("bold", 10);
  doc.text("TAX INVOICE", W - margin, 13, { align: "right" });
  font("normal", 8);
  doc.text(order.orderId, W - margin, 19, { align: "right" });
  doc.text(order.placedAtLocal || "", W - margin, 25, { align: "right" });

  y = 46;

  //  BILLED TO / PAYMENT side-by-side
  doc.setFillColor(249, 250, 251);
  doc.rect(margin, y, W - 2 * margin, 28, "F");

  font("bold", 8);
  rgb(107, 114, 128);
  doc.text("BILLED TO", margin + 4, y + 6);
  font("bold", 9);
  rgb(31, 41, 55);
  doc.text(order.customer?.name || "", margin + 4, y + 12);
  font("normal", 8);
  rgb(107, 114, 128);
  const addrLine = `${order.customer?.address || ""}, ${order.customer?.city || ""} - ${order.customer?.pincode || ""}`;
  doc.text(addrLine, margin + 4, y + 18, { maxWidth: 80 });
  doc.text(`Phone: ${order.customer?.phone || ""}`, margin + 4, y + 24);

  const cx = W / 2 + 4;
  font("bold", 8);
  rgb(107, 114, 128);
  doc.text("PAYMENT METHOD", cx, y + 6);
  font("normal", 9);
  rgb(31, 41, 55);
  doc.text(order.payment?.methodLabel || "", cx, y + 12);
  font("normal", 8);
  const paid = order.payment?.status || "";
  rgb(paid === "Paid" ? 22 : 161, paid === "Paid" ? 163 : 98, paid === "Paid" ? 74 : 7);
  doc.text(paid, cx, y + 18);
  font("normal", 8);
  rgb(107, 114, 128);
  doc.text(`Est. Delivery: ${order.estimatedDelivery || "30-40 mins"}`, cx, y + 24);

  y += 34;

  // ── ITEMS TABLE HEADER
  doc.setFillColor(249, 115, 22);
  doc.rect(margin, y, W - 2 * margin, 8, "F");
  font("bold", 8);
  rgb(255, 255, 255);
  doc.text("#",         margin + 3,      y + 5.5);
  doc.text("Item",      margin + 10,     y + 5.5);
  doc.text("Price",     W - margin - 56, y + 5.5, { align: "right" });
  doc.text("Qty",       W - margin - 34, y + 5.5, { align: "right" });
  doc.text("Total",     W - margin - 2,  y + 5.5, { align: "right" });
  y += 8;

  // ── ITEMS ROWS
  (order.items || []).forEach((item, i) => {
    const bg = i % 2 === 0 ? [255, 255, 255] : [249, 250, 251];
    doc.setFillColor(...bg);
    doc.rect(margin, y, W - 2 * margin, 7, "F");

    font("normal", 8);
    rgb(107, 114, 128);
    doc.text(String(i + 1), margin + 3, y + 4.8);
    rgb(31, 41, 55);
    font("normal", 8.5);
    doc.text(item.name || "", margin + 10, y + 4.8, { maxWidth: 82 });
    font("normal", 8);
    rgb(75, 85, 99);
    doc.text(`Rs.${item.price}`,           W - margin - 56, y + 4.8, { align: "right" });
    doc.text(String(item.quantity),        W - margin - 34, y + 4.8, { align: "right" });
    font("bold", 8.5);
    rgb(31, 41, 55);
    doc.text(`Rs.${item.lineTotal}`,       W - margin - 2,  y + 4.8, { align: "right" });
    y += 7;
  });

  y += 3;
  line(y, [229, 231, 235]);
  y += 5;

  // ── PRICING BREAKDOWN (right-aligned)
  const pricing = order.pricing || {};
  const rows = [
    ["Subtotal",      `Rs.${pricing.subtotal || 0}`],
    ["CGST (2.5%)",   `Rs.${Number(pricing.cgst || 0).toFixed(2)}`],
    ["SGST (2.5%)",   `Rs.${Number(pricing.sgst || 0).toFixed(2)}`],
    ["Delivery Fee",  `Rs.${pricing.deliveryFee || 0}`],
    ["Platform Fee",  `Rs.${pricing.platformFee || 0}`],
  ];

  rows.forEach(([label, val]) => {
    font("normal", 8.5);
    rgb(107, 114, 128);
    doc.text(label, W - margin - 42, y);
    rgb(31, 41, 55);
    doc.text(val, W - margin - 2, y, { align: "right" });
    y += 6;
  });

  y += 1;
  line(y, [249, 115, 22]);
  y += 6;

  // Grand total row
  doc.setFillColor(255, 247, 237);
  doc.rect(W - margin - 70, y - 4, 70, 10, "F");
  font("bold", 10);
  rgb(249, 115, 22);
  doc.text("Grand Total", W - margin - 42, y + 2.5);
  font("bold", 11);
  doc.text(`Rs.${Number(pricing.grandTotal || 0).toFixed(0)}`, W - margin - 2, y + 2.5, { align: "right" });
  y += 14;

  // ── STATUS BADGE
  const statusColors = {
    Confirmed: [22, 163, 74], Preparing: [161, 98, 7],
    "On the way": [37, 99, 235], Delivered: [107, 114, 128], Cancelled: [220, 38, 38],
  };
  const sc = statusColors[order.orderStatus] || statusColors.Confirmed;
  doc.setFillColor(...sc);
  doc.roundedRect(margin, y, 40, 8, 2, 2, "F");
  font("bold", 8);
  rgb(255, 255, 255);
  doc.text(order.orderStatus || "Confirmed", margin + 20, y + 5.2, { align: "center" });

  y += 16;
  line(y, [229, 231, 235]);
  y += 6;

  // ── FOOTER
  font("normal", 7.5);
  rgb(156, 163, 175);
  doc.text("Thank you for ordering with HungryHub! For support: support@hungryhub.in", W / 2, y, { align: "center" });
  doc.text("This is a computer-generated invoice and does not require a signature.", W / 2, y + 5, { align: "center" });

  doc.save(`Invoice_${order.orderId}.pdf`);
};

// ── Single order card (collapsible)
const OrderCard = ({ order }) => {
  const [open, setOpen] = useState(false);

  const statusClass = STATUS_STYLES[order.orderStatus] || STATUS_STYLES.Confirmed;

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden hover:border-orange-200 transition-all">

      {/* ── Header row (always visible) */}
      <div
        className="flex items-center justify-between gap-3 p-4 cursor-pointer select-none bg-white hover:bg-gray-50 transition"
        onClick={() => setOpen((o) => !o)}
      >
        <div className="min-w-0">
          <p className="font-bold text-gray-800 text-sm truncate">{order.orderId}</p>
          <p className="text-xs text-gray-400 mt-0.5">{order.placedAtLocal}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusClass}`}>
            {order.orderStatus}
          </span>
          <span className="font-extrabold text-orange-500 text-sm">
            ₹{Number(order.pricing?.grandTotal || 0).toFixed(0)}
          </span>
          <span className="text-gray-400 text-sm transition-transform" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
            ▾
          </span>
        </div>
      </div>

      {/* ── Expanded details */}
      {open && (
        <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-4">

          {/* Invoice action buttons */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => previewInvoice(order)}
              className="flex items-center gap-2 bg-white hover:bg-orange-50 active:bg-orange-100 text-orange-500 border border-orange-300 text-xs font-bold px-4 py-2 rounded-xl transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Invoice
            </button>
            <button
              onClick={() => generateInvoice(order)}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm shadow-orange-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
              </svg>
              Download Invoice
            </button>
          </div>

          {/* Items list */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Items</p>
            <div className="space-y-2">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-gray-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                      onError={(e) => { e.target.style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center text-xl shrink-0">🍽️</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                    <p className="text-gray-400 text-xs mt-0.5">₹{item.price} × {item.quantity}</p>
                  </div>
                  <p className="font-bold text-gray-700 text-sm shrink-0">₹{item.lineTotal}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing breakdown */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bill Summary</p>
            <div className="bg-white rounded-xl border border-gray-100 p-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>₹{order.pricing?.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>CGST (2.5%)</span>
                <span>₹{Number(order.pricing?.cgst || 0).toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>SGST (2.5%)</span>
                <span>₹{Number(order.pricing?.sgst || 0).toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery Fee</span>
                <span>₹{order.pricing?.deliveryFee}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Platform Fee</span>
                <span>₹{order.pricing?.platformFee}</span>
              </div>
              <div className="border-t border-dashed border-gray-200 pt-1.5 flex justify-between font-bold text-gray-800">
                <span>Grand Total</span>
                <span className="text-orange-500">₹{Number(order.pricing?.grandTotal || 0).toFixed(0)}</span>
              </div>
            </div>
          </div>

          {/* Delivery + Payment info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Delivered to</p>
              <p className="text-sm font-semibold text-gray-800">{order.customer?.name}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                {order.customer?.address}, {order.customer?.city} – {order.customer?.pincode}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">📞 {order.customer?.phone}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Payment</p>
              <p className="text-sm font-semibold text-gray-800">{order.payment?.methodLabel}</p>
              <p className={`text-xs mt-1 font-medium ${order.payment?.status === "Paid" ? "text-green-500" : "text-yellow-500"}`}>
                {order.payment?.status}
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};


const Profile = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const nameRef          = useRef(null);

  const [activeTab,      setActiveTab]      = useState("profile");
  const [isEditing,      setIsEditing]      = useState(false);
  const [profile,        setProfile]        = useState({ name: "", email: "", phone: "" });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [orders,         setOrders]         = useState([]);

  // ── Address edit state  
  const [editingAddrIdx, setEditingAddrIdx] = useState(null); // null = not editing; index = editing that address
  const [addrForm,       setAddrForm]       = useState(EMPTY_ADDR);
  const [addrErrors,     setAddrErrors]     = useState({});

  // ── Load profile & addresses 
  useEffect(() => {
    if (!user) {
      showAlert({ title: "Login Required 🔐", icon: "warning" }).then(() =>
        navigate("/login")
      );
      return;
    }
    const email = (user.email || user).toLowerCase();
    const saved = JSON.parse(localStorage.getItem(profileKey(email)));
    setProfile({
      name:  saved?.name  || user.name  || "Guest User",
      email: saved?.email || email,
      phone: saved?.phone || "",
    });
    const addresses = JSON.parse(localStorage.getItem(addressKey(email))) || [];
    setSavedAddresses(addresses);
    const history = JSON.parse(localStorage.getItem(orderHistoryKey(email))) || [];
    setOrders(history);
  }, [user, navigate]);

  useEffect(() => {
    if (isEditing) nameRef.current?.focus();
  }, [isEditing]);

  const initial = useMemo(
    () => (profile.name || "G").charAt(0).toUpperCase(),
    [profile.name]
  );

  //  Profile handlers  
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSave = useCallback(() => {
    if (!profile.name || !profile.email) {
      showAlert({ title: "Fill all fields ⚠️", icon: "warning" });
      return;
    }
    const email = profile.email.toLowerCase();
    localStorage.setItem(profileKey(email), JSON.stringify(profile));
    showAlert({ title: "Profile Updated ✅", icon: "success" });
    setIsEditing(false);
  }, [profile]);

  const handleLogout = useCallback(() => {
    logout();
    showAlert({ title: "Logged Out 👋", icon: "success" }).then(() =>
      navigate("/login")
    );
  }, [logout, navigate]);

  // ── Address: open edit form  
  const handleEditAddress = useCallback((idx) => {
    setEditingAddrIdx(idx);
    setAddrForm({ ...savedAddresses[idx] });
    setAddrErrors({});
  }, [savedAddresses]);

  // ── Address: form field change  
  const handleAddrChange = useCallback((e) => {
    const { name, value } = e.target;
    setAddrForm((prev) => ({ ...prev, [name]: value }));
    setAddrErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  // ── Address: validate  
  const validateAddr = useCallback((form) => {
    const errors = {};
    if (!form.name.trim())    errors.name    = "Name is required";
    if (!/^\d{10}$/.test(form.phone)) errors.phone = "Enter valid 10-digit number";
    if (form.address.trim().length < 5) errors.address = "Enter full address";
    if (!form.city.trim())    errors.city    = "City is required";
    if (!/^\d{6}$/.test(form.zipCode)) errors.zipCode = "Enter valid 6-digit pincode";
    return errors;
  }, []);

  // ── Address: save updated  
  const handleAddrSave = useCallback(() => {
    const errors = validateAddr(addrForm);
    if (Object.keys(errors).length > 0) {
      setAddrErrors(errors);
      return;
    }
    if (!user) return;
    const email = (user.email || user).toLowerCase();
    setSavedAddresses((prev) => {
      const updated = prev.map((a, i) => i === editingAddrIdx ? { ...addrForm } : a);
      localStorage.setItem(addressKey(email), JSON.stringify(updated));
      return updated;
    });
    setEditingAddrIdx(null);
    setAddrForm(EMPTY_ADDR);
    showAlert({ title: "Address Updated ✅", icon: "success" });
  }, [addrForm, editingAddrIdx, user, validateAddr]);

  // ── Address: cancel edit 
  const handleAddrCancel = useCallback(() => {
    setEditingAddrIdx(null);
    setAddrForm(EMPTY_ADDR);
    setAddrErrors({});
  }, []);

  // ── Address: delete 
  const handleDeleteAddress = useCallback((index) => {
    if (!user) return;
    const email = (user.email || user).toLowerCase();
    setSavedAddresses((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      localStorage.setItem(addressKey(email), JSON.stringify(updated));
      return updated;
    });
    if (editingAddrIdx === index) {
      setEditingAddrIdx(null);
      setAddrForm(EMPTY_ADDR);
    }
  }, [user, editingAddrIdx]);

  const inputClass = (editing) =>
    `w-full px-4 py-3 border rounded-xl text-sm transition ${
      editing
        ? "border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        : "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
    }`;

  // ── Address edit form 
  const AddressEditForm = () => (
    <div className="mt-4 border-2 border-orange-400 rounded-2xl p-4 sm:p-5 bg-orange-50 space-y-3">
      <h4 className="font-bold text-orange-600 text-sm mb-1">✏️ Edit Address</h4>

      {/* Type selector */}
      <div className="flex gap-2">
        {ADDRESS_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setAddrForm((p) => ({ ...p, type: t }))}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
              addrForm.type === t
                ? "border-orange-500 bg-orange-500 text-white"
                : "border-gray-200 bg-white text-gray-500"
            }`}
          >
            {t === "Home" ? "🏠" : t === "Work" ? "💼" : "📍"} {t}
          </button>
        ))}
      </div>

      {/* Name */}
      <div>
        <input
          name="name" value={addrForm.name} onChange={handleAddrChange}
          placeholder="Full Name"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        />
        {addrErrors.name && <p className="text-red-400 text-xs mt-1">{addrErrors.name}</p>}
      </div>

      {/* Phone */}
      <div>
        <input
          name="phone" value={addrForm.phone} onChange={handleAddrChange}
          placeholder="10-digit Phone Number"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        />
        {addrErrors.phone && <p className="text-red-400 text-xs mt-1">{addrErrors.phone}</p>}
      </div>

      {/* Address */}
      <div>
        <textarea
          name="address" value={addrForm.address} onChange={handleAddrChange}
          placeholder="House/flat no., street, area, landmark..."
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white resize-none"
        />
        {addrErrors.address && <p className="text-red-400 text-xs mt-1">{addrErrors.address}</p>}
      </div>

      {/* City + Pincode */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            name="city" value={addrForm.city} onChange={handleAddrChange}
            placeholder="City"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          />
          {addrErrors.city && <p className="text-red-400 text-xs mt-1">{addrErrors.city}</p>}
        </div>
        <div>
          <input
            name="zipCode" value={addrForm.zipCode} onChange={handleAddrChange}
            placeholder="6-digit Pincode"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          />
          {addrErrors.zipCode && <p className="text-red-400 text-xs mt-1">{addrErrors.zipCode}</p>}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleAddrSave}
          className="flex-1 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white py-2.5 rounded-xl text-sm font-bold transition"
        >
          ✅ Update Address
        </button>
        <button
          onClick={handleAddrCancel}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-semibold transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ── MOBILE TAB BAR  */}
      <div className="sm:hidden sticky top-0 z-20 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex">
          {[
            { key: "profile", icon: "👤", label: "Profile"   },
            { key: "address", icon: "📍", label: "Addresses" },
            { key: "orders",  icon: "📦", label: "Orders"     },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-orange-500 text-orange-500"
                  : "border-transparent text-gray-500"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">

        {/* ── MOBILE: Compact profile header  */}
        <div className="sm:hidden bg-white rounded-2xl shadow-sm p-5 mb-4 flex items-center gap-4">
          <div className="w-14 h-14 shrink-0 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold">
            {initial}
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-gray-800 truncate">{profile.name}</h2>
            <p className="text-gray-400 text-xs truncate mt-0.5">{profile.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-auto shrink-0 text-xs font-semibold text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
          >
            Logout
          </button>
        </div>

        {/* ── DESKTOP: Sidebar + Content  */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* Sidebar */}
          <div className="hidden sm:flex bg-white rounded-2xl shadow-sm p-6 flex-col items-center h-fit">
            <div className="w-24 h-24 rounded-full bg-orange-500 text-white flex items-center justify-center text-3xl font-bold">
              {initial}
            </div>
            <h2 className="text-xl font-bold mt-4 text-gray-800 text-center wrap-break-word w-full">
              {profile.name}
            </h2>
            <p className="text-gray-500 text-sm mt-1 text-center break-all w-full">
              {profile.email}
            </p>
            <div className="mt-6 w-full space-y-2">
              {[
                { key: "profile", icon: "👤", label: "Profile"         },
                { key: "address", icon: "📍", label: "Saved Addresses" },
                { key: "orders",  icon: "📦", label: "Order History"  },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl font-medium transition text-sm ${
                    activeTab === tab.key
                      ? "bg-orange-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 rounded-xl font-medium text-red-500 hover:bg-red-50 transition text-sm"
              >
                🚪 Logout
              </button>
            </div>
          </div>

          {/* Main content panel */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-sm p-5 sm:p-6">

            {/* ── PROFILE TAB  */}
            {activeTab === "profile" && (
              <>
                <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3">
                  <h2 className="text-base sm:text-xl font-bold text-gray-800">
                    Personal Information
                  </h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold transition"
                    >
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 sm:px-4 py-2 rounded-lg text-sm font-semibold transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-5 py-2 rounded-lg text-sm font-semibold transition"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Full Name</label>
                    <input
                      ref={nameRef}
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Full Name"
                      className={inputClass(isEditing)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Email Address</label>
                    <input
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Email"
                      className={inputClass(isEditing)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                    <input
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Phone Number"
                      className={inputClass(isEditing)}
                    />
                  </div>
                </div>
              </>
            )}


            {/* ── ORDER HISTORY TAB */}
            {activeTab === "orders" && (
              <>
                <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3">
                  <h2 className="text-base sm:text-xl font-bold text-gray-800">
                    Order History
                  </h2>
                  <span className="text-xs text-gray-400 font-medium">
                    {orders.length} order{orders.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-10 sm:py-12">
                    <p className="text-5xl mb-3">📦</p>
                    <p className="text-gray-500 font-medium text-sm sm:text-base">No orders yet</p>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">
                      Your order history will appear here
                    </p>
                    <button
                      onClick={() => navigate("/menu")}
                      className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
                    >
                      Order Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order, idx) => (
                      <OrderCard key={order.orderId || idx} order={order} />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── ADDRESS TAB  */}
            {activeTab === "address" && (
              <>
                <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3">
                  <h2 className="text-base sm:text-xl font-bold text-gray-800">
                    Saved Addresses
                  </h2>
                  <button
                    onClick={() => navigate("/deliveryaddress")}
                    className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    + Add New
                  </button>
                </div>

                {savedAddresses.length === 0 ? (
                  <div className="text-center py-10 sm:py-12">
                    <p className="text-4xl mb-3">📍</p>
                    <p className="text-gray-500 font-medium text-sm sm:text-base">No address saved yet</p>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">
                      Add a delivery address to speed up checkout
                    </p>
                    <button
                      onClick={() => navigate("/deliveryaddress")}
                      className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
                    >
                      + Add Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedAddresses.map((addr, idx) => (
                      <div key={idx}>
                        {/* ── Address card  */}
                        <div
                          className={`border-2 rounded-2xl p-4 transition-all ${
                            editingAddrIdx === idx
                              ? "border-orange-400 bg-orange-50/30"
                              : "border-gray-200 hover:border-orange-200 bg-white"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            {/* Type badge */}
                            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
                              addr.type === "Home"  ? "bg-blue-50 text-blue-600"  :
                              addr.type === "Work"  ? "bg-purple-50 text-purple-600" :
                                                     "bg-gray-100 text-gray-600"
                            }`}>
                              {addr.type === "Home" ? "🏠" : addr.type === "Work" ? "💼" : "📍"} {addr.type}
                            </span>

                            {/* Edit / Delete buttons */}
                            <div className="flex items-center gap-2 shrink-0">
                              {editingAddrIdx !== idx && (
                                <button
                                  onClick={() => handleEditAddress(idx)}
                                  className="text-xs font-semibold text-orange-500 border border-orange-200 px-3 py-1 rounded-lg hover:bg-orange-50 transition"
                                >
                                  ✏️ Edit
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAddress(idx)}
                                className="text-xs font-semibold text-red-400 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 transition"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>

                          <p className="font-semibold text-gray-800 text-sm mt-2">{addr.name}</p>
                          <p className="text-gray-500 text-xs sm:text-sm mt-0.5 leading-relaxed">
                            {addr.address}, {addr.city} – {addr.zipCode}
                          </p>
                          <p className="text-gray-400 text-xs sm:text-sm mt-0.5">📞 {addr.phone}</p>
                        </div>

                        {/* ── Inline edit form (opens below the card) ── */}
                        {editingAddrIdx === idx && <AddressEditForm />}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;