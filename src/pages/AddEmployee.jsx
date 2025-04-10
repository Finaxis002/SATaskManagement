import { useState } from "react";
import axios from "axios";
import { FaUserAlt, FaEnvelope, FaSuitcase, FaBuilding, FaEye, FaEyeSlash } from "react-icons/fa"; // Added eye icons for password visibility
import bgImage from "../assets/bg.png"; // Adjust path as needed

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    userId: "",
    password: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/api/employees", formData);
      alert("Employee added successfully!");
      setFormData({
        name: "",
        email: "",
        position: "",
        department: "",
        userId: "",
        password: "",
      });
    } catch (err) {
      alert("Failed to add employee!");
      console.error(err);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <div className="relative w-full h-screen text-gray-800 bg-gray-100 p-14">
      <img
        src={bgImage}
        alt="Background"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      />
      <div className="relative max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Add New Employee
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Input */}
          <div className="flex items-center border border-gray-300 rounded-md">
            <FaUserAlt className="text-gray-400 mx-4" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full py-3 px-4 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email Input */}
          <div className="flex items-center border border-gray-300 rounded-md">
            <FaEnvelope className="text-gray-400 mx-4" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full py-3 px-4 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Position Input */}
          <div className="flex items-center border border-gray-300 rounded-md">
            <FaSuitcase className="text-gray-400 mx-4" />
            <input
              type="text"
              name="position"
              placeholder="Job Position"
              value={formData.position}
              onChange={handleChange}
              required
              className="w-full py-3 px-4 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Department Input */}
          <div className="flex items-center border border-gray-300 rounded-md">
            <FaBuilding className="text-gray-400 mx-4" />
            <input
              type="text"
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
              className="w-full py-3 px-4 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
              className="w-full py-3 px-4 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password Input */}
          <div className="flex items-center border border-gray-300 rounded-md mb-6">
            <FaSuitcase className="text-gray-400 mx-4" />
            <input
              type={passwordVisible ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full py-3 px-4 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full py-3 bg-blue-600 text-white text-lg font-semibold rounded-md hover:bg-blue-700 transition duration-300 ease-in-out"
            >
              Add Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
