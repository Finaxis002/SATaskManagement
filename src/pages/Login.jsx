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

  const subscribeToPushNotifications = async (userId, token) => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");

      // Register service worker
      await navigator.serviceWorker.register("/service-worker.js");

      // Wait for the service worker to be ready
      const swRegistration = await navigator.serviceWorker.ready;

      // Subscribe to push notifications
      const subscription = await swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey:
          "BFiAnzKqV9C437P10UIT5_daMne46XuJiVuSn4zQh2MQBjUIwMP9PMgk2TFQL9LOSiQy17eie7XRYZcJ0NE7jMs", // Replace with your VAPID public key
      });

      console.log("Sending subscription to backend:", { userId, subscription });
      console.log("Subscription object:", subscription);

      try {
        // Send the subscription object to your backend to save it
        const response = await fetch(
          "https://taskbe.sharda.co.in/api/push-notification/save-subscription", // Backend URL for saving the subscription
          {
            method: "POST",
            body: JSON.stringify({
              userId,
              subscription,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to save subscription");
        }
        console.log("Subscription saved.");
      } catch (error) {
        console.error("Failed to save subscription:", error);
      }
    } else {
      console.error("Notification permission denied.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!captchaToken) {
      Swal.fire({
        icon: "warning",
        title: "reCAPTCHA Required",
        text: "Please verify the reCAPTCHA before signing in.",
        confirmButtonColor: "#6366F1",
      });
      setLoading(false);
      return;
    }

     const computeIsToday = (iso) => {
    if (!iso) return false;
    const d = new Date(iso);
    const t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth();
  };

    try {
      const response = await axios.post(
        "https://taskbe.sharda.co.in/api/employees/login",
        {
          ...formData,
          captchaToken,
        }
      );

      const { token, _id, name, role, email, position, department, userId , birthdate,
      isBirthdayToday, } =
        response.data;

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

      dispatch(setAuth({ name, role, userId: _id, birthdate: birthdate || "",
        isBirthdayToday: !!birthdayFlag, }));

      // ✅ Fetch reminders to get linked Google email
      // ✅ Fetch linked email directly from linkedemails collection
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

      subscribeToPushNotifications(_id, token).finally(() => {
        window.location.href = "/";
      });
    } catch (err) {
      alert("Failed to log in. Please check your credentials.");
      console.error(err);
      setCaptchaToken(null);
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
