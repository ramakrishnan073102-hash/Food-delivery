import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useState, useEffect, useRef, useCallback, useMemo, useContext } from "react";
import { CartContext } from "../context/CartContext";
import Animation from "../assets/animation/Image_Animation_Video_Generation.mp4";

const USERS_KEY = "registeredUsers";

const Login = () => {
  const { login, user } = useAuth();
  const { clearCart }   = useContext(CartContext);
  const navigate        = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef(null);
  
  useEffect(() => {
    const t = setTimeout(() => {
      if (emailRef.current) {
        emailRef.current.value = "";
        emailRef.current.focus();
      }
    }, 100);
    window.scrollTo({ top: 0, behavior: "instant" });
    return () => clearTimeout(t);
  }, []);

  const togglePassword = useCallback(() => setShowPassword((p) => !p), []);

  const LoginSchema = useMemo(
    () =>
      Yup.object().shape({
        email:    Yup.string().email("Invalid email address").required("Email is required"),
        password: Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
      }),
    []
  );

  const handleSubmit = useCallback(
    (values, { setSubmitting, setFieldError }) => {
      const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

      const matchedUser = users.find(
        (u) =>
          u.email.toLowerCase() === values.email.toLowerCase() &&
          u.password === values.password
      );

      if (!matchedUser) {
        setFieldError("email",    "Invalid email or password");
        setFieldError("password", "Invalid email or password");
        setSubmitting(false);
        Swal.fire({
          title:              "Login Failed ❌",
          text:               "Invalid email or password. Please try again.",
          icon:               "error",
          confirmButtonColor: "#f97316",
        });
        return;
      }

      //  If a DIFFERENT user was logged in before, clear their cart 
      if (user && user.email.toLowerCase() !== matchedUser.email.toLowerCase()) {
        clearCart();
      }

      login(matchedUser.email, matchedUser.name);

      Swal.fire({
        title:             `Welcome back, ${matchedUser.name}! 👋`,
        text:              "Login successful",
        icon:              "success",
        timer:             1500,
        showConfirmButton: false,
      }).then(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
        navigate("/");
      });

      setSubmitting(false);
    },
    [login, navigate, user, clearCart]
  );

  return (
    <div className="flex items-center justify-center min-h-screen px-4 relative overflow-hidden">
      {/*  Full-screen video background */}
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

      {/*  Dark overlay for readability */}
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

        <h1 className="text-3xl font-bold text-center text-white mb-2 drop-shadow">
          Welcome Back 👋
        </h1>
        <p className="text-center text-white/70 mb-6 text-sm">
          Login to continue ordering
        </p>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col gap-4" autoComplete="off">
              <input type="text"     name="fakeEmail"    style={{ display: "none" }} readOnly tabIndex={-1} />
              <input type="password" name="fakePassword" style={{ display: "none" }} readOnly tabIndex={-1} />

              {/* EMAIL */}
              <div>
                <label className="text-sm font-medium text-white/90">Email</label>
                <Field
                  innerRef={emailRef}
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  autoComplete="new-password"
                  className="w-full p-3 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-orange-400 text-white placeholder-white/40" style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.25)"}}
                />
                <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1" />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-sm font-medium text-white/90">Password</label>
                <div className="relative">
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    autoComplete="new-password"
                    className="w-full p-3 rounded-lg mt-1 focus:outline-none focus:ring-2 focus:ring-orange-400 pr-16 text-white placeholder-white/40" style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.25)"}}
                  />
                  <span
                    onClick={togglePassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-xs text-orange-300 font-semibold select-none"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </span>
                </div>
                <ErrorMessage name="password" component="p" className="text-red-500 text-xs mt-1" />
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60 transition font-semibold mt-1"
              >                       
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </Form>
          )}
        </Formik>

        {/* Back to Home */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-sm text-white/50 hover:text-white/80 text-center transition"
        >
          ← Back to Home
        </button>


        <div className="flex justify-between mt-4 text-sm text-gray-500">
          <Link to="/forgot" className="text-white/70 hover:text-orange-300 transition">Forgot password?</Link>
          <Link to="/signup" className="text-orange-300 font-semibold hover:underline">Sign Up</Link>
        </div>

      </div>
    </div>
  );
};

export default Login;