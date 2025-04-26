import { useState } from "react";
import axios from "axios";
import {
  FaUserAlt,
  FaEnvelope,
  FaSuitcase,
  FaBuilding,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import bgImage from "../assets/bg.png";

const AddEmployee = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    userId: "",
    password: "",
    role: "user",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleCheckboxChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      role: e.target.checked ? "admin" : "user", // Assign role based on checkbox
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/employees",
        formData
      );
      alert("Employee added successfully!");
      setFormData({
        name: "",
        email: "",
        position: "",
        department: "",
        userId: "",
        password: "",
        role: "user",
      });
    } catch (err) {
      alert("Failed to add employee!");
      console.error(err);
    }
  };

  return (
    <div className="relative w-full max-h-screen text-gray-800 bg-gray-100 py-14 px-6">
      <img
        src={bgImage}
        alt="Background"
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-10"
      />

      <div className="relative z-10 max-w-4xl mx-auto bg-white p-10 rounded-xl shadow-lg">
        <h2 className="text-3xl font-semibold text-center text-[#102E50] mb-10">
          Add New User
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Full Name */}
          <div className="relative">
            <FaUserAlt className="absolute top-4 left-4 text-gray-400" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="pl-10 w-full py-3 px-4 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <FaEnvelope className="absolute top-4 left-4 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="pl-10 w-full py-3 px-4 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Position */}
          <div className="relative">
            <FaSuitcase className="absolute top-4 left-4 text-gray-400" />
            <input
              type="text"
              name="position"
              placeholder="Job Position"
              value={formData.position}
              onChange={handleChange}
              required
              className="pl-10 w-full py-3 px-4 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Department */}
           {/* Department Dropdown */}
           <div className="relative">
            <FaBuilding className="absolute top-4 left-4 text-gray-400" />
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="pl-10 w-full py-3 px-4 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
               
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
              <option value="IT/Software">IT/Software</option>
              <option value="HR">HR</option>
              <option value="Administrator">Administrator</option>
            </select>
          </div>

          {/* User ID */}
          <div className="relative">
            <FaUserAlt className="absolute top-4 left-4 text-gray-400" />
            <input
              type="text"
              name="userId"
              placeholder="User ID"
              value={formData.userId}
              onChange={handleChange}
              required
              className="pl-10 w-full py-3 px-4 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FaSuitcase className="absolute top-4 left-4 text-gray-400" />
            <input
              type={passwordVisible ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="pl-10 pr-10 w-full py-3 px-4 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute top-4 right-4 text-gray-400"
            >
              {passwordVisible ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Admin Checkbox */}
          <div className="md:col-span-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="role"
                checked={formData.role === "admin"}
                onChange={handleCheckboxChange}
                className="form-checkbox h-5 w-5 text-blue-500"
              />
              <span className="ml-2 text-sm text-gray-900">Is this Admin?</span>
            </label>
          </div>

          {/* Submit Button (Full Width) */}
          <div className="md:col-span-2 flex justify-center mt-6">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 w-full md:w-1/2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-full shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 ease-in-out transform hover:scale-105"
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
