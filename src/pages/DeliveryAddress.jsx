import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Home, Briefcase, MapPin } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { useAuth } from "../context/AuthContext";
import Animation from "../assets/animation/Image_Animation_Video_Generation.mp4";

// ── Per-user address key (matches Profile.jsx) 
const addressKey = (email) => `deliveryAddresses_${email}`;

  
const addressTypes = [
  { label: "Home",   icon: <Home size={20} />      },      
  { label: "Work",   icon: <Briefcase size={20} /> },
  { label: "Others", icon: <MapPin size={20} />    },
];


const DeliveryAddress = () => {
  const { user } = useAuth();
  const addressRef = useRef(null);

  useEffect(() => {
    addressRef.current?.focus();
  }, []);

  const AddressSchema = useMemo(
    () =>
      Yup.object().shape({
        name:    Yup.string().min(2, "Too short").required("Name required"),
        address: Yup.string().min(5, "Too short").required("Address required"),
        city:    Yup.string().required("City required"),
        zipCode: Yup.string()
          .matches(/^[0-9]{6}$/, "Enter 6-digit pincode")
          .required("Pincode required"),
        phone: Yup.string()
          .matches(/^[0-9]{10}$/, "Enter 10-digit phone")
          .required("Phone required"),
        altPhone: Yup.string()
          .matches(/^[0-9]{10}$/, "Enter valid number")
          .nullable(),
        type: Yup.string().required("Select type"),
      }),
    []
  );

  // ── Save address under the logged-in user's key 
  const handleSubmit = useCallback(
    (values, { setSubmitting, resetForm }) => {
      // Get the current user's email
      const email = user
        ? (user.email || user).toLowerCase()
        : null;

      if (!email) {
        Swal.fire({
          title: "Login Required 🔐",
          text: "Please login to save an address.",
          icon: "warning",
          confirmButtonColor: "#f97316",
        });
        setSubmitting(false);
        return;
      }

      const key      = addressKey(email);
      const existing = JSON.parse(localStorage.getItem(key)) || [];
      const updated  = [...existing, values];
      localStorage.setItem(key, JSON.stringify(updated));

      Swal.fire({
        title: "Saved!",
        text: "Address saved successfully ✅",
        icon: "success",
        confirmButtonColor: "#f97316",
      });

      resetForm();
      setSubmitting(false);
    },
    [user]
  );

  return (
    <div className="flex justify-center items-center min-h-screen p-4 relative overflow-hidden">

      {/* ── Video background — no blur, plays transparently behind form */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      >
        <source src={Animation} type="video/mp4" />
      </video>

      {/* ── Soft dark overlay so text stays readable */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, rgba(0,0,0,0.50) 0%, rgba(10,4,0,0.42) 100%)",
        zIndex: 1,
      }} />

      {/* ── Card entrance animation */}
      <style>{`
        @keyframes cardIn {
          from { opacity:0; transform:translateY(32px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
      `}</style>

      {/* ── Transparent form card */}
      <div
        className="relative z-10 w-full max-w-lg p-8 rounded-3xl"
        style={{
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.22)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.40), 0 4px 20px rgba(249,115,22,0.20)",
          animation: "cardIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
      >

        <div className="text-center mb-6">
          <div className="text-4xl mb-2">📍</div>
          <h2 className="text-2xl font-bold text-white drop-shadow-md">
            Delivery Address
          </h2>
          <p className="text-white/60 text-xs mt-1">Save your address for faster checkout</p>
        </div>

        <Formik
          initialValues={{
            name: "", address: "", landmark: "", city: "",
            zipCode: "", phone: "", altPhone: "", instructions: "", type: "Home",
          }}
          validationSchema={AddressSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form className="flex flex-col gap-4">

              {/* NAME */}
              <div>
                <label className="text-sm font-medium text-white/90">Name</label>
                <Field name="name" placeholder="Full name" className="input" />
                <ErrorMessage name="name" component="p" className="error" />
              </div>

              {/* ADDRESS */}
              <div>
                <label className="text-sm font-medium text-white/90">Address</label>
                <Field
                  innerRef={addressRef}
                  as="textarea"
                  name="address"
                  rows={3}
                  placeholder="House no., street, area..."
                  className="input resize-none"
                />
                <ErrorMessage name="address" component="p" className="error" />
              </div>

              {/* LANDMARK */}
              <div>
                <label className="text-sm font-medium text-white/90">
                  Landmark <span className="text-white/50 font-normal">(optional)</span>
                </label>
                <Field name="landmark" placeholder="Near school, temple..." className="input" />
              </div>

              {/* CITY + PINCODE */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-white/90">City</label>
                  <Field name="city" placeholder="City" className="input" />
                  <ErrorMessage name="city" component="p" className="error" />
                </div>
                <div>
                  <label className="text-sm font-medium text-white/90">Pincode</label>
                  <Field name="zipCode" placeholder="6-digit pincode" className="input" />
                  <ErrorMessage name="zipCode" component="p" className="error" />
                </div>
              </div>

              {/* PHONE + ALT PHONE */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-white/90">Phone</label>
                  <Field name="phone" placeholder="10-digit number" className="input" />
                  <ErrorMessage name="phone" component="p" className="error" />
                </div>
                <div>
                  <label className="text-sm font-medium text-white/90">
                    Alt Phone <span className="text-white/50 font-normal">(optional)</span>
                  </label>
                  <Field name="altPhone" placeholder="Alternate number" className="input" />
                  <ErrorMessage name="altPhone" component="p" className="error" />
                </div>
              </div>

              {/* INSTRUCTIONS */}
              <div>
                <label className="text-sm font-medium text-white/90">
                  Delivery Instructions <span className="text-white/50 font-normal">(optional)</span>
                </label>
                <Field
                  as="textarea"
                  name="instructions"
                  rows={2}
                  placeholder="Leave at door, ring bell twice..."
                  className="input resize-none"
                />
              </div>

              {/* ADDRESS TYPE */}
              <div>
                <label className="text-sm font-medium text-white/90 mb-2 block">
                  Address Type
                </label>
                <div className="flex gap-3">
                  {addressTypes.map((type) => (
                    <div
                      key={type.label}
                      onClick={() => setFieldValue("type", type.label)}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition
                        ${values.type === type.label
                          ? "border-orange-400 bg-orange-500/30 text-orange-300"
                          : "border-white/20 text-white/70 hover:border-orange-400 bg-white/5"
                        }`}
                    > 
                      {type.icon}
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-3 rounded-xl font-semibold transition mt-1"
              >
                {isSubmitting ? "Saving..." : "Save Address"}
              </button>

            </Form>
          )}
        </Formik>

        <style>{`
          .input {
            width: 100%;
            padding: 12px;
            border: 1px solid rgba(255,255,255,0.25);
            border-radius: 10px;
            margin-top: 4px;
            font-size: 14px;
            background: rgba(255,255,255,0.10);
            color: #fff;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .input::placeholder { color: rgba(255,255,255,0.40); }
          .input:focus {
            border-color: #fb923c;
            box-shadow: 0 0 0 2px rgba(251,146,60,0.35);
            outline: none;
            background: rgba(255,255,255,0.15);
          }
          .error {
            color: #fca5a5;
            font-size: 12px;
            margin-top: 3px;
          }
        `}</style>
      </div>
    </div>
  );
};

export default DeliveryAddress;