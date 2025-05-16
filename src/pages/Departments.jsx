import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrashAlt, FaUsers, FaPlus, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import ReportGeneration from "../Components/ReportGeneration";
import ClientList from "../Components/ClientList";
import CreateClientModal from "../Components/CreateClientModal";

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

  const fetchTaskCodes = async () => {
    try {
      const res = await axios.get(
        "https://sataskmanagementbackend.onrender.com/api/task-codes"
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
  //       "https://sataskmanagementbackend.onrender.com/api/clients"
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
        "https://sataskmanagementbackend.onrender.com/api/clients"
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
        "https://sataskmanagementbackend.onrender.com/api/departments/remove-department",
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
        `https://sataskmanagementbackend.onrender.com/api/task-codes/${codeId}`
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
        `https://sataskmanagementbackend.onrender.com/api/clients`,
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

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      
       <h1 className="text-3xl font-bold text-center text-indigo-900 mb-5">
      {view === "department"
        ? "Departments Overview"
        : view === "code"
        ? "Code Overview"
        : view === "client"
        ? "Client Overview"
        : "Reports Overview"}
    </h1>

      {/* 🔘 View Switch Buttons */}
      {/* <div className="flex justify-center gap-4 mb-6">
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

        <button
          className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
            view === "client"
              ? "bg-indigo-600 text-white"
              : "bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
          }`}
          onClick={() => setView("client")}
        >
          Client Overview
        </button>
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
      </div> */}

      {/* Action Buttons */}
      {/* <div className="flex justify-end mb-2">
        {view === "department" ? (
          <button
            onClick={handleCreateDepartment}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
          >
            <FaPlus /> Add Department
          </button>
        ) : view === "code" ? (
          <button
            onClick={handleCreateCode}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
          >
            <FaPlus /> Add Code
          </button>
        ) : view === "client" ? (
          <button
            onClick={() => setShowClientModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
          >
            <FaPlus /> Add Client
          </button>
        ) : null}
      </div> */}

      {/* ✅ View Content */}
      {/* {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-center text-gray-500">Loading data...</p>
        </div>
      ) :
       view === "department" ? (
        Object.keys(departmentMap).length === 0 ? (
          <div className="flex justify-center items-center h-60">
            <p className="text-center text-gray-500 text-lg">
              No departments or data found.
            </p>
          </div>
        ) : (
          // === Department Overview ===
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
                  <button
                    type="button"
                    onClick={() => handleDeleteDepartment(dept)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Delete Department"
                  >
                    <FaTrashAlt size={18} />
                  </button>
                </div>

                
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
                  <h3 className="text-lg font-semibold text-indigo-800">
                    {codeObj.name}
                  </h3>
                  <button
                    onClick={() => handleDeleteCode(codeObj._id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Delete Code"
                  >
                    <FaTrashAlt size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      ) : view === "client" ? ( */}
       
        {/* // clients.length === 0 ? (
        //   <div className="flex justify-center items-center h-64">
        //     <p className="text-center text-gray-500">No clients found.</p>
        //   </div>
        // ) : (
        //   <div className="space-y-6 mx-auto max-h-[60vh] overflow-y-auto">
        //     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        //       {clients.map((clientName, index) => ( */}
                 
        {/* //           <div key={`${clientName}-${index}`}
        //           className="bg-white flex justify-between items-center border border-gray-200 p-4 rounded-md shadow hover:shadow-md transition"
        //         > */}
        {/* //           <h3 className="text-lg font-semibold text-indigo-800">
        //             {clientName || "Unnamed Client"}
        //           </h3>
        //           <button */}
        {/* //             onClick={() => handleDeleteClient(clientName)}
        //             className="text-red-500 hover:text-red-700 transition-colors"
        //             title="Delete Client"
        //           >
        //             <FaTrashAlt size={16} />
        //           </button> */}
        {/* //         </div> */}
        {/* //       ))} */}
        {/* //     </div> */}
        {/* //   </div> */}
        {/* // )
      //   <div className="space-y-6 mx-auto max-h-[60vh] overflow-y-auto">
      //     <ClientList clients={clients} onDelete={handleDeleteClient} />
      //   </div>
      // ) : view === "report" ? (
      //   <ReportGeneration />
      // ) : null} */}

  {/* 🔘 View Switch Buttons */}
    <div className="flex justify-center gap-4 mb-6">
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

      {/* <button
        className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
          view === "client"
            ? "bg-indigo-600 text-white"
            : "bg-white text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
        }`}
        onClick={() => setView("client")}
      >
        Client Overview
      </button> */}

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
    </div>

    {/* 🔘 Action Buttons */}
    <div className="flex justify-end mb-2">
      {view === "department" && role === "admin" && (
        <button
          onClick={handleCreateDepartment}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
        >
          <FaPlus /> Add Department
        </button>
      )}

      {view === "code" && role === "admin" && (
        <button
          onClick={handleCreateCode}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
        >
          <FaPlus /> Add Code
        </button>
      )}

      {/* {view === "client" &&  (
        <button
          onClick={() => setShowClientModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
        >
          <FaPlus /> Add Client
        </button>
      )} */}
    </div>

    {/* 🔁 View Content */}
    {loading ? (
      <div className="flex justify-center items-center h-64">
        <p className="text-center text-gray-500">Loading data...</p>
      </div>
    ) : (
      <>
        {view === "department" && role === "admin" && (
          Object.keys(departmentMap).length === 0 ? (
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
                      <h2 className="text-2xl font-semibold text-indigo-800">{dept}</h2>
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                        {users.length} user{users.length !== 1 && "s"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteDepartment(dept)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete Department"
                    >
                      <FaTrashAlt size={18} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 text-sm text-gray-700">
                    {users.map((user) => (
                      <div
                        key={user._id}
                        className="bg-gray-50 border border-gray-200 p-4 rounded-md hover:shadow transition"
                      >
                        <div className="font-medium text-gray-900">{user.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {view === "code" && role === "admin" && (
          taskCodes.length === 0 ? (
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
                    <h3 className="text-lg font-semibold text-indigo-800">{codeObj.name}</h3>
                    <button
                      onClick={() => handleDeleteCode(codeObj._id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Delete Code"
                    >
                      <FaTrashAlt size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {view === "client" && (
          <div className="space-y-6 mx-auto max-h-[60vh] overflow-y-auto">
            <ClientList clients={clients} onDelete={handleDeleteClient} />
          </div>
        )}

        {view === "report" && role === "admin" && <ReportGeneration />}
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

      {/* Client Creation Modal */}
      {/* {showClientModal && (
        <div className="fixed inset-0  bg-opacity-50 flex h-50 justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create New Client</h3>
              <button
                onClick={() => setShowClientModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
            <input
              type="text"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="Enter client name"
              className="w-full p-2 border border-gray-300 rounded mb-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowClientModal(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newClientName.trim()) return;
                  try {
                    await axios.post(
                      `https://sataskmanagementbackend.onrender.com/api/clients`,
                      {
                        name: newClientName,
                      }
                    );

                    Swal.fire({
                      icon: "success",
                      title: "Client Created",
                      text: `"${newClientName}" was added successfully!`,
                      timer: 2000,
                      showConfirmButton: false,
                    });

                    fetchClients();
                    setNewClientName("");
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
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )} */}
      {showClientModal && (
  <CreateClientModal
    onClose={() => setShowClientModal(false)}
    onCreate={async (clientData) => {
      try {
        await axios.post("https://sataskmanagementbackend.onrender.com/api/clients", clientData);

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
