import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrashAlt, FaUsers, FaPlus, FaTimes } from "react-icons/fa";

const Departments = () => {
  const [departmentMap, setDepartmentMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("department"); // 'department' or 'report'
  const [taskCodes, setTaskCodes] = useState([]);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [newCodeName, setNewCodeName] = useState("");

  // Fetch departments overview with users and tasks
  const fetchDepartmentsData = async () => {
    try {
      setLoading(true);

      // Fetch departments
      const deptRes = await axios.get(
        "https://sataskmanagementbackend.onrender.com/api/departments"
      );
      const departments = deptRes.data;

      // Fetch employees
      const employeeRes = await axios.get(
        "https://sataskmanagementbackend.onrender.com/api/employees"
      );
      const employees = employeeRes.data;

      // Fetch tasks
      const taskRes = await axios.get(
        "https://sataskmanagementbackend.onrender.com/api/tasks"
      );
      const tasks = taskRes.data;

      const deptMap = {};

      // Initialize departments in the map
      departments.forEach((dept) => {
        deptMap[dept.name] = { users: [], tasks: [] };
      });

      // Add employees to the deptMap
      employees.forEach((emp) => {
        // Ensure that 'department' is always an array
        const departmentsArray = Array.isArray(emp.department)
          ? emp.department
          : [emp.department];

        departmentsArray.forEach((dept) => {
          // Add employee to the corresponding department
          if (deptMap[dept]) {
            deptMap[dept].users.push(emp);
          }
        });
      });

      // Add tasks to the deptMap
      tasks.forEach((task) => {
        const dept = task.taskCategory || "Unassigned";
        if (deptMap[dept]) {
          deptMap[dept].tasks.push(task);
        }
      });

      setDepartmentMap(deptMap);
    } catch (err) {
      console.error("Failed to fetch departments, employees, and tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentsData();
  }, []);

  const fetchTaskCodes = async () => {
    try {
      const res = await axios.get(
        "https://sataskmanagementbackend.onrender.com/api/task-codes"
      );
      setTaskCodes(res.data); // assuming the response is an array of codes
    } catch (err) {
      console.error("Failed to fetch task codes:", err);
    }
  };

  useEffect(() => {
    fetchDepartmentsData();
    fetchTaskCodes(); // 👈 add this
  }, []);

  const handleDeleteDepartment = async (dept) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the "${dept}" department? This will remove the department from all users.`
    );
    if (!confirmed) return;

    try {
      // Sending request to remove department from users
      await axios.put(
        "https://sataskmanagementbackend.onrender.com/api/departments/remove-department",
        { department: dept }
      );
      alert("Department deleted successfully!");
      setDepartmentMap((prev) => {
        const newMap = { ...prev };
        delete newMap[dept];
        return newMap;
      });
    } catch (err) {
      console.error("Failed to delete department", err);
      alert("Failed to delete department. Try again.");
    }
  };

  // Delete a task code
  const handleDeleteCode = async (codeId) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete this code?`
    );
    if (!confirmed) return;

    try {
      await axios.delete(
        `https://sataskmanagementbackend.onrender.com/api/task-codes/${codeId}`
      );
      alert("Code deleted successfully!");
      fetchTaskCodes(); // Refresh list
    } catch (err) {
      alert("Failed to delete code");
    }
  };

  const handleCreateDepartment = async () => {
    setShowDeptModal(true);
  };

  const handleSubmitDepartment = async () => {
    if (!newDeptName.trim()) return;

    try {
      const res = await axios.post(
        "https://sataskmanagementbackend.onrender.com/api/departments",
        { name: newDeptName }
      );
      setDepartmentMap((prev) => ({
        ...prev,
        [newDeptName]: { users: [], tasks: [] },
      }));
      setNewDeptName("");
      setShowDeptModal(false);
    } catch (err) {
      console.error("Failed to create department", err);
    }
  };

  const handleCreateCode = async () => {
    setShowCodeModal(true);
  };

  const handleSubmitCode = async () => {
    if (!newCodeName.trim()) return;

    try {
      await axios.post(
        `https://sataskmanagementbackend.onrender.com/api/task-codes`,
        { name: newCodeName }
      );
      fetchTaskCodes();
      setNewCodeName("");
      setShowCodeModal(false);
    } catch (err) {
      console.error("Failed to create code", err);
    }
  };

  return (
    <div className="p-4 bg-gray-100">
      <h1 className="text-3xl font-bold text-center text-indigo-900 mb-5">
        {view === "department" ? "Departments Overview" : "Reports Overview"}
      </h1>

      {/* 🔘 View Switch Buttons */}
      <div className="flex justify-center gap-4 mb-4">
        <button
          className={`px-6 py-2 text-sm font-medium rounded-md ${
            view === "department"
              ? "bg-indigo-600 text-white"
              : "bg-white text-indigo-600 border border-indigo-600"
          }`}
          onClick={() => setView("department")}
        >
          Department Overview
        </button>

        <button
          className={`px-6 py-2 text-sm font-medium rounded-md ${
            view === "code"
              ? "bg-indigo-600 text-white"
              : "bg-white text-indigo-600 border border-indigo-600"
          }`}
          onClick={() => setView("code")}
        >
          Code Overview
        </button>
      </div>

      <div className="flex justify-end mb-4">
        {view === "department" ? (
          <button
            onClick={handleCreateDepartment}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <FaPlus /> Add Department
          </button>
        ) : (
          <button
            onClick={handleCreateCode}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <FaPlus /> Add Code
          </button>
        )}
      </div>

      {/* ✅ View Content */}
      {loading ? (
        <p className="text-center text-gray-500">Loading data...</p>
      ) : view === "department" ? (
        Object.keys(departmentMap).length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            No departments or data found.
          </p>
        ) : (
          // === Department Overview ===
          <div className="space-y-6 mx-auto h-[60vh] overflow-y-auto">
            {Object.entries(departmentMap).map(([dept, { users }]) => (
              <div
                key={dept}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 relative"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FaUsers className="text-indigo-600 text-2xl" />
                    <h2 className="text-2xl font-semibold text-indigo-800">
                      {dept}
                    </h2>
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                      {users.length} user{users.length !== 1 && "s"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteDepartment(dept)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete Department"
                  >
                    <FaTrashAlt size={18} />
                  </button>
                </div>

                {/* User List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 text-sm text-gray-700">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="bg-gray-50 border border-gray-200 p-4 rounded-md hover:shadow transition"
                    >
                      <div className="font-medium text-gray-900">
                        {user.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : view === "code" ? (
        // === Code Overview ===
        taskCodes.length === 0 ? (
          <p className="text-center text-gray-500">No codes found.</p>
        ) : (
          <div className="space-y-6 mx-auto h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {taskCodes.map((codeObj) => (
                <div
                  key={codeObj._id}
                  className="bg-white flex justify-between border border-gray-200 p-4 rounded-md shadow hover:shadow-md transition relative"
                >
                  <h3 className="text-lg font-semibold text-indigo-800">
                    {codeObj.name}
                  </h3>
                  <button
                    onClick={() => handleDeleteCode(codeObj._id)}
                    className=" text-center text-red-500 hover:text-red-700"
                    title="Delete Code"
                  >
                    <FaTrashAlt size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      ) : null}

      {/* Department Creation Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 bg-opacity-50 flex  justify-center z-50">
          <div className="bg-white p-6 rounded-lg h-50 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create New Department</h3>
              <button
                onClick={() => setShowDeptModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <input
              type="text"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              placeholder="Enter department name"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeptModal(false)}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDepartment}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Creation Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 flex justify-center z-50">
          <div className="bg-white p-6 rounded-lg h-50 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create New Code</h3>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>
            <input
              type="text"
              value={newCodeName}
              onChange={(e) => setNewCodeName(e.target.value)}
              placeholder="Enter code name"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCode}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
