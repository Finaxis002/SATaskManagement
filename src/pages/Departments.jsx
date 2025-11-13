import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaTrashAlt,
  FaUsers,
  FaPlus,
  FaTimes,
  FaCode,
  FaChartBar,
  FaEnvelope,
  FaUniversity,
  FaCalendarAlt,
  FaDotCircle,
} from "react-icons/fa";
import Swal from "sweetalert2";
import ReportGeneration from "../Components/ReportGeneration";
import ClientList from "../Components/client/ClientList";
import CreateClientModal from "../Components/client/CreateClientModal";
import MailCreation from "./MailCreation";
import LeaveManagement from "./LeaveManagement";
import socket from "../socket";
import BankDetails from "./BankDetails";
import { useLocation } from "react-router-dom";

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
  const [showClientModal, setShowClientModal] = useState(false);
  const [role, setRole] = useState("");
  const [editCodeId, setEditCodeId] = useState(null);
  const [editCodeName, setEditCodeName] = useState("");
  const [editingDept, setEditingDept] = useState(null);
  const [editableUsersMap, setEditableUsersMap] = useState({});
  const [activeTab, setActiveTab] = useState("department");
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(true);

  const location = useLocation();
  
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      setShowMobileMenu(false);
    }
  }, [location.state]);

  const fetchPendingLeaveCount = async () => {
    try {
      const res = await axios.get(
        "http://localhost:1100/api/leave/pending"
      );
      setPendingLeaveCount(res.data.length || 0);
      console.log("pending leave :", pendingLeaveCount);
    } catch (err) {
      setPendingLeaveCount(0);
    }
  };

  useEffect(() => {
    fetchDepartmentsData();
    fetchTaskCodes();
    fetchClients();
    fetchPendingLeaveCount();

    socket.on("new-leave", fetchPendingLeaveCount);
    socket.on("leave-status-updated", fetchPendingLeaveCount);

    return () => {
      socket.off("new-leave", fetchPendingLeaveCount);
      socket.off("leave-status-updated", fetchPendingLeaveCount);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("pendingLeaveCount", pendingLeaveCount);
  }, [pendingLeaveCount]);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
      if (storedRole !== "admin") {
        setView("client");
      }
    }
  }, []);

  const fetchDepartmentsData = async () => {
    try {
      setLoading(true);

      const deptRes = await axios.get(
        "https://taskbe.sharda.co.in/api/departments"
      );
      const departments = deptRes.data;

      const employeeRes = await axios.get(
        "https://taskbe.sharda.co.in/api/employees"
      );
      const employees = employeeRes.data;

      const taskRes = await axios.get("https://taskbe.sharda.co.in/api/tasks");
      const tasks = taskRes.data;

      const deptMap = {};

      departments.forEach((dept) => {
        deptMap[dept.name] = { users: [], tasks: [] };
      });

      employees.forEach((emp) => {
        const departmentsArray = Array.isArray(emp.department)
          ? emp.department
          : [emp.department];

        departmentsArray.forEach((dept) => {
          if (deptMap[dept]) {
            deptMap[dept].users.push(emp);
          }
        });
      });

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
      const res = await axios.get("https://taskbe.sharda.co.in/api/task-codes");

      const sortedData = res.data.sort((a, b) => {
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

  const fetchClients = async () => {
    try {
      const res = await fetch("https://taskbe.sharda.co.in/api/clients");
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
      // console.error("Failed to fetch clients", err);
    }
  };

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
      await axios.delete(
        `https://taskbe.sharda.co.in/api/task-codes/${codeId}`
      );

      Swal.fire({
        title: "Deleted!",
        text: "The code has been deleted successfully.",
        icon: "success",
        confirmButtonText: "OK",
        customClass: {
          popup: "custom-alert-popup",
          confirmButton: "custom-alert-button",
        },
      });

      fetchTaskCodes();
    } catch (err) {
      console.error(err);

      Swal.fire({
        title: "Error!",
        text: "Failed to delete the code. Please try again.",
        icon: "error",
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
      await axios.post(`https://taskbe.sharda.co.in/api/task-codes`, {
        name: newCodeName,
      });
      fetchTaskCodes();
      setNewCodeName("");
      setShowCodeModal(false);
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

  const handleEditCode = (code) => {
    setEditCodeId(code._id);
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

  const tabs = [
    { key: "department", label: "Department Overview", icon: <FaUsers /> },
    { key: "code", label: "Code Overview", icon: <FaCode /> },
    { key: "report", label: "Report Generation", icon: <FaChartBar /> },
    {
      key: "Manage Leave",
      label: "Leave Management",
      icon: <FaCalendarAlt />,
    },
    { key: "mail", label: "Mail User Creation", icon: <FaEnvelope /> },
    { key: "bank", label: "Bank Details", icon: <FaUniversity /> },
  ];

  return (
    <div className="p-0 md:p-4 md:bg-gray-100 min-h-screen bg-gray-50">
      {/* Mobile Menu List */}
      {showMobileMenu && (
        <div className="md:hidden">
          <h1 className="text-xl font-bold text-gray-900 mb-4 p-4 pb-2 bg-gray-50">
            Application Settings
          </h1>
          
          {/* Settings Options */}
          <div className="px-4 space-y-2 mt-8 ">
            {tabs.map((tab, index) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-all rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-indigo-600 text-xl">{tab.icon}</span>
                  <span className="text-gray-800 font-medium">
                    {tab.label}
                  </span>
                  {tab.key === "Manage Leave" && pendingLeaveCount > 0 && (
                    <span className="flex items-center justify-center bg-red-600 text-white rounded-full text-[9px] font-semibold px-2 py-0.5 min-w-[16px] h-4">
                      {pendingLeaveCount}
                    </span>
                  )}
                </div>
                <span className="text-gray-400 text-xl">›</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header Section - Desktop */}
      <div className="hidden md:block mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Application Settings
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-1">
          {/* Tab Buttons */}
          <div className="flex flex-wrap gap-1 border border-gray-200 rounded-md overflow-hidden w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === tab.key
                    ? "bg-white text-indigo-600 border-b-2 border-indigo-600"
                    : "bg-gray-100 text-gray-700 hover:bg-white"
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                {tab.label}
                {tab.key === "Manage Leave" && pendingLeaveCount > 0 && (
                  <span className="ml-2 flex items-center justify-center bg-red-600 text-white rounded-full text-[9px] font-semibold px-2 py-0.5 w-4 h-4">
                    {pendingLeaveCount}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
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
        </div>
      </div>

      {/* Mobile Header - when content is shown */}
      {!showMobileMenu && (
        <div className="flex items-center justify-between md:hidden mb-4 p-4 md:p-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMobileMenu(true)}
              className="text-indigo-600 hover:text-indigo-800 text-2xl font-bold"
            >
              ‹
            </button>
            <h2 className="text-lg font-semibold text-gray-800">
              {tabs.find((tab) => tab.key === activeTab)?.label || activeTab}
            </h2>
          </div>

          <div>
            {activeTab === "department" && role === "admin" && (
              <button
                onClick={handleCreateDepartment}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1 text-sm"
              >
                <FaPlus /> Add Dept
              </button>
            )}
            {activeTab === "code" && role === "admin" && (
              <button
                onClick={handleCreateCode}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1 text-sm"
              >
                <FaPlus /> Add Code
              </button>
            )}
          </div>
        </div>
      )}

      {/* View Content */}
      {(!showMobileMenu || window.innerWidth >= 768) && (
        <>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-center text-gray-500">Loading data...</p>
            </div>
          ) : (
            <div className="px-0 md:px-0">
              {activeTab === "department" &&
                role === "admin" &&
                (Object.keys(departmentMap).length === 0 ? (
                  <div className="flex justify-center items-center h-60">
                    <p className="text-center text-gray-500 text-lg">
                      No departments or data found.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6 mx-auto max-h-[70vh] overflow-y-auto px-4 md:px-0">
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
                          {editingDept === dept && editableUsersMap[dept] && (
                            <>
                              <div className="flex justify-end mb-4">
                                <button
                                  onClick={() => setEditingDept(null)}
                                  className="inline-flex items-center gap-2 text-sm px-4 py-1 rounded-md border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 transition shadow-sm"
                                >
                                  ✖ Close Edit Mode
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {editableUsersMap[dept].map((user, index) => (
                                  <div
                                    key={user._id}
                                    className="relative bg-white rounded-xl border border-gray-200 shadow-md p-4 hover:shadow-lg transition-all flex flex-col items-center text-center"
                                  >
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

                                    <div className="h-14 w-14 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-md mb-2 shadow-sm">
                                      {user.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .slice(0, 2)}
                                    </div>

                                    <div className="mb-2">
                                      <h3 className="text-base font-semibold text-gray-800">
                                        {user.name}
                                      </h3>
                                      <p className="text-sm text-gray-500">
                                        {user.position}
                                      </p>
                                    </div>

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
                  <div className="space-y-6 mx-auto max-h-[70vh] overflow-y-auto px-4 md:px-0">
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

              {activeTab === "report" && role === "admin" && <ReportGeneration />}

              {activeTab === "Manage Leave" && role === "admin" && (
                <LeaveManagement />
              )}

              <div className="max-h-[20vh]">
                {activeTab === "mail" && role === "admin" && <MailCreation />}
              </div>

              {activeTab === "bank" && role === "admin" && <BankDetails />}
            </div>
          )}
        </>
      )}

      {/* Department Creation Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
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
              className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
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
              className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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