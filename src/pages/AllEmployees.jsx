import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deleteUser } from "../redux/userSlice";
import { FaTrash, FaSyncAlt } from "react-icons/fa";
import bgImage from "../assets/bg.png";

const AllEmployees = () => {
  const dispatch = useDispatch();
  const { list: users, loading, error } = useSelector((state) => state.users);

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
      const response = await fetch(`https://sa-task-management-backend.vercel.app/api/employees/reset-password/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        alert("Password reset successfully.");
      } else {
        alert(`Failed to reset password: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Reset error:", error);
      alert("An error occurred while resetting the password.");
    }
  };
  

  if (loading) return <div className="text-center pt-10 text-lg">Loading users...</div>;
  if (error) return <div className="text-center pt-10 text-red-600">Error: {error}</div>;

  return (
    <div className="relative w-full min-h-screen bg-gray-100 py-12 px-6">
      <img
        src={bgImage}
        alt="Background"
        className="absolute top-0 left-0 w-full h-full object-cover opacity-10 z-0"
      />
      <div className="relative z-10 bg-white max-w-7xl mx-auto rounded-xl shadow-xl p-8">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Employee Directory</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse bg-white text-sm shadow-sm rounded-md">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-left">
                <th className="px-5 py-3 border-b font-medium">Emp ID</th>
                <th className="px-5 py-3 border-b font-medium">Name</th>
                <th className="px-5 py-3 border-b font-medium">Email</th>
                <th className="px-5 py-3 border-b font-medium">Position</th>
                <th className="px-5 py-3 border-b font-medium">Department</th>
                <th className="px-5 py-3 border-b font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, idx) => (
                <tr key={user._id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-3 border-b text-gray-700">{user.userId}</td>
                  <td className="px-5 py-3 border-b font-semibold">{user.name}</td>
                  <td className="px-5 py-3 border-b text-gray-600">{user.email}</td>
                  <td className="px-5 py-3 border-b">{user.position}</td>
                  <td className="px-5 py-3 border-b">{user.department}</td>
                  <td className="px-5 py-3 border-b text-center">
                    <div className="flex justify-center gap-3">
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
                  <td colSpan="6" className="px-5 py-4 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllEmployees;
