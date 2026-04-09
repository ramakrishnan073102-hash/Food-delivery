import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

const SECTIONS = [
  { id: "Use",          title: "Use of Service"          },
  { id: "Orders",       title: "Orders & Availability"   },
  { id: "Payments",     title: "Payments & Pricing"      },
  { id: "Delivery",     title: "Delivery Policy"         },
  { id: "Cancellation", title: "Cancellation & Refund"   },
  { id: "Account",      title: "User Account"            },
  { id: "Liability",    title: "Limitation of Liability" },
];

const CONTENT = {
  Use:          `Our platform is intended for lawful use only. Users must not engage in fraudulent, illegal, or harmful activities. Any misuse, including unauthorized access, hacking, or system disruption, may result in immediate account suspension and legal action. This service is strictly for personal, non-commercial use.`,
  Orders:       `All orders are subject to restaurant acceptance and availability. We reserve the right to cancel or modify orders due to stock issues, incorrect pricing, or unforeseen circumstances. Order confirmation does not guarantee fulfillment until processed by the restaurant.`,
  Payments:     `Prices may vary depending on location, restaurant, and availability. Payments must be made through authorized methods such as UPI, cards, or cash on delivery. We are not responsible for failures caused by third-party payment gateways.`,
  Delivery:     `Delivery times are estimates and may vary due to traffic, weather, or restaurant delays. Users must provide accurate address details. Delivery partners will attempt delivery, but delays may occur during peak times.`,
  Cancellation: `Orders cannot be canceled once preparation begins. Refunds are only processed for valid issues such as failed payments or incorrect orders. Processing time depends on the payment method used.`,
  Account:      `Users are responsible for maintaining account security and all activities under their account. Any unauthorized use must be reported immediately. We reserve the right to suspend accounts violating policies.`,
  Liability:    `We act only as a platform connecting users and restaurants. We are not responsible for food quality, delivery delays, or third-party issues. Our liability is limited to the maximum extent permitted by law.`,
};

const Terms = () => {
  const topRef = useRef(null);

  const [progress, setProgress] = useState(0);

  const [active, setActive] = useState("Use");

  const [showTop, setShowTop] = useState(false);

  const year = useMemo(() => new Date().getFullYear(), []);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrollTop = window.scrollY;

      setProgress((scrollTop / totalHeight) * 100);
      setShowTop(scrollTop > 300);

      const mid = window.innerHeight / 2;
      SECTIONS.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= mid && rect.bottom >= mid) setActive(id);
        }
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top: offset, behavior: "smooth" });
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div ref={topRef} className="bg-gray-50 min-h-screen">

      <div
        className="fixed top-0 left-0 h-1 bg-orange-500 z-50 transition-all duration-75"
        style={{ width: `${progress}%` }}
      />

      <div className="bg-white py-16 px-6 text-center border-b border-gray-200">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-orange-500 mb-4">
            Terms & Conditions
          </h1>
          <p className="text-gray-500 text-base leading-relaxed">
            Please read these terms carefully before using our food delivery
            service. By continuing, you agree to comply with our policies,
            guidelines, and user responsibilities.
          </p>
          <p className="text-gray-400 text-xs mt-4">
            Last updated: January 2025
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 grid md:grid-cols-4 gap-8">

        <div className="hidden md:block md:col-span-1 sticky top-24 h-fit">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              Sections
            </p>
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => scrollTo(sec.id)}
                className={`block w-full text-left px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition
                  ${active === sec.id
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 hover:bg-orange-50 hover:text-orange-500"
                  }`}
              >
                {sec.title}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-3 space-y-5">
          {SECTIONS.map((sec, idx) => (
            <div
              key={sec.id}
              id={sec.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-bold text-orange-500 mb-3">
                {idx + 1}. {sec.title}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {CONTENT[sec.id]}
              </p>
            </div>
          ))}

        </div>
      </div>

      {showTop && (
        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-50 w-10 h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center shadow-md transition"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default Terms;
