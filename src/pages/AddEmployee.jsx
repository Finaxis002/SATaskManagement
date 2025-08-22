import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaUserAlt,
  FaEnvelope,
  FaSuitcase,
  FaBuilding,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaCalendarAlt,
  FaIdCard,
} from "react-icons/fa";
import bgImage from "../assets/bg.png";

import DepartmentSelector from "../Components/Tasks/DepartmentSelector";
import { showAlert } from "../utils/alert";
// Function to convert relative URL to absolute URL
const toAbsoluteUrl = (path) => {
  if (!path) return "";
  const API_BASE = "https://taskbe.sharda.co.in"; // Your API base URL
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
};

const AddEmployee = ({
  showEditModal,
  setShowEditModal,
  employeeToEdit,
  handleCloseModal,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    department: [],   
    userId: "",
    password: "",
    role: "user",
    birthdate: "",
    address: "",
    aadhaar: "",
  });
  const [department, setDepartment] = useState([]);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const departmentOptions = [
    { value: "Marketing", label: "Marketing" },
    { value: "Sales", label: "Sales" },
    { value: "Operations", label: "Operations" },
    { value: "IT/Software", label: "IT/Software" },
    { value: "HR", label: "HR" },
    { value: "Administrator", label: "Administrator" },
  ];

  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [existingAadhaarFileUrl, setExistingAadhaarFileUrl] = useState("");
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

  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        name: employeeToEdit.name,
        email: employeeToEdit.email,
        position: employeeToEdit.position,
        // department: employeeToEdit.department || [],
          department: Array.isArray(employeeToEdit.department)
        ? employeeToEdit.department
        : JSON.parse(employeeToEdit.department || "[]"),
        userId: employeeToEdit.userId,
        role: employeeToEdit.role,
        birthdate: employeeToEdit.birthdate
          ? new Date(employeeToEdit.birthdate).toISOString().slice(0, 10)
          : "",
        address: employeeToEdit.address || "",
        aadhaar: employeeToEdit.aadhaar || employeeToEdit.aadhaarNumber || "",
      });
      setDepartment(employeeToEdit.department || []);
 const rawPath =
        employeeToEdit.aadhaarFileUrl || employeeToEdit.aadhaarFile || "";
      setExistingAadhaarFileUrl(toAbsoluteUrl(rawPath));

      setAadhaarFile(null); 
      
    }
  }, [employeeToEdit]);



  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.birthdate) {
    const picked = new Date(formData.birthdate);
    const today = new Date();
    picked.setHours(0,0,0,0);
    today.setHours(0,0,0,0);
    if (picked > today) {
      showAlert("Birthdate cannot be in the future.");
      return;
    }
  }
    if (department.length === 0) {
      showAlert("Please select at least one department.");
      return;
    }

    try {
      // Build multipart body
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("email", formData.email);
      fd.append("position", formData.position);

      // Send department as JSON string (parse it on the server)
      fd.append("department", department); 
      fd.append("userId", formData.userId);
      fd.append("role", formData.role);
      fd.append("birthdate", formData.birthdate || "");
      fd.append("address", formData.address || "");
      fd.append("aadhaar", formData.aadhaar || "");

      // Only send password on create
      if (!employeeToEdit) {
        fd.append("password", formData.password);
      }

      // Attach Aadhaar file if selected
      if (aadhaarFile) {
        // field name MUST match upload.single("aadhaarFile")
        fd.append("aadhaarFile", aadhaarFile);
      }

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (employeeToEdit) {
        await axios.put(
          `https://taskbe.sharda.co.in/api/employees/${employeeToEdit._id}`,
          fd,
          config
        );
        showAlert("Employee updated successfully!");
      } else {
        await axios.post(
          "https://taskbe.sharda.co.in/api/employees",
          fd,
          config
        );
        showAlert("Employee added successfully!");
      }

      handleCloseModal();
    console.log("Department on frontend:", department); // Before sending to backend

    } catch (err) {
      console.error(err);
      showAlert("Failed to save employee!");
    }
  };

  const handleAadhaarFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) {
      setAadhaarFile(null);
      return;
    }
    const okType = f.type.startsWith("image/") || f.type === "application/pdf";
    if (!okType) {
      showAlert("Only image or PDF allowed for Aadhaar.");
      e.target.value = "";
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      showAlert("File must be 5 MB or less.");
      e.target.value = "";
      return;
    }
    setAadhaarFile(f);
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="relative w-full max-h-screen text-gray-800  py-14 px-6">
      <img
        src={bgImage}
        alt="Background"
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-10"
      />

      <div className="relative z-10 max-w-4xl mx-auto bg-white p-10 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-center">
          {employeeToEdit ? "Edit User" : "Add New User"}
        </h3>
        <button
          type="button"
          onClick={handleCloseModal}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-2xl font-bold focus:outline-none"
          aria-label="Close"
        >
          &times;
        </button>

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
          <DepartmentSelector
            selectedDepartments={department}
            setSelectedDepartments={setDepartment}
          />

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

          {/* Password (Only show on Add User) */}
          {!employeeToEdit && (
            <div className="relative">
              <FaLock className="absolute top-4 left-4 text-gray-400" />
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
          )}

          {/* Birthdate (half width) */}
          <div className="relative">
            <FaCalendarAlt className="absolute top-4 left-4 text-gray-400" />
            <input
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
               max={todayStr}       
              className="pl-10 w-full py-3 px-4 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Role (half width) */}
          <div className="relative">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full py-3 px-4 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          {/* Address */}
          <div className="relative md:col-span-2">
            <FaBuilding className="absolute top-4 left-4 text-gray-400" />
            <textarea
              name="address"
              rows={2}
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="pl-10 w-full py-3 px-4 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Aadhaar File (image/pdf) */}
          <div className="relative md:col-span-2">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Aadhaar File (image/PDF)
            </label>

            {/* Existing file (edit mode) */}
            {existingAadhaarFileUrl && !aadhaarFile && (
              <div className="mb-2 text-sm">
                Current file:{" "}
                <a
                  href={existingAadhaarFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  View / Download
                </a>
              </div>
            )}

            {/* Custom file input styling */}
            <div className="relative">
              <input
                type="file"
                id="aadhaarFile"
                accept="image/*,.pdf"
                onChange={handleAadhaarFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex items-center justify-between bg-gray-100 border border-gray-300 rounded-md p-2">
                <span className="text-gray-500 truncate mr-2">
                  {aadhaarFile
                    ? aadhaarFile.name
                    : existingAadhaarFileUrl
                    ? "Current file attached"
                    : "Choose file"}
                </span>
                <button
                  type="button"
                  className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
                  onClick={() => document.getElementById("aadhaarFile").click()}
                >
                  Browse
                </button>
              </div>
            </div>

            {/* Preview if image selected */}
            {aadhaarFile && aadhaarFile.type.startsWith("image/") && (
              <div className="mt-2">
                <img
                  alt="Aadhaar preview"
                  src={URL.createObjectURL(aadhaarFile)}
                  className="h-24 rounded border"
                />
              </div>
            )}
          </div>

          {/* Submit Button (Full Width) */}
          <div className="md:col-span-2 flex justify-center mt-6">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 w-full md:w-1/2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-semibold rounded-full shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              {employeeToEdit ? "Update User" : "Save User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
