import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUserAlt, FaLock, FaEye, FaEyeSlash, FaSync } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setAuth } from "../redux/authSlice";
import Swal from "sweetalert2";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaText, setCaptchaText] = useState("");
  const [userCaptchaInput, setUserCaptchaInput] = useState("");
  const [error, setError] = useState("");

  const dispatch = useDispatch();

  // Generate random captcha text
  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let captcha = "";
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(captcha);
    setUserCaptchaInput("");
  };

  // Generate captcha on component mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const computeIsToday = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    const t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Verify captcha
    if (userCaptchaInput !== captchaText) {
      Swal.fire({
        icon: "warning",
        title: "Invalid CAPTCHA",
        text: "Please enter the correct CAPTCHA code.",
        confirmButtonColor: "#6366F1",
      });
      setLoading(false);
      generateCaptcha(); // Generate new captcha
      return;
    }

    try {
      const response = await axios.post(
        "https://taskbe.sharda.co.in/api/employees/login",
        {
          ...formData,
          captchaToken: "manual-captcha-verified" // Backend ke liye dummy token
        }
      );

      const { token, _id, name, role, email, position, department, userId, birthdate, isBirthdayToday } = response.data;

      const birthdayFlag =
        typeof isBirthdayToday === "boolean"
          ? isBirthdayToday
          : computeIsToday(birthdate);

      const loginExpiryHours = 10;
      const loginExpiryTime = Date.now() + loginExpiryHours * 60 * 60 * 1000;

      const userData = {
        _id,
        name,
        email,
        position,
        department,
        userId,
        role,
        birthdate: birthdate || "",
        isBirthdayToday: birthdayFlag,
      };

      localStorage.setItem("authToken", token);
      localStorage.setItem("loginExpiry", loginExpiryTime);
      localStorage.setItem("tokenLocal", token);
      localStorage.setItem("triggerLoginReminder", "true");
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("name", name);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", _id);
      localStorage.setItem("birthdate", birthdate || "");
      localStorage.setItem("isBirthdayToday", JSON.stringify(!!birthdayFlag));

      dispatch(setAuth({ 
        name, 
        role, 
        userId: _id, 
        birthdate: birthdate || "",
        isBirthdayToday: !!birthdayFlag 
      }));

      try {
        const linkedEmailResponse = await axios.get(
          "https://taskbe.sharda.co.in/api/linkedemails"
        );

        const linkedData = linkedEmailResponse.data?.data || [];
        const match = linkedData.find((item) =>
          item.linkedUserIds.includes(userId)
        );

        if (match && match.email) {
          localStorage.setItem("googleEmail", match.email);
          console.log("✅ Linked Google email saved:", match.email);
        } else {
          localStorage.removeItem("googleEmail");
          console.log("⚠️ No linked email found for user, cleared googleEmail");
        }
      } catch (linkedErr) {
        console.error("❌ Failed fetching linked emails:", linkedErr);
        localStorage.removeItem("googleEmail");
      }

      navigate("/", { replace: true });
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid User ID or Password. Please try again.";
      setError(errorMessage);
      console.error(err);
      generateCaptcha(); // Generate new captcha on error
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl overflow-hidden shadow-xl">
        {/* Branding Header */}
        <div className="bg-gradient-to-r from-indigo-800 to-indigo-600 py-4 px-6 shadow-md">
          <div className="max-w-6xl mx-auto flex items-center justify-start space-x-5">
            <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
              <img
                src="/SALOGO.png"
                alt="ASA Logo"
                className="h-14 w-14 object-contain drop-shadow-lg"
              />
            </div>

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
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

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

            {/* Letter CAPTCHA */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Enter CAPTCHA
              </label>
              
              {/* CAPTCHA Display */}
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gradient-to-br from-indigo-100 to-indigo-50 border-2 border-indigo-300 rounded-lg p-4 select-none">
                  <p className="text-center text-2xl font-bold tracking-widest text-indigo-800 select-none" style={{
                    fontFamily: 'monospace',
                    letterSpacing: '0.3em',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
                  }}>
                    {captchaText}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  title="Refresh CAPTCHA"
                >
                  <FaSync className="h-5 w-5" />
                </button>
              </div>

              {/* CAPTCHA Input */}
              <input
                type="text"
                placeholder="Enter the code above"
                value={userCaptchaInput}
                onChange={(e) => setUserCaptchaInput(e.target.value)}
                required
                className="block w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
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
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
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