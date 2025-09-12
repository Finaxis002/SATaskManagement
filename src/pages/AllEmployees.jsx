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
import AddEmployee from "./AddEmployee";

const AllEmployees = () => {
  const dispatch = useDispatch();
  const { list: users, error } = useSelector((state) => state.users);

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

  const [showAddModal, setShowAddModal] = useState(false);

  const [loading, setLoading] = useState(true);

  // Calculate total users, admins, and departments
  const totalUsers = users.length;  // Total users count
  const totalAdmins = users.filter(user => user.role === 'admin').length;  // Count of admins
  const departments = [...new Set(users.flatMap(user => user.department))];  // Unique departments
  const totalDepartments = departments.length;  // Count of unique departments

  useEffect(() => {
    setLoading(true); // Start loader as soon as we fetch
    dispatch(fetchUsers()).finally(() => setLoading(false));
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
      showAlert(
        `Failed to reset password: ${error.message || "Unknown error"}`
      );
    }
  };

  // Handle update employee
  const handleUpdate = async () => {
    console.log("Data being sent:", {
      ...updatedUserData,
      department: department, // Explicitly show the department data
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
    setUpdatedUserData((prev) => ({
      ...prev,
      department: department,
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
    setDepartment(
      Array.isArray(user.department) ? user.department : [user.department]
    ); // Initialize department state
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[250px]">
        <svg
          className="animate-spin h-8 w-8 text-indigo-500"
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
        <span className="ml-3 text-indigo-600 font-semibold">
          Loading Users...
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[90vh] overflow-y-auto">

      <div className="relative z-10 bg-white max-w-7xl mx-auto rounded-xl shadow-xl p-8">
        <h2
          className="text-3xl font-semibold  text-gray-800 mb-8 "
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          Users Directory
        </h2>
<div className="border-b-2 border-gray-300 mb-6"></div>
        <div className="overflow-x-auto">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowAddModal(true)}
              className="w-auto px-6 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 shadow-lg font-semibold transition sm:px-4 sm:py-1 "
            >
              <span className="hidden sm:inline">+ Add User</span>
              <span className="sm:hidden font-light">+ Add User </span>
            </button>
          </div>
          {/* Displaying Total Users, Admins, Departments in a Smaller Box */}
          <div className="flex justify-between mb-8 gap-4">
            <div className="w-full sm:w-[30%] bg-gray-100 py-3 px-4 rounded-lg shadow-xl text-center">
              <div className="text-sm font-semibold text-gray-700 leading-tight">Total Users</div>
              <div className="text-2xl font-bold text-indigo-600 leading-none">{totalUsers}</div>
            </div>

            <div className="w-full sm:w-[30%] bg-gray-100 py-3 px-4 rounded-lg shadow-xl text-center">
              <div className="text-sm font-semibold text-gray-700 leading-tight">Admins</div>
              <div className="text-2xl font-bold text-indigo-600 leading-none">{totalAdmins}</div>
            </div>

            <div className="w-full sm:w-[30%] bg-gray-100 py-3 px-4 rounded-lg shadow-xl text-center">
              <div className="text-sm font-semibold text-gray-700 leading-tight">Departments</div>
              <div className="text-2xl font-bold text-indigo-600 leading-none">{totalDepartments}</div>
            </div>
          </div>

          <div className="hidden sm:block">

            <table className="min-w-full border-collapse  bg-white text-sm shadow-sm rounded-md">
              <thead>
                <tr className="bg-gray-300 text-black text-left font-semibold  text-transform: uppercase">
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
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-6 w-6 text-indigo-500 mr-3"
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
                        <span className="text-indigo-600 font-medium">
                          Loading Users...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-5 py-4 text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr
                      key={user._id}
                      className="bg-white hover:bg-gray-200 transition duration-100"
                      style={{ fontFamily: "Roboto, sans-serif" }}
                    >
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
                              className="inline-block px-3 mr-2 mb-2 text-sm font-medium text-black bg-gray-200 rounded-full"
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

                      <td
                        className={`px-5 py-3 border-b transition-transform duration-200 hover:scale-105 ${user.role.toLowerCase() === "admin" ? "text-violet-600" : "text-green-600"
                          }`}
                      >
                        {user.role}
                      </td>
                      <td className="px-5 py-3 border-b text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => handleEdit(user)}
                            className="  flex items-center gap-2 px-4 py-2  hover:bg-[#d2d5f1]  text-xs rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition ease-in-out transform hover:scale-105"
                            title="Edit"
                          >
                            <FaEdit className="text-xs text-blue-500" />
                          </button>
                          <button
                            onClick={() =>
                              handleResetPassword(user._id, user.name)
                            }
                            className="flex items-center gap-2 px-4 py-2  hover:bg-[#f7f7a2]  text-xs rounded-md shadow-md transition ease-in-out transform hover:scale-105"
                            title="Reset password">
                            <FaSyncAlt className="text-xs text-yellow-500" />
                          </button>
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="flex items-center gap-2 px-3 py-1.5  hover:bg-[#f5a8a8] rounded-md shadow-sm transition ease-in-out transform hover:scale-105"
                            title="Delete" >
                            <FaTrash className="text-xs text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>


        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 flex justify-center items-center bg-opacity-30 z-30">
            <AddEmployee
              showEditModal={true}
              setShowEditModal={setShowEditModal}
              employeeToEdit={selectedUser}
              handleCloseModal={() => {
                setShowEditModal(false);
                setSelectedUser(null);
                dispatch(fetchUsers());
              }}
            />
          </div>
        )}

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 flex justify-center items-center bg-opacity-30 z-30">
            <AddEmployee
              showEditModal={false}
              setShowEditModal={setShowAddModal}
              employeeToEdit={null}
              handleCloseModal={() => setShowAddModal(false)}
            />
          </div>
        )}
        {/* Mobile View (Stacked Data for Small Screens) */}
        <div className="block sm:hidden">
          {loading ? (
            <div className="flex items-center justify-center h-[250px]">
              <svg className="animate-spin h-8 w-8 text-indigo-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              <span className="ml-3 text-indigo-600 font-semibold">Loading Users...</span>
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-500">No users found.</p>
          ) : (
            users.map((user, index) => (
              <div key={user._id} className="bg-white hover:bg-gray-200 transition duration-300 p-4 mb-4 rounded-lg shadow-lg">
                <div className="bg-gray-200 p-4 rounded-lg w-full">
                  {/* Employee Details Flex Container */}
                  <div className="flex flex-col items-start">
                    {/* Employee's Name */}
                    <div className="flex justify-center items-center w-full text-xl font-semibold text-yellow-800 mb-2">{user.name}</div>

                    {/* Employee's ID and Position */}
                    <div className="mb-2">
                      <span className="font-medium text-gray-700">Emp ID:</span> {user.userId}
                    </div>
                    <div className="mb-2">
                      <span className="font-medium text-gray-700">Position:</span> {user.position}
                    </div>

                    {/* Employee's Email */}
                    <div className="mb-2">
                      <span className="font-medium text-gray-700">Email:</span> {user.email}
                    </div>

                    {/* Departments */}
                    <div className="mb-2">
                      <span className="font-medium text-gray-700">Departments:</span>
                      {Array.isArray(user.department) ? (
                        user.department.map((dept, index) => (
                          <span key={index} className="inline-block px-3 py-1 mr-2 mb-2 text-sm font-medium text-black-50 bg-gray-50 rounded-full">
                            {dept}
                          </span>
                        ))
                      ) : (
                        <span className="inline-block px-3 py-1 mr-2 mb-2 text-sm font-medium text-black bg-gray-100 rounded-full">
                          {user.department}
                        </span>
                      )}
                    </div>

                    {/* Role */}
                    <div className="mb-4">
                      <span className="font-medium text-gray-700">Role:</span>
                      <span
                        className={`ml-2 = transition-transform duration-200 hover:scale-105 ${user.role.toLowerCase() === "admin" ? "text-violet-600" : "text-green-600"
                          }`}
                      >
                        {user.role}
                      </span>
                    </div>
                    {/* Action Buttons with Icons */}
                    <div className="flex justify-between mt-4 gap-0.5 w-full p-4">
                      <button
                        onClick={() => handleEdit(user)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-[#d2d5f1] text-sm rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition ease-in-out transform hover:scale-105 ml-2"
                      >
                        <FaEdit className="text-lg text-blue-500" />
                      </button>

                      <button
                        onClick={() => handleResetPassword(user._id, user.name)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-[#f7f7a2] text-sm rounded-md shadow-md transition ease-in-out transform hover:scale-105 ml-2"
                      >
                        <FaSyncAlt className="text-lg text-yellow-500" />
                      </button>

                      <button
                        onClick={() => handleDelete(user._id)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-[#f5a8a8] rounded-md shadow-sm transition ease-in-out transform hover:scale-105 ml-2"
                      >
                        <FaTrash className="text-lg text-red-500" />
                      </button>
                    </div>
                  </div> {/* End of flex container */}
                </div> {/* End of inner white box */}
              </div>
            ))
          )}

        </div>
      </div>
    </div>
  );
};

export default AllEmployees;