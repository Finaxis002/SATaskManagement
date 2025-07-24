import { useState } from "react";
import axios from "axios";
import { FaUserAlt, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setAuth } from "../redux/authSlice"; // adjust path
import ReCAPTCHA from "react-google-recaptcha";
import Swal from "sweetalert2";

const RECAPTCHA_SITE_KEY = "6LfwLlMrAAAAAIFtLSnFxwGP_xfkeDU7xuz69sLa";

const Login = () => {
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);

  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!captchaToken) {
      Swal.fire({
        icon: "warning",
        title: "reCAPTCHA Required",
        text: "Please verify the reCAPTCHA before signing in.",
        confirmButtonColor: "#6366F1", // Indigo color to match your theme
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "https://taskbe.sharda.co.in/api/employees/login",
        {
          ...formData,
          captchaToken, // ✅ corrected key name
        }
      );

      const { token, name, role, email, department } = response.data;
      const loginExpiryHours = 10;
      const loginExpiryTime = Date.now() + loginExpiryHours * 60 * 60 * 1000;

      localStorage.setItem("authToken", token);
      const normalizedName =
        name && name.toLowerCase() === "admin" ? "admin" : name;
      localStorage.setItem("name", normalizedName);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", email);
      localStorage.setItem("department", department);
      localStorage.setItem("triggerLoginReminder", "true");
      localStorage.setItem("loginExpiry", loginExpiryTime);
      localStorage.setItem("tokenLocal", token);

      dispatch(setAuth({ name: normalizedName, role, userId: email }));
      window.location.href = "/";
    } catch (err) {
      alert("Failed to log in. Please check your credentials.");
      console.error(err);
      setCaptchaToken(null); // ✅ optional: clear captcha state
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-gray-50">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-12 w-12 text-indigo-600 mb-4"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            ></path>
          </svg>
          <span className="text-lg text-indigo-600 font-semibold">
            Signing you in...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl overflow-hidden shadow-xl">
        {/* Branding Header */}
        {/* <div className="bg-indigo-700 px-8 flex items-center justify-center space-x-4">
          <div className=" p-2">
           
            <img
              src="/SALOGO.png" // or your ASA logo path
              alt="ASA Logo"
              className="h-16 w-16 object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Anunay Sharda Associates</h1>
          </div>
        </div> */}

        <div className="bg-gradient-to-r from-indigo-800 to-indigo-600 py-4 px-6 shadow-md">
          <div className="max-w-6xl mx-auto flex items-center justify-start space-x-5">
            {/* Logo with subtle shine effect */}
            <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <img
                src="/SALOGO.png"
                alt="ASA Logo"
                className="h-14 w-14 object-contain drop-shadow-lg"
              />
            </div>

            {/* Text with elegant typography */}
            <div className="border-l border-white/20 h-14 flex items-center pl-2">
              <div>
                <h1 className="text-2xl font-medium text-white tracking-tight leading-none">
                  Anunay Sharda & Associates
                </h1>
                <p className="text-indigo-100 text-sm font-light tracking-wider mt-1"></p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-8">
          <div className="flex flex-col items-center">
            <h2 className="text-3xl font-light text-gray-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500 mb-8">Please enter your credentials</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User ID Field */}
            <div className="space-y-1">
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-gray-700"
              >
                User ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="userId"
                  name="userId"
                  placeholder="Enter your user ID"
                  value={formData.userId}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {passwordVisible ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>
            <ReCAPTCHA
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={(token) => setCaptchaToken(token)}
            />

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                Sign In
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} Anunay Sharda Associates. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
