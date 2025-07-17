import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrashAlt, FaUsers, FaPlus, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import ReportGeneration from "../Components/ReportGeneration";
import ClientList from "../Components/client/ClientList";
import CreateClientModal from "../Components/client/CreateClientModal";
import MailCreation from "./MailCreation";

const Departments = () => {
  const [departmentMap, setDepartmentMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("department");
  const [taskCodes, setTaskCodes] = useState([]);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [newCodeName, setNewCodeName] = useState("");
  const [clients, setClients] = useState([]);
  const [newClientName, setNewClientName] = useState("");
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientOptions, setClientOptions] = useState([]);
  const [role, setRole] = useState("");
  const [editCodeId, setEditCodeId] = useState(null);
  const [editCodeName, setEditCodeName] = useState("");
  const [editingDept, setEditingDept] = useState(null); // department name being edited
  const [editableUsersMap, setEditableUsersMap] = useState({}); // { [dept]: [users] }

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
      if (storedRole !== "admin") {
        setView("client"); // Default to client view for users
      }
    }
  }, []);
  // Fetch departments overview with users and tasks
  const fetchDepartmentsData = async () => {
    try {
      setLoading(true);

      // Fetch departments
      const deptRes = await axios.get(
        "https://taskbe.sharda.co.in/api/departments"
      );
      const departments = deptRes.data;

      // Fetch employees
      const employeeRes = await axios.get(
        "https://taskbe.sharda.co.in/api/employees"
      );
      const employees = employeeRes.data;

      // Fetch tasks
      const taskRes = await axios.get(
        "https://taskbe.sharda.co.in/api/tasks"
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

  const fetchTaskCodes = async () => {
    try {
      const res = await axios.get(
        "https://taskbe.sharda.co.in/api/task-codes"
      );

      const sortedData = res.data.sort((a, b) => {
        // Extract the leading number from the name (before first space)
        const getNumber = (str) => {
          const match = str.match(/^\d+/);
          return match ? parseInt(match[0], 10) : 0;
        };

        return getNumber(a.name) - getNumber(b.name);
      });

      setTaskCodes(sortedData);
    } catch (err) {
      console.error("Failed to fetch task codes:", err);
    }
  };

  // const fetchClients = async () => {
  //   try {
  //     const res = await fetch(
  //       "https://taskbe.sharda.co.in/api/clients"
  //     );

  //     if (!res.ok) {
  //       throw new Error(`HTTP error! status: ${res.status}`);
  //     }

  //     const data = await res.json();
  //     console.log("Clients data:", data); // Debug log

  //     const formattedClients = Array.isArray(data)
  //       ? data.map((client) => ({
  //           label: client.name || client,
  //           value: client.name || client,
  //         }))
  //       : [];

  //     // 🔁 This sets both states
  //     setClientOptions(formattedClients);
  //     setClients(formattedClients.map((c) => c.value)); // ✅ fix: sets raw client name strings for display
  //   } catch (err) {
  //     console.error("Failed to fetch clients", err);
  //   }
  // };
  const fetchClients = async () => {
    try {
      const res = await fetch(
        "https://taskbe.sharda.co.in/api/clients"
      );
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      const formattedClients = Array.isArray(data)
        ? data.map((client) => ({
            name: client.name,
            contactPerson: client.contactPerson || "-",
            businessName: client.businessName || "-",
          }))
        : [];

      setClients(formattedClients);
    } catch (err) {
      console.error("Failed to fetch clients", err);
    }
  };

  useEffect(() => {
    fetchDepartmentsData();
    fetchTaskCodes(); // 👈 add this
    fetchClients(); // 👈 Add this line
  }, []);

  // Delete a task code
  const handleDeleteDepartment = async (dept) => {
    const result = await Swal.fire({
      title: `Delete "${dept}" department?`,
      text: "This will remove the department from all users.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "custom-alert-popup",
        confirmButton: "custom-alert-button",
      },
    });

    if (!result.isConfirmed) return;

    try {
      await axios.put(
        "https://taskbe.sharda.co.in/api/departments/remove-department",
        { department: dept }
      );

      Swal.fire({
        title: "Deleted!",
        text: `The "${dept}" department has been removed from all users.`,
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-alert-popup",
          confirmButton: "custom-alert-button",
        },
      });

      setDepartmentMap((prev) => {
        const newMap = { ...prev };
        delete newMap[dept];
        return newMap;
      });
    } catch (err) {
      console.error("Failed to delete department", err);

      Swal.fire({
        title: "Error!",
        text: "Failed to delete department. Try again.",
        icon: "error",
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-alert-popup",
          confirmButton: "custom-alert-button",
        },
      });
    }
  };

  const handleDeleteCode = async (codeId) => {
    const result = await Swal.fire({
      title: "Are you sure?",

      text: "This code will be permanently deleted!",
      icon: "warning", // ✅ default icon
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "custom-alert-popup",
        confirmButton: "custom-alert-button",
      },
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(
        `https://taskbe.sharda.co.in/api/task-codes/${codeId}`
      );

      Swal.fire({
        title: "Deleted!",
        text: "The code has been deleted successfully.",
        icon: "success", // ✅ default success icon
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-alert-popup",
          confirmButton: "custom-alert-button",
        },
      });

      fetchTaskCodes(); // Refresh list
    } catch (err) {
      console.error(err);

      Swal.fire({
        title: "Error!",
        text: "Failed to delete the code. Please try again.",
        icon: "error", // ✅ default error icon
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-alert-popup",
          confirmButton: "custom-alert-button",
        },
      });
    }
  };

  const handleCreateDepartment = async () => {
    setShowDeptModal(true);
  };

  const handleSubmitDepartment = async () => {
    if (!newDeptName.trim()) return;

    try {
      const res = await axios.post(
        "https://taskbe.sharda.co.in/api/departments",
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
        `https://taskbe.sharda.co.in/api/task-codes`,
        { name: newCodeName }
      );
      fetchTaskCodes();
      setNewCodeName("");
      setShowCodeModal(false);
      // ✅ Success Alert
      Swal.fire({
        icon: "success",
        title: "Created!",
        text: "New code created successfully.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Failed to create code", err);
    }
  };

  const handleDeleteClient = async (clientName) => {
    const result = await Swal.fire({
      title: `Delete "${clientName}"?`,
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(
        `https://taskbe.sharda.co.in/api/clients`,
        {
          data: { name: clientName },
        }
      );
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: `Client "${clientName}" was deleted successfully.`,
        timer: 2000,
        showConfirmButton: false,
      });

      fetchClients(); // Refresh
    } catch (err) {
      console.error("Delete failed", err);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to delete client. Please try again.",
      });
    }
  };

  const handleEditCode = (code) => {
    setEditCodeId(code._id);
    // Remove serial number prefix while editing
    const parts = code.name.split(" ");
    const nameWithoutSerial = parts.slice(1).join(" ");
    setEditCodeName(nameWithoutSerial);
  };

  const handleUpdateCode = async (id) => {
    try {
      const res = await axios.put(
        `https://taskbe.sharda.co.in/api/task-codes/${id}`,
        {
          name: editCodeName,
        }
      );
      if (res.status === 200) {
        // Update state
        const updated = res.data;
        setTaskCodes((prev) =>
          prev.map((code) => (code._id === id ? updated : code))
        );
        setEditCodeId(null);
        setEditCodeName("");
      }
    } catch (err) {
      console.error("Error updating code", err);
    }
  };

  const handleEditDepartment = (deptName, users) => {
    setEditingDept(deptName);
    setEditableUsersMap((prev) => ({
      ...prev,
      [deptName]: users.map((user) => ({ ...user })),
    }));
  };

  const handleSaveEditedUsers = async () => {
    if (!editingDept || !editableUsersMap[editingDept]) return;
    try {
      await Promise.all(
        editableUsersMap[editingDept].map((user) =>
          axios.put(`/api/employees/${user._id}`, {
            name: user.name,
            position: user.position,
            role: user.role,
            department: user.department,
          })
        )
      );
      setEditingDept(null);
      await fetchDepartmentsAgain();
    } catch (err) {
      console.error("Failed to save changes:", err);
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      await axios.delete(
        `https://taskbe.sharda.co.in/api/employees/${userId}`
      );
      setEditableUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("Failed to remove user:", err);
    }
  };
  const [activeTab, setActiveTab] = useState("department");
const tabs = [
    { key: "department", label: "Department Overview" },
    { key: "code", label: "Code Overview" },
    { key: "report", label: "Report Generation" },
    {key: "mail", label: "Mail User Creation" },
  ];

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      {/* <h1 className="text-3xl font-bold text-center text-indigo-900 mb-5">
        {view === "department"
          ? "Departments Overview"
          : view === "code"
          ? "Code Overview"
          : view === "client"
          ? "Client Overview"
          : "Reports Overview"}
      </h1> */}

      {/* 🔘 View Switch Buttons */}
      {/* <div className="flex justify-center gap-4 mb-6">
        {role === "admin" && (
          <button
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              view === "department"
                ? "bg-indigo-600 text-white"
                : "bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
            }`}
            onClick={() => setView("department")}
          >
            Department Overview
          </button>
        )}

        {role === "admin" && (
          <button
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              view === "code"
                ? "bg-indigo-600 text-white"
                : "bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
            }`}
            onClick={() => setView("code")}
          >
            Code Overview
          </button>
        )}

        {role === "admin" && (
          <button
            className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
              view === "report"
                ? "bg-indigo-600 text-white"
                : "bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
            }`}
            onClick={() => setView("report")}
          >
            Report Generation
          </button>
        )}
      </div> */}

      <h1 className="text-4xl font-bold text-gray-900 mb-2">Application Settings</h1>
        <p className="text-base text-gray-500 mb-8">
          Configure and manage TaskFlow to suit your needs.
        </p>

        {/* Tab Buttons */}
        <div className="flex gap-2 border border-gray-200 rounded-md overflow-hidden mb-6 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
             onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-white text-indigo-600 border-b-2 border-indigo-600"
                  : "bg-gray-100 text-gray-700 hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

      {/* 🔘 Action Buttons */}
      <div className="flex justify-end mb-2">
        {activeTab === "department" && role === "admin" && (
          <button
            onClick={handleCreateDepartment}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
          >
            <FaPlus /> Add Department
          </button>
        )}

        {activeTab === "code" && role === "admin" && (
          <button
            onClick={handleCreateCode}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
          >
            <FaPlus /> Add Code
          </button>
        )}
      </div>

      {/* 🔁 View Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-center text-gray-500">Loading data...</p>
        </div>
      ) : (
        <>
          {activeTab === "department" &&
            role === "admin" &&
            (Object.keys(departmentMap).length === 0 ? (
              <div className="flex justify-center items-center h-60">
                <p className="text-center text-gray-500 text-lg">
                  No departments or data found.
                </p>
              </div>
            ) : (
              <div className="space-y-6 mx-auto max-h-[60vh] overflow-y-auto">
                {Object.entries(departmentMap).map(([dept, { users }]) => (
                  <div
                    key={dept}
                    className="bg-white rounded-lg shadow-md border border-gray-200 p-6 relative"
                  >
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
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleEditDepartment(dept, users)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          ✏️ Edit 
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteDepartment(dept)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete Department"
                        >
                          <FaTrashAlt size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      {/* {users.map((user) => (
                        <div
                          key={user._id}
                          className="bg-gray-50 border border-gray-200 p-4 rounded-md hover:shadow transition"
                        >
                          <div className="font-medium text-gray-900">
                            {user.name}
                          </div>
                        </div>
                      ))} */}
                      {editingDept === dept && editableUsersMap[dept] && (
                        <>
                          {/* Close Button */}
                          <div className="flex justify-end mb-4">
                            <button
                              onClick={() => setEditingDept(null)}
                              className="inline-flex items-center gap-2 text-sm px-4 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition shadow-sm"
                            >
                              ✖ Close Edit Mode
                            </button>
                          </div>

                          {/* User Cards Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {editableUsersMap[dept].map((user, index) => (
                              <div
                                key={user._id}
                                className="relative bg-white rounded-xl border border-gray-200 shadow-md p-4 hover:shadow-lg transition-all flex flex-col items-center text-center"
                              >
                                {/* Remove Button */}
                                <button
                                  onClick={() => {
                                    const filtered = editableUsersMap[
                                      dept
                                    ].filter((u) => u._id !== user._id);
                                    setEditableUsersMap((prev) => ({
                                      ...prev,
                                      [dept]: filtered,
                                    }));
                                  }}
                                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                                  title="Remove user"
                                >
                                  ✖
                                </button>

                                {/* Avatar */}
                                <div className="h-14 w-14 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-md mb-2 shadow-sm">
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)}
                                </div>

                                {/* Name + Position */}
                                <div className="mb-2">
                                  <h3 className="text-base font-semibold text-gray-800">
                                    {user.name}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {user.position}
                                  </p>
                                </div>

                                {/* Role Dropdown */}
                                <div className="w-full mt-2">
                                  <label className="block text-xs text-gray-500 mb-1">
                                    Role
                                  </label>
                                  <select
                                    value={user.role}
                                    onChange={(e) => {
                                      const updated = [
                                        ...editableUsersMap[dept],
                                      ];
                                      updated[index].role = e.target.value;
                                      setEditableUsersMap((prev) => ({
                                        ...prev,
                                        [dept]: updated,
                                      }));
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                  >
                                    <option value="user">User</option>
                                    <option value="manager">Manager</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))}

          {activeTab === "code" &&
            role === "admin" &&
            (taskCodes.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-center text-gray-500">No codes found.</p>
              </div>
            ) : (
              <div className="space-y-6 mx-auto max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {taskCodes.map((codeObj) => (
                    <div
                      key={codeObj._id}
                      className="bg-white flex justify-between items-center border border-gray-200 p-4 rounded-md shadow hover:shadow-md transition"
                    >
                      {editCodeId === codeObj._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editCodeName}
                            onChange={(e) => setEditCodeName(e.target.value)}
                            className="border px-2 py-1 text-sm rounded"
                          />
                          <button
                            onClick={() => handleUpdateCode(codeObj._id)}
                            className="text-green-600 hover:text-green-800"
                            title="Save"
                          >
                            ✅
                          </button>
                          <button
                            onClick={() => setEditCodeId(null)}
                            className="text-gray-500 hover:text-gray-700"
                            title="Cancel"
                          >
                            ❌
                          </button>
                        </div>
                      ) : (
                        <h3 className="text-lg font-semibold text-indigo-800">
                          {codeObj.name}
                        </h3>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditCode(codeObj)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit Code"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteCode(codeObj._id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete Code"
                        >
                          <FaTrashAlt size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

          {/* {activeTab === "client" && (
            <div className="space-y-6 mx-auto max-h-[60vh] overflow-y-auto">
              <ClientList clients={clients} onDelete={handleDeleteClient} />
            </div>
          )} */}

          {activeTab === "report" && role === "admin" && <ReportGeneration />}

          <div className="max-h-[20vh]">{activeTab === "mail" && role === "admin" && <MailCreation />}</div>

          
        </>
      )}

      {/* Department Creation Modal */}
      {showDeptModal && (
        <div className="fixed inset-0  bg-opacity-50 flex h-50 justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create New Department</h3>
              <button
                onClick={() => setShowDeptModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <input
              type="text"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              placeholder="Enter department name"
              className="w-full p-2 border border-gray-300 rounded mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeptModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDepartment}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Code Creation Modal */}
      {showCodeModal && (
        <div className="fixed inset-0  bg-opacity-50 flex h-50 justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create New Code</h3>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <input
              type="text"
              value={newCodeName}
              onChange={(e) => setNewCodeName(e.target.value)}
              placeholder="Enter code name"
              className="w-full p-2 border border-gray-300 rounded mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCode}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showClientModal && (
        <CreateClientModal
          onClose={() => setShowClientModal(false)}
          onCreate={async (clientData) => {
            try {
              await axios.post(
                "https://taskbe.sharda.co.in/api/clients",
                clientData
              );

              Swal.fire({
                icon: "success",
                title: "Client Created",
                text: `"${clientData.name}" was added successfully!`,
                timer: 2000,
                showConfirmButton: false,
              });

              fetchClients();
              setShowClientModal(false);
            } catch (err) {
              Swal.fire({
                icon: "error",
                title: "Creation Failed",
                text: "Unable to create client. Please try again.",
              });
              console.error("Client creation failed", err);
            }
          }}
        />
      )}
    </div>
  );
};

export default Departments;
