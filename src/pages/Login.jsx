import { useState } from "react";
import axios from "axios";
import { FaUserAlt, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setAuth } from "../redux/authSlice"; // adjust path

const Login = () => {
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);

  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "https://sataskmanagementbackend.onrender.com/api/employees/login",
        formData
      );

      const { token, name, role, email, department } = response.data;

      // ✅ Store to localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("name", name);
      localStorage.setItem("role", role);
      localStorage.setItem("userId", email);
      localStorage.setItem("department", department); // ✅ Save department

      // ✅ Dispatch to Redux
      dispatch(setAuth({ name, role, userId: email }));

      // ✅ Redirect to dashboard or home
      window.location.href = "/";
    } catch (err) {
      alert("Failed to log in. Please check your credentials.");
      console.error(err);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-lg border border-gray-300">
        <h2 className="text-4xl font-bold text-center mb-6 text-gray-800">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* UserId Input */}
          <div className="flex items-center border border-gray-300 rounded-md mb-4">
            <FaUserAlt className="text-gray-400 mx-4" />
            <input
              type="text"
              name="userId"
              placeholder="User ID"
              value={formData.userId}
              onChange={handleChange}
              required
              className="w-full py-3 px-4 bg-gray-50 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Password Input */}
          <div className="flex items-center border border-gray-300 rounded-md mb-6">
            <FaLock className="text-gray-400 mx-4" />
            <input
              type={passwordVisible ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full py-3 px-4 bg-gray-50 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-gray-400 ml-2"
            >
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white text-lg font-semibold rounded-md hover:bg-indigo-700 transition duration-300 ease-in-out"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
