import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUsers,
  deleteUser,
  resetPassword,
  updateUser,
} from "../redux/userSlice";
import { FaTrash, FaSyncAlt, FaEdit } from "react-icons/fa";
import bgImage from "../assets/bg.png";
import axios from "axios";
import DepartmentSelector from "../Components/Tasks/DepartmentSelector";
import { showAlert } from "../utils/alert"; // Import the showAlert function
import Swal from "sweetalert2";


const AllEmployees = () => {
  const dispatch = useDispatch();
  const { list: users, loading, error } = useSelector((state) => state.users);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [department, setDepartment] = useState([]);
  const [updatedUserData, setUpdatedUserData] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    role: "",
    userId: "",
  }); // Stores the form data to be updated

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // const handleDelete = (id) => {
  //   if (window.confirm("Are you sure you want to delete this user?")) {
  //     dispatch(deleteUser(id));
  //   }
  // };
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This user will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "custom-alert-popup",
        confirmButton: "custom-alert-button",
      },
    });
  
    if (result.isConfirmed) {
      dispatch(deleteUser(id));
  
      Swal.fire({
        title: "Deleted!",
        text: "User has been deleted.",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-alert-popup",
          confirmButton: "custom-alert-button",
        },
      });
    }
  };
  
  const handleResetPassword = async (id, name) => {
    const newPassword = window.prompt(`Enter new password for ${name}:`);

    if (!newPassword || newPassword.trim().length < 4) {
      showAlert("Password must be at least 4 characters.");
      return;
    }

    try {
      const result = await resetPassword(id, newPassword); // Directly call the function
      showAlert("Password reset successfully.");
    } catch (error) {
      showAlert(`Failed to reset password: ${error.message || "Unknown error"}`);
    }
  };

  // Handle update employee
  const handleUpdate = async () => {
    console.log("Data being sent:", {
      ...updatedUserData,
      department: department // Explicitly show the department data
    });
    try {
      const updatedEmployee = await updateUser(
        selectedUser._id,
        updatedUserData
      ); // Directly call the update function

      showAlert("Employee updated successfully!");
      dispatch(fetchUsers()); // Refetch the list of users after update
      handleCloseModal(); // Close the modal after update
    } catch (error) {
      showAlert("Error updating employee. Please try again.");
    }
  };

  useEffect(() => {
    setUpdatedUserData(prev => ({
      ...prev,
      department: department
    }));
  }, [department]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setUpdatedUserData({
      name: user.name,
      email: user.email,
      position: user.position,
      department: user.department, // This should be an array
      role: user.role,
      userId: user.userId,
    });
    setDepartment(Array.isArray(user.department) ? user.department : [user.department]); // Initialize department state
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedUser(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  if (loading)
    return <div className="text-center pt-10 text-lg">Loading users...</div>;
  if (error)
    return <div className="text-center pt-10 text-red-600">Error: {error}</div>;

  return (
    <div className="relative w-full h-[90vh] overflow-y-auto">
      <img
        src={bgImage}
        alt="Background"
        className="absolute top-0 left-0 w-full h-full object-cover opacity-10 z-0"
      />
      <div className="relative z-10 bg-white max-w-7xl mx-auto rounded-xl shadow-xl p-8">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
          Users Directory
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse bg-white text-sm shadow-sm rounded-md">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="px-5 py-3 border-b font-medium">Emp ID</th>
                <th className="px-5 py-3 border-b font-medium">Name</th>
                <th className="px-5 py-3 border-b font-medium">Email</th>
                <th className="px-5 py-3 border-b font-medium">Position</th>
                <th className="px-5 py-3 border-b font-medium">Department</th>
                <th className="px-5 py-3 border-b font-medium">Role</th>
                <th className="px-5 py-3 border-b font-medium text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 border-b text-gray-700">
                    {user.userId}
                  </td>
                  <td className="px-5 py-3 border-b font-semibold">
                    {user.name}
                  </td>
                  <td className="px-5 py-3 border-b text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-5 py-3 border-b">{user.position}</td>
                  <td className="px-5 py-3 border-b">
                    {Array.isArray(user.department) ? (
                      user.department.map((dept, index) => (
                        <span
                          key={index}
                          className="inline-block px-3 mr-2 mb-2 text-sm font-semibold text-white bg-green-600 rounded-full"
                        >
                          {dept}
                        </span>
                      ))
                    ) : (
                      <span className="inline-block px-3 mr-2 mb-2 text-sm font-semibold text-white bg-green-600 rounded-full">
                        {user.department}
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-3 border-b">{user.role}</td>
                  <td className="px-5 py-3 border-b text-center">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => handleEdit(user)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md shadow-sm transition"
                      >
                        <FaEdit className="text-xs" /> Edit
                      </button>
                      <button
                        onClick={() => handleResetPassword(user._id, user.name)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded-md shadow-sm transition"
                      >
                        <FaSyncAlt className="text-xs" /> Reset
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-md shadow-sm transition"
                      >
                        <FaTrash className="text-xs" /> 
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-5 py-4 text-center text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for editing employee */}
      {showEditModal && (

        <div className="fixed inset-0 flex justify-center items-center bg-[oklch(0.28 0.03 256.85 / 0.5)] bg-opacity-70 z-20 ">
            <div className="bg-white bg-opacity-80 p-10 rounded-lg shadow-xl backdrop-blur-md">
              <h3 className="text-3xl font-semibold mb-6 text-center text-gray-800">
                Edit Employee
              </h3>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {/* Name */}
                  <div className="mb-4">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={updatedUserData.name}
                      onChange={handleChange}
                      className="w-full p-3 mt-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>


                  {/* Email */}
                  <div className="mb-4">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={updatedUserData.email}
                      onChange={handleChange}
                      className="w-full p-3 mt-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Position */}
                  <div className="mb-4">
                    <label
                      htmlFor="position"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Position
                    </label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={updatedUserData.position}
                      onChange={handleChange}
                      className="w-full p-3 mt-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Department */}
                  <div className="mb-4 w-[18rem]">
                    <label
                      htmlFor="department"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Department
                    </label>
                    <DepartmentSelector
                      selectedDepartments={department}
                      setSelectedDepartments={setDepartment}
                      className="w-full p-3 mt-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Role */}
                  <div className="mb-4">
                    <label
                      htmlFor="role"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Role
                    </label>
                    <select
                      name="role"
                      id="role"
                      value={updatedUserData.role}
                      onChange={handleChange}
                      className="w-full p-3 mt-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>

                  {/* User ID */}
                  <div className="mb-4">
                    <label
                      htmlFor="userId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      User ID
                    </label>
                    <input
                      type="text"
                      id="userId"
                      name="userId"
                      value={updatedUserData.userId}
                      onChange={handleChange}
                      className="w-full p-3 mt-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-between mt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleUpdate}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
      
      )}
    </div>
  );
};

export default AllEmployees;
