import { useState, useEffect } from "react";
import axios from "axios";
import bgImage from "../assets/bg.png"; // adjust path as needed

const AllEmployees = () => {
  // State to store employees data
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch employees when the component mounts
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/employees");
        setEmployees(response.data); // Assuming the response data is an array of employees
        setLoading(false); // Set loading to false once data is fetched
      } catch (err) {
        setError("Failed to fetch employees");
        setLoading(false); // Stop loading on error
      }
    };

    fetchEmployees();
  }, []); // Empty array ensures this runs only once when the component mounts

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/employees/${id}`);
      setEmployees((prevEmployees) =>
        prevEmployees.filter((employee) => employee._id !== id)
      );
      alert("Employee deleted successfully!");
    } catch (err) {
      alert("Failed to delete employee!");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <h2 className="text-white p-6">Loading Users...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <h2 className="text-white p-6">{error}</h2>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen text-gray-800 bg-gray-100 p-16 ">
      {/* Fixed Background Image */}
      <img
        src={bgImage}
        alt="Background"
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      />

      <div className="p-6 relative bg-white rounded-lg shadow-md mx-auto max-w-6xl">
        <h2 className="text-2xl font-semibold text-center mb-6">All Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-3 px-4 border-b text-left">Name</th>
                <th className="py-3 px-4 border-b text-left">Email</th>
                <th className="py-3 px-4 border-b text-left">Position</th>
                <th className="py-3 px-4 border-b text-left">Department</th>
                <th className="py-3 px-4 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee._id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b">{employee.name}</td>
                  <td className="py-3 px-4 border-b">{employee.email}</td>
                  <td className="py-3 px-4 border-b">{employee.position}</td>
                  <td className="py-3 px-4 border-b">{employee.department}</td>
                  <td className="py-3 px-4 border-b text-left">
                    <button
                      onClick={() => handleDelete(employee._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Delete
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
