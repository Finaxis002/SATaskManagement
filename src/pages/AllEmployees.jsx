import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, deleteUser } from "../redux/userSlice";
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
    const confirmed = window.confirm(`Reset password for ${name}?`);
    if (!confirmed) return;

    try {
      const response = await fetch(`http://localhost:5000/api/employees/reset-password/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Password reset successfully. New Password: ${result.newPassword}`);
      } else {
        alert(`Failed to reset password: ${result.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Reset error:", error);
      alert("An error occurred while resetting the password.");
    }
  };

  if (loading) {
    return <div className="text-center"><h2 className="text-white p-6">Loading Users...</h2></div>;
  }

  if (error) {
    return <div className="text-center"><h2 className="text-white p-6">{error}</h2></div>;
  }

  return (
    <div className="relative w-full h-screen text-gray-800 bg-gray-100 p-16">
      <img src={bgImage} alt="Background" className="absolute top-0 left-0 w-full h-full object-cover z-0" />
      <div className="p-6 relative bg-white rounded-lg shadow-md mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold text-center mb-6">All Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-3 px-4 border-b text-left">Emp ID</th>
                <th className="py-3 px-4 border-b text-left">Name</th>
                <th className="py-3 px-4 border-b text-left">Email</th>
                <th className="py-3 px-4 border-b text-left">Position</th>
                <th className="py-3 px-4 border-b text-left">Department</th>
                <th className="py-3 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b">{user._id}</td>
                  <td className="py-3 px-4 border-b">{user.name}</td>
                  <td className="py-3 px-4 border-b">{user.email}</td>
                  <td className="py-3 px-4 border-b">{user.position}</td>
                  <td className="py-3 px-4 border-b">{user.department}</td>
                  <td className="py-3 px-4 border-b space-x-2">
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleResetPassword(user._id, user.name)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600"
                    >
                      Reset Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllEmployees;
