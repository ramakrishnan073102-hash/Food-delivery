import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useEffect, useRef, useMemo, useCallback, useState } from "react";
import Animation from "../assets/animation/Image_Animation_Video_Generation.mp4";

const USERS_KEY = "registeredUsers";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Schemas 
const EmailSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
});

const OTPSchema = Yup.object().shape({
  otp: Yup.string()
    .matches(/^\d{6}$/, "Enter the 6-digit code")
    .required("OTP is required"),
});

const PasswordSchema = Yup.object().shape({
  password: Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

// ── 6-box OTP input 
const OTPBoxes = ({ value, onChange }) => {
  const inputs = useRef([]);
  const digits = (value || "").split("").concat(Array(6).fill("")).slice(0, 6);

  const handleKey = (e, idx) => {
    if (e.key === "Backspace") {
      const next = digits.map((d, i) => (i === idx ? "" : d));
      onChange(next.join(""));
      if (idx > 0 && !digits[idx]) inputs.current[idx - 1]?.focus();
    }
  };

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, i) => (i === idx ? val : d));
    onChange(next.join(""));
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      onChange(pasted.padEnd(6, "").slice(0, 6));
      inputs.current[Math.min(pasted.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"      
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKey(e, i)}
          className="w-11 h-12 text-center text-lg font-bold rounded-lg outline-none transition-all focus:ring-2 focus:ring-orange-400 text-white" style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.28)"}}
        />
      ))}
    </div>
  );
};

// ── Countdown hook 
const useCountdown = (initial) => {
  const [seconds, setSeconds] = useState(initial);  
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [running, seconds]);

  const start = useCallback(() => { setSeconds(initial); setRunning(true); }, [initial]);
  const reset = useCallback(() => { setSeconds(initial); setRunning(false); }, [initial]);

  return { seconds, expired: seconds <= 0 && running === false ? false : seconds <= 0, start, reset };
};

// ── Main 
const ForgotPassword = () => {
  const navigate = useNavigate();
  const emailRef = useRef(null);

  const [step, setStep]         = useState(1);   // 1=email  2=otp  3=newpass
  const [userEmail, setUserEmail] = useState("");
  const [otpValue, setOtpValue]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const countdown = useCountdown(60);

  useEffect(() => {
    const t = setTimeout(() => emailRef.current?.focus(), 100);
    window.scrollTo({ top: 0, behavior: "instant" });
    return () => clearTimeout(t);
  }, []);

  // Step 1 — verify email & send OTP
  const handleEmailSubmit = useCallback((values, { setSubmitting }) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const user = users.find((u) => u.email.toLowerCase() === values.email.toLowerCase());

    if (!user) {
      Swal.fire({
        title: "User Not Found ❌",
        text: "No account exists with this email.",
        icon: "error",
        confirmButtonColor: "#f97316",
      });
      setSubmitting(false);
      return;
    }

    const otp = generateOTP();
    sessionStorage.setItem("resetOTP", otp);
    sessionStorage.setItem("resetEmail", values.email);
    setUserEmail(values.email);

    Swal.fire({
      title: "OTP Sent! 📩",
      html: `A 6-digit code has been sent to <b>${values.email}</b><br/><br/>
             <span style="font-size:11px;color:#9ca3af">(Demo — your OTP is <b style="color:#f97316;font-size:18px;letter-spacing:3px">${otp}</b>)</span>`,
      icon: "success",
      confirmButtonColor: "#f97316",
      confirmButtonText: "Enter OTP →",
    }).then(() => {
      setStep(2);
      countdown.start();
    });

    setSubmitting(false);
  }, [countdown]);

  // Step 2 — verify OTP
  const handleOTPSubmit = useCallback((values, { setSubmitting }) => {
    const stored = sessionStorage.getItem("resetOTP");

    if (values.otp !== stored) {
      Swal.fire({
        title: "Incorrect OTP ❌",
        text: "The code you entered is wrong. Please try again.",
        icon: "error",
        confirmButtonColor: "#f97316",
      });
      setSubmitting(false);
      return;
    }

    sessionStorage.removeItem("resetOTP");
    setStep(3);
    setSubmitting(false);
  }, []);

  // Step 3 — save new password
  const handlePasswordSubmit = useCallback((values, { setSubmitting }) => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const updated = users.map((u) =>
      u.email.toLowerCase() === userEmail.toLowerCase()
        ? { ...u, password: values.password }
        : u
    );
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    sessionStorage.removeItem("resetEmail");

    Swal.fire({
      title: "Password Reset! 🎉",
      text: "Your password has been updated successfully.",
      icon: "success",
      confirmButtonColor: "#f97316",
      confirmButtonText: "Login Now",
    }).then(() => navigate("/login"));

    setSubmitting(false);
  }, [userEmail, navigate]);

  // Resend OTP
  const handleResend = useCallback(() => {
    if (!countdown.expired) return;
    const otp = generateOTP();
    sessionStorage.setItem("resetOTP", otp);
    setOtpValue("");
    countdown.start();
    Swal.fire({
      title: "OTP Resent 📩",
      html: `New code sent to <b>${userEmail}</b><br/>
             <span style="font-size:11px;color:#9ca3af">(Demo — <b style="color:#f97316;font-size:18px;letter-spacing:3px">${otp}</b>)</span>`,
      icon: "info",
      confirmButtonColor: "#f97316",
      timer: 3000,
      timerProgressBar: true,
    });
  }, [countdown, userEmail]);

  const stepLabel = ["", "Forgot Password 🔐", "Verify OTP 📩", "New Password 🔑"][step];
  const stepSub   = [
    "",
    "Enter your email to receive a verification code",
    `We sent a 6-digit code to ${userEmail}`,
    "Create a strong new password",
  ][step];

  return (
    <div className="flex items-center justify-center min-h-screen px-4 relative overflow-hidden">
      {/* ── Full-screen video background */}
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

      {/* ── Dark overlay for readability */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg,rgba(0,0,0,0.42) 0%,rgba(10,4,0,0.32) 100%)",
        zIndex: 1,
      }} />

      {/* ── Glass card */}
      <style>{`
        @keyframes cardIn {
          from { opacity:0; transform:translateY(32px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
      `}</style>
      <div
        className="relative z-10 p-8 rounded-3xl w-full max-w-md"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.18)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.45), 0 4px 20px rgba(249,115,22,0.20)",
          animation: "cardIn 0.55s cubic-bezier(0.34,1.56,0.64,1) both",
          
        }}
      >

        {/* Header */}
        <h1 className="text-3xl font-bold text-center text-white mb-1 drop-shadow">{stepLabel}</h1>
        <p className="text-center text-white/65 mb-6 text-sm">{stepSub}</p>

        {/* Step pills */}
        <div className="flex items-center justify-center gap-2 mb-7">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${step > s ? "bg-orange-500 text-white" : step === s ? "bg-orange-500 text-white ring-4 ring-orange-100" : "text-white/50"}`}>
                {step > s ? "✓" : s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 rounded ${step > s ? "bg-orange-400" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {/* ── STEP 1: EMAIL ── */}
        {step === 1 && (
          <Formik initialValues={{ email: "" }} validationSchema={EmailSchema} onSubmit={handleEmailSubmit}>
            {({ isSubmitting }) => (
              <Form className="flex flex-col gap-4" autoComplete="off">
                <div>
                  <label className="text-sm font-medium text-white/90">Email</label>
                  <Field
                    innerRef={emailRef}
                    type="email"
                    name="email"
                    placeholder="Enter your registered email"
                    className="w-full p-3 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder-white/40" style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.25)"}}
                  />
                  <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition font-semibold"
                >
                  {isSubmitting ? "Sending..." : "Send OTP"}
                </button>
              </Form>
            )}
          </Formik>
        )}


        
        {/* ── STEP 2: OTP ── */}
        {step === 2 && (
          <Formik
            initialValues={{ otp: "" }}
            validationSchema={OTPSchema}
            onSubmit={handleOTPSubmit}
            enableReinitialize
          >
            {({ isSubmitting, setFieldValue, errors, touched }) => (
              <Form className="flex flex-col gap-4" autoComplete="off">
                <div>
                  <label className="block text-sm font-medium text-white/90 text-center mb-3">
                    Enter 6-digit code
                  </label>
                  <OTPBoxes
                    value={otpValue}
                    onChange={(val) => { setOtpValue(val); setFieldValue("otp", val); }}
                  />
                  <Field type="hidden" name="otp" value={otpValue} />
                  {errors.otp && touched.otp && (
                    <p className="text-red-500 text-xs mt-2 text-center">{errors.otp}</p>
                  )}
                </div>

                {/* Countdown / Resend */}
                <p className="text-center text-sm text-white/65">
                  {!countdown.expired ? (
                    <>Resend code in <span className="font-semibold text-orange-500">{countdown.seconds}s</span></>
                  ) : (
                    <button type="button" onClick={handleResend} className="text-orange-300 font-semibold hover:underline">
                      Resend OTP
                    </button>
                  )}
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting || otpValue.length < 6}
                  className="bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 disabled:opacity-60 transition font-semibold"
                >
                  {isSubmitting ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setOtpValue(""); countdown.reset(); }}
                  className="text-sm text-white/50 hover:text-white/80 text-center transition"
                >
                  ← Change email
                </button>
              </Form>
            )}
          </Formik>
        )}

        {/* ── STEP 3: NEW PASSWORD ── */}
        {step === 3 && (
          <Formik
            initialValues={{ password: "", confirmPassword: "" }}
            validationSchema={PasswordSchema}
            onSubmit={handlePasswordSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="flex flex-col gap-4" autoComplete="off">

                <div>
                  <label className="text-sm font-medium text-white/90">New Password</label>
                  <div className="relative mt-1">
                    <Field
                      type={showPass ? "text" : "password"}
                      name="password"
                      placeholder="Min. 6 characters"
                      className="w-full p-3 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder-white/40" style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.25)"}}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 text-sm"
                    >
                      {showPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                  <ErrorMessage name="password" component="p" className="text-red-500 text-xs mt-1" />
                </div>

                <div>
                  <label className="text-sm font-medium text-white/90">Confirm Password</label>
                  <div className="relative mt-1">
                    <Field
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Re-enter password"
                      className="w-full p-3 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder-white/40" style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.25)"}}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 text-sm"
                    >
                      {showConfirm ? "🙈" : "👁️"}
                    </button>
                  </div>
                  <ErrorMessage name="confirmPassword" component="p" className="text-red-500 text-xs mt-1" />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 transition font-semibold"
                >
                  {isSubmitting ? "Updating..." : "Reset Password"}
                </button>
              </Form>
            )}
          </Formik>
        )}

        {/* Back to E-mail */}
        <button
          type="button"
          onClick={() => { setStep(1); setOtpValue(""); countdown.reset(); }}
          className="text-sm text-white/50 hover:text-white/80 text-center transition"
        >
          ← Change email
        </button>

        {/* Footer */}
        <div className="text-center mt-4 text-sm text-white/65">
          Remember your password?{" "}
          <Link to="/login" className="text-orange-300 font-semibold hover:underline">
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;