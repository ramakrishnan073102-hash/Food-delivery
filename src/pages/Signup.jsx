import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import Animation from "../assets/animation/Image_Animation_Video_Generation.mp4";
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";

const USERS_KEY = "registeredUsers";

const Signup = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const nameRef = useRef(null);

  useEffect(() => {
    nameRef.current?.focus();
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const togglePassword        = useCallback(() => setShowPassword((p) => !p), []);
  const toggleConfirmPassword = useCallback(() => setShowConfirmPassword((p) => !p), []);

  const SignupSchema = useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string().min(3, "Too short").required("Name is required"),
        email: Yup.string().email("Invalid email").required("Email is required"),
        password: Yup.string().min(6, "Minimum 6 characters").required("Password is required"),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref("password"), null], "Passwords must match")
          .required("Confirm your password"),
      }),
    []
  );

  const handleSubmit = useCallback((values, { setSubmitting, setFieldError }) => {
    const existing = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

    const alreadyExists = existing.some(
      (u) => u.email.toLowerCase() === values.email.toLowerCase()
    );

    if (alreadyExists) {
      setFieldError("email", "This email is already registered");
      setSubmitting(false);
      return;
    }

    const newUser = {
      name:     values.name,
      email:    values.email.toLowerCase(),
      password: values.password,
    };
    localStorage.setItem(USERS_KEY, JSON.stringify([...existing, newUser]));

    Swal.fire({
      title:             "Account Created 🎉",
      text:              "You can now log in!",
      icon:              "success",
      confirmButtonColor: "#f97316",
      timer:             1800,
      showConfirmButton: false,
    }).then(() => navigate("/login"));

    setSubmitting(false);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 relative overflow-hidden">
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

      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg,rgba(0,0,0,0.42) 0%,rgba(10,4,0,0.32) 100%)",
        zIndex: 1,
      }} />

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
          Create Account
        </h1>
        <p className="text-center text-white/70 mb-6 text-sm">
          Join us and start ordering delicious food
        </p>

        <Formik
          initialValues={{ name: "", email: "", password: "", confirmPassword: "" }}
          validationSchema={SignupSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="flex flex-col gap-4">

              <div>
                <label className="text-sm font-medium text-white/90">Full Name</label>
                <Field
                  innerRef={nameRef}
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  className="w-full p-3 rounded-lg mt-1 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400" style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.25)"}}
                />
                <ErrorMessage name="name" component="p" className="text-red-500 text-xs mt-1" />
              </div>

              <div>
                <label className="text-sm font-medium text-white/90">Email</label>
                <Field
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="w-full p-3 rounded-lg mt-1 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400" style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.25)"}}
                />
                <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1" />
              </div>

              <div>
                <label className="text-sm font-medium text-white/90">Password</label>
                <div className="relative">
                  <Field
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter password"
                    className="w-full p-3 rounded-lg mt-1 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 pr-16" style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.25)"}}
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

              <div>
                <label className="text-sm font-medium text-white/90">Confirm Password</label>
                <div className="relative">
                  <Field
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm password"
                    className="w-full p-3 rounded-lg mt-1 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400 pr-16" style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.25)"}}
                  />
                  <span
                    onClick={toggleConfirmPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-xs text-orange-300 font-semibold select-none"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </span>
                </div>
                <ErrorMessage name="confirmPassword" component="p" className="text-red-500 text-xs mt-1" />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 active:bg-orange-700 disabled:opacity-60 transition font-semibold mt-1"
              >
                {isSubmitting ? "Creating Account..." : "Sign Up"}
              </button>
            </Form>
          )}
        </Formik>

        <p className="text-center text-white/70 mt-5 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-300 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
