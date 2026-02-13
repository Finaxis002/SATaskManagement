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
  FaTimes,
} from "react-icons/fa";
import bgImage from "../assets/bg.png"; // Assuming this path is correct

import DepartmentSelector from "../Components/Tasks/DepartmentSelector"; // Assuming this component exists
import { showAlert } from "../utils/alert"; // Assuming this utility exists

// Function to convert relative URL to absolute URL
const toAbsoluteUrl = (path) => {
  if (!path) return "";
  const API_BASE = "https://taskbe.sharda.co.in";
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
      picked.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
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
      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("email", formData.email);
      fd.append("position", formData.position);
      fd.append("department", department);
      fd.append("userId", formData.userId);
      fd.append("role", formData.role);
      fd.append("birthdate", formData.birthdate || "");
      fd.append("address", formData.address || "");
      fd.append("aadhaar", formData.aadhaar || "");

      if (!employeeToEdit) {
        fd.append("password", formData.password);
      }

      if (aadhaarFile) {
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
      console.log("Department on frontend:", department);
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        {/* Backdrop */}
        <div
          className="fixed inset-0 transition-opacity"
          onClick={handleCloseModal}
        ></div>

        {/* Modal Container */}
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-5">
            <img
              src={bgImage}
              alt="Background"
              className="w-full h-full object-cover"
            />
          </div>

          <div
            className="px-6 py-5 sm:px-8 sm:py-6 flex items-center justify-between shadow-lg relative z-20 mt-4"
            style={{ background: "#4332d2" }}
          >
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                {employeeToEdit ? "Edit User" : "Add New User"}
              </h3>
              <p className="text-sm mt-1" style={{ color: "#e0dcf9" }}>
                {employeeToEdit
                  ? "Update employee information"
                  : "Fill in the details to add a new employee"}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-200 hover:rotate-90"
              aria-label="Close"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          <div className="relative z-10 max-h-[calc(90vh-7rem)] overflow-y-auto">
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* Personal Information Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="relative group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <FaUserAlt className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="pl-11 w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="relative group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type="email"
                        name="email"
                        placeholder="example@company.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="pl-11 w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* User ID */}
                  <div className="relative group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User ID *
                    </label>
                    <div className="relative">
                      <FaIdCard className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type="text"
                        name="userId"
                        placeholder="Enter user ID"
                        value={formData.userId}
                        onChange={handleChange}
                        required
                        className="pl-11 w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Birthdate */}
                  <div className="relative group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type="date"
                        name="birthdate"
                        value={formData.birthdate}
                        onChange={handleChange}
                        max={todayStr}
                        className="pl-11 w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Work Information Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                  Work Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Position */}
                  <div className="relative group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Position *
                    </label>
                    <div className="relative">
                      <FaSuitcase className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type="text"
                        name="position"
                        placeholder="e.g., Software Engineer"
                        value={formData.position}
                        onChange={handleChange}
                        required
                        className="pl-11 w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  {/* Role */}
                  <div className="relative group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role *
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>

                  {/* Department - Full Width */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <DepartmentSelector
                      selectedDepartments={department}
                      setSelectedDepartments={setDepartment}
                    />
                  </div>
                </div>
              </div>

              {/* Security Section - Only on Add */}
              {!employeeToEdit && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                    Security
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="relative group">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <FaLock className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                        <input
                          type={passwordVisible ? "text" : "password"}
                          name="password"
                          placeholder="Enter secure password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className="pl-11 pr-11 w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          {passwordVisible ? (
                            <FaEyeSlash className="text-lg" />
                          ) : (
                            <FaEye className="text-lg" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Information Section */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                  Additional Information
                </h4>
                <div className="space-y-4">
                  {/* Address */}
                  <div className="relative group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <div className="relative">
                      <FaBuilding className="absolute top-4 left-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                      <textarea
                        name="address"
                        rows={3}
                        placeholder="Enter full address"
                        value={formData.address}
                        onChange={handleChange}
                        className="pl-11 w-full py-3 px-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Aadhaar File */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aadhaar File (Image/PDF)
                    </label>

                    {/* Existing file preview */}
                    {existingAadhaarFileUrl && !aadhaarFile && (
                      <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                        <span className="text-sm text-blue-700 font-medium">
                          Current file attached
                        </span>
                        <a
                          href={existingAadhaarFileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold underline"
                        >
                          View File
                        </a>
                      </div>
                    )}

                    {/* File Input */}
                    <div className="relative">
                      <input
                        type="file"
                        id="aadhaarFile"
                        accept="image/*,.pdf"
                        onChange={handleAadhaarFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex items-center justify-between bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-indigo-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {aadhaarFile
                                ? aadhaarFile.name
                                : "No file chosen"}
                            </p>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, PDF up to 5MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="flex-shrink-0 ml-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors"
                          onClick={() =>
                            document.getElementById("aadhaarFile").click()
                          }
                        >
                          Browse
                        </button>
                      </div>
                    </div>

                    {/* Image Preview */}
                    {aadhaarFile && aadhaarFile.type.startsWith("image/") && (
                      <div className="mt-3 p-2 bg-gray-50 rounded-xl border border-gray-200">
                        <img
                          alt="Aadhaar preview"
                          src={URL.createObjectURL(aadhaarFile)}
                          className="h-32 w-full object-contain rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                >
                  {employeeToEdit ? "Update User" : "Save User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;
