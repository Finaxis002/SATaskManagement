import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrashAlt, FaUsers } from "react-icons/fa";


const Departments = () => {
  const [departmentMap, setDepartmentMap] = useState({});
  const [loading, setLoading] = useState(true);
 

 // Fetch departments overview with users and tasks
 const fetchDepartmentsData = async () => {
    try {
      setLoading(true);
      // Fetch departments
      const deptRes = await axios.get("https://sataskmanagementbackend.onrender.com/api/departments");
      const departments = deptRes.data;

      // Fetch employees
      const employeeRes = await axios.get("https://sataskmanagementbackend.onrender.com/api/employees");
      const employees = employeeRes.data;

      // Fetch tasks
      const taskRes = await axios.get("https://sataskmanagementbackend.onrender.com/api/tasks");
      const tasks = taskRes.data;

      const deptMap = {};

      // Initialize departments in the map
      departments.forEach((dept) => {
        deptMap[dept.name] = { users: [], tasks: [] };
      });

      // Add employees to the deptMap
      employees.forEach((emp) => {
        const depts = Array.isArray(emp.departments) ? emp.departments : [emp.department || "Unassigned"];
        depts.forEach((dept) => {
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


  const handleDeleteDepartment = async (dept) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the "${dept}" department? This will remove the department from all users.`
    );
    if (!confirmed) return;
  
    try {
      // Sending request to remove department from users
      const res = await axios.put("https://sataskmanagementbackend.onrender.com/api/departments/remove-department", {
        department: dept,
      });
  
      if (res.status === 200) {
        alert("Department deleted successfully!");
        fetchDepartmentsData();  // Update the department data after deletion
      }
    } catch (err) {
      console.error("Failed to delete department", err);
      alert("Failed to delete department. Try again.");
    }
  };
  

  return (
    <div className="p-10 bg-gray-100">
      <h1 className="text-3xl font-bold text-center text-indigo-900 mb-5">
        Departments Overview
      </h1>

      {Object.keys(departmentMap).length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          No departments or users found.
        </p>
      ) : (
        <div className="space-y-6 mx-auto h-[70vh] overflow-y-auto">
           {Object.entries(departmentMap).map(([dept, { users, tasks }]) => (
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
                  onClick={() => handleDeleteDepartment(dept)}
                  className="text-red-500 hover:text-red-700"
                  title="Delete Department"
                >
                  <FaTrashAlt size={18} />
                </button>
              </div>

              {/* User List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="bg-gray-50 border border-gray-200 p-4 rounded-md hover:shadow transition"
                  >
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-gray-500 text-sm">{user.position}</div>
                    <div className="text-gray-400 text-xs">{user.email}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Departments;
