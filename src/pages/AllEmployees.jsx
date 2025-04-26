import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deleteUser , resetPassword , updateUser } from "../redux/userSlice";
import { FaTrash, FaSyncAlt, FaEdit } from "react-icons/fa";
import bgImage from "../assets/bg.png";
import axios from "axios";

const AllEmployees = () => {
  const dispatch = useDispatch();
  const { list: users, loading, error } = useSelector((state) => state.users);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updatedUserData, setUpdatedUserData] = useState({
    name: "",
    email: "",
    position: "",
    department: "",
    role: "",
  });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      dispatch(deleteUser(id));
    }
  };

  const handleResetPassword = async (id, name) => {
    const newPassword = window.prompt(`Enter new password for ${name}:`);
  
    if (!newPassword || newPassword.trim().length < 4) {
      alert("Password must be at least 4 characters.");
      return;
    }
  
    try {
      const result = await resetPassword(id, newPassword); // Directly call the function
      alert("Password reset successfully.");
    } catch (error) {
      alert(`Failed to reset password: ${error.message || "Unknown error"}`);
    }
  };
  
  // Handle update employee
  const handleUpdate = async () => {
    console.log("Updated User Data:", updatedUserData); // Debugging log to check data before sending
    
    try {
      const updatedEmployee = await updateUser(selectedUser._id, updatedUserData); // Directly call the update function
      
      alert("Employee updated successfully!");
      dispatch(fetchUsers()); // Refetch the list of users after update
      handleCloseModal(); // Close the modal after update
    } catch (error) {
      alert("Error updating employee. Please try again.");
    }
  };
  
  
  

  const handleEdit = (user) => {
    setSelectedUser(user);
    setUpdatedUserData({
      name: user.name,
      email: user.email,
      position: user.position,
      department: user.department,
      role: user.role,
      userId: user.userId,
    });
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
    <div className="relative w-full max-h-screen bg-gray-100 py-12 px-6">
      <img
        src={bgImage}
        alt="Background"
        className="absolute top-0 left-0 w-full h-full object-cover opacity-10 z-0"
      />
      <div className="relative z-10 bg-white max-w-7xl mx-auto rounded-xl shadow-xl p-8">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">
          Employee Directory
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
                  <td className="px-5 py-3 border-b">{user.department}</td>
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
                        <FaTrash className="text-xs" /> Delete
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
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-20 backdrop-blur-md">
        <div className="bg-white bg-opacity-70 p-8 rounded-lg shadow-lg w-1/3 backdrop-blur-lg">
          <h3 className="text-xl font-semibold mb-4 text-center">Edit Employee</h3>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={updatedUserData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
      
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={updatedUserData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
      
            <div className="mb-4">
              <label htmlFor="position" className="block text-gray-700">Position</label>
              <input
                type="text"
                id="position"
                name="position"
                value={updatedUserData.position}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
      
            <div className="mb-4">
              <label htmlFor="department" className="block text-gray-700">Department</label>
              <select
                name="department"
                id="department"
                value={updatedUserData.department}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="IT/Software">IT/Software</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>
      
            <div className="mb-4">
              <label htmlFor="role" className="block text-gray-700">Role</label>
              <select
                name="role"
                id="role"
                value={updatedUserData.role}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
              </select>
            </div>
      
            {/* Add the userId input field */}
            <div className="mb-4">
              <label htmlFor="userId" className="block text-gray-700">User ID</label>
              <input
                type="text"
                id="userId"
                name="userId"
                value={updatedUserData.userId}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
      
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-6 py-2 bg-gray-500 text-white rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleUpdate}
                className="px-6 py-2 bg-blue-600 text-white rounded-md"
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
