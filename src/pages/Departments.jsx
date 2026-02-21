import React, { useEffect, useState, useMemo, useCallback, lazy, Suspense } from "react";
import axios from "axios";
import {
  FaTrashAlt, FaUsers, FaPlus, FaTimes, FaCode,
  FaChartBar, FaEnvelope, FaUniversity, FaCalendarAlt, FaSpinner,
} from "react-icons/fa";
import { FiFileText } from "react-icons/fi";
import Swal from "sweetalert2";

const ReportGeneration = lazy(() => import("../Components/ReportGeneration"));
const LeaveManagement = lazy(() => import("./LeaveManagement"));
const MailCreation = lazy(() => import("./MailCreation"));
const BankDetails = lazy(() => import("./BankDetails"));
const MessageTemplatesManager = lazy(() => import("../Components/Tasks/MessageTemplatesManager"));

const cache = {
  data: {}, timestamps: {},
  get(key) {
    const age = Date.now() - (this.timestamps[key] || 0);
    if (age < 300000) return this.data[key];
    return null;
  },
  set(key, value) { this.data[key] = value; this.timestamps[key] = Date.now(); },
  clear(key) { delete this.data[key]; delete this.timestamps[key]; }
};

// ✅ Tamam tabs ka config — har tab ka permission key
const ALL_TABS_CONFIG = [
  { key: "department", label: "Department Overview", icon: <FaUsers />, permKey: "settings_tab_department", adminOnly: true },
  { key: "code", label: "Code Overview", icon: <FaCode />, permKey: "settings_tab_code", adminOnly: true },
  { key: "templates", label: "Message Templates", icon: <FiFileText />, permKey: "settings_tab_templates", adminOnly: true },
  { key: "report", label: "Report Generation", icon: <FaChartBar />, permKey: "settings_tab_report", adminOnly: true },
  { key: "Manage Leave", label: "Leave Management", icon: <FaCalendarAlt />, permKey: "settings_tab_leave", adminOnly: false },
  { key: "mail", label: "Mail User Creation", icon: <FaEnvelope />, permKey: "settings_tab_mail", adminOnly: true },
  { key: "bank", label: "Bank Details", icon: <FaUniversity />, permKey: "settings_tab_bank", adminOnly: true },
];

const Departments = () => {
  const [departmentMap, setDepartmentMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [taskCodes, setTaskCodes] = useState([]);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [newCodeName, setNewCodeName] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState(() =>
    (localStorage.getItem("department") || "").toLowerCase().trim()
  );
  const [activeTab, setActiveTab] = useState("department");
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(true);
  const [allowedPerms, setAllowedPerms] = useState([]);

  const isHR = useMemo(() => {
    return role === "user" && department === "human resource";
  }, [role, department]);


  // ✅ API se fresh permissions fetch karo — localStorage pe depend mat karo
  const fetchAndApplyPermissions = useCallback(async (dept, storedRole) => {
    if (storedRole === "admin") return;
    try {
      const res = await axios.get("https://taskbe.sharda.co.in/api/permissions");
      const perms = res.data;
      localStorage.setItem("departmentPermissions", JSON.stringify(perms));
      const deptPerms = perms[dept] || [];
      setAllowedPerms(deptPerms);

      // Pehla allowed tab set karo
      const firstTab = ALL_TABS_CONFIG.find(t => deptPerms.includes(t.permKey));
      if (firstTab) setActiveTab(firstTab.key);
    } catch {
      // Fallback to localStorage
      const savedPerms = localStorage.getItem("departmentPermissions");
      if (savedPerms) {
        try {
          const perms = JSON.parse(savedPerms);
          const deptPerms = perms[dept] || [];
          setAllowedPerms(deptPerms);
          const firstTab = ALL_TABS_CONFIG.find(t => deptPerms.includes(t.permKey));
          if (firstTab) setActiveTab(firstTab.key);
        } catch { /* ignore */ }
      }
    }
  }, []);

  // ✅ Role load + default tab set
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedDept = (localStorage.getItem("department") || "").toLowerCase().trim();

    if (storedRole) {
      setRole(storedRole);
      setDepartment(storedDept);

      if (storedRole !== "admin") {
        fetchAndApplyPermissions(storedDept, storedRole);
      }
    }

    const cachedCount = localStorage.getItem("pendingLeaveCount");
    if (cachedCount) setPendingLeaveCount(parseInt(cachedCount));
  }, []);

  // ✅ Tabs: Admin ko sab, non-admin ko allowedPerms state se
  const tabs = useMemo(() => {
    if (role === "admin") return ALL_TABS_CONFIG;
    return ALL_TABS_CONFIG.filter(tab => allowedPerms.includes(tab.permKey));
  }, [role, allowedPerms]);


  const fetchDepartmentsData = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = cache.get('dashboard');
      if (cached) { setDepartmentMap(cached); setLoading(false); return; }
    }

    try {
      setLoading(true);
      let departments, employees;

      try {
        const { data } = await axios.get(
          "https://taskbe.sharda.co.in/api/departments/dashboard-data",
          { timeout: 5000 }
        );
        departments = data.departments;
        employees = data.employees;
      } catch {
        const [deptRes, empRes] = await Promise.all([
          axios.get("https://taskbe.sharda.co.in/api/departments", { timeout: 5000 }),
          axios.get("https://taskbe.sharda.co.in/api/employees", { timeout: 5000 })
        ]);
        departments = deptRes.data;
        employees = empRes.data;
      }

      const deptMap = {};
      departments.forEach(dept => { deptMap[dept.name] = { users: [], tasks: [] }; });
      employees.forEach(emp => {
        const depts = Array.isArray(emp.department) ? emp.department : [emp.department];
        depts.forEach(dept => { if (deptMap[dept]) deptMap[dept].users.push(emp); });
      });

      setDepartmentMap(deptMap);
      cache.set('dashboard', deptMap);
    } catch (err) {
      console.error("Failed to fetch:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTaskCodes = useCallback(async () => {
    const cached = cache.get('taskCodes');
    if (cached) { setTaskCodes(cached); return; }

    try {
      const res = await axios.get("https://taskbe.sharda.co.in/api/task-codes");
      const sortedData = res.data.sort((a, b) => {
        const numA = parseInt(a.name.match(/^\d+/)?.[0] || 0, 10);
        const numB = parseInt(b.name.match(/^\d+/)?.[0] || 0, 10);
        return numA - numB;
      });
      setTaskCodes(sortedData);
      cache.set('taskCodes', sortedData);
    } catch (err) {
      console.error("Failed to fetch task codes:", err);
    }
  }, []);

  const fetchPendingLeaveCount = useCallback(async () => {
    try {
      const res = await axios.get("https://taskbe.sharda.co.in/api/leave/pending");
      const count = res.data.length || 0;
      setPendingLeaveCount(count);
      localStorage.setItem("pendingLeaveCount", count);
    } catch {
      setPendingLeaveCount(0);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "department") fetchDepartmentsData();
    else if (activeTab === "code") fetchTaskCodes();
  }, [activeTab, role, fetchDepartmentsData, fetchTaskCodes]);

  useEffect(() => { fetchPendingLeaveCount(); }, [fetchPendingLeaveCount]);

  const handleDeleteDepartment = useCallback(async (dept) => {
    const result = await Swal.fire({
      title: `Delete "${dept}" department?`,
      text: "This will remove the department from all users.",
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#d33", cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it", cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;

    try {
      await axios.put("https://taskbe.sharda.co.in/api/departments/remove-department", { department: dept });
      Swal.fire({ title: "Deleted!", text: `The "${dept}" department has been removed.`, icon: "success", timer: 2000, showConfirmButton: false });
      cache.clear('dashboard');
      setDepartmentMap((prev) => { const newMap = { ...prev }; delete newMap[dept]; return newMap; });
    } catch {
      Swal.fire({ title: "Error!", text: "Failed to delete department.", icon: "error" });
    }
  }, []);

  const handleDeleteCode = useCallback(async (codeId) => {
    const result = await Swal.fire({
      title: "Are you sure?", text: "This code will be permanently deleted!",
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#d33", confirmButtonText: "Yes, delete it",
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`https://taskbe.sharda.co.in/api/task-codes/${codeId}`);
      Swal.fire({ title: "Deleted!", icon: "success", timer: 2000, showConfirmButton: false });
      cache.clear('taskCodes');
      setTaskCodes(prev => prev.filter(code => code._id !== codeId));
    } catch {
      Swal.fire({ title: "Error!", text: "Failed to delete the code.", icon: "error" });
    }
  }, []);

  const handleSubmitDepartment = useCallback(async () => {
    if (!newDeptName.trim()) return;
    try {
      await axios.post("https://taskbe.sharda.co.in/api/departments", { name: newDeptName });
      cache.clear('dashboard');
      setDepartmentMap((prev) => ({ ...prev, [newDeptName]: { users: [], tasks: [] } }));
      setNewDeptName(""); setShowDeptModal(false);
    } catch { console.error("Failed to create department"); }
  }, [newDeptName]);

  const handleSubmitCode = useCallback(async () => {
    if (!newCodeName.trim()) return;
    try {
      await axios.post("https://taskbe.sharda.co.in/api/task-codes", { name: newCodeName });
      cache.clear('taskCodes');
      fetchTaskCodes();
      setNewCodeName(""); setShowCodeModal(false);
      Swal.fire({ icon: "success", title: "Created!", timer: 2000, showConfirmButton: false });
    } catch { console.error("Failed to create code"); }
  }, [newCodeName, fetchTaskCodes]);

  const LoadingSpinner = () => (
    <div className="flex flex-col justify-center items-center h-64">
      <FaSpinner className="animate-spin text-indigo-600 text-5xl mb-4" />
      <p className="text-gray-600 text-lg">Loading data...</p>
    </div>
  );

  return (
    <div className="p-0 md:p-4 md:bg-gray-100 min-h-screen bg-gray-50">

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden">
          <h1 className="text-xl font-bold text-gray-900 mb-4 p-4 pb-2 bg-gray-50">Application Settings</h1>
          <div className="px-4 space-y-2 mt-8">
            {tabs.map((tab) => (
              <button key={tab.key}
                onClick={() => { setActiveTab(tab.key); setShowMobileMenu(false); }}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 transition-all rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-indigo-600 text-xl">{tab.icon}</span>
                  <span className="text-gray-800 font-medium">{tab.label}</span>
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

      {/* Desktop Header */}
      <div className="hidden md:block mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Application Settings</h1>
        <div className="flex flex-wrap items-center justify-between gap-1">
          <div className="flex flex-wrap gap-1 border border-gray-200 rounded-md overflow-hidden w-fit">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
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

          <div className="flex flex-wrap gap-2">
            {activeTab === "department" && role === "admin" && (
              <button onClick={() => setShowDeptModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
                <FaPlus /> Add Department
              </button>
            )}
            {activeTab === "code" && role === "admin" && (
              <button onClick={() => setShowCodeModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors">
                <FaPlus /> Add Code
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Header - content visible hone par */}
      {!showMobileMenu && (
        <div className="flex items-center justify-between md:hidden mb-4 p-4 md:p-0">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowMobileMenu(true)}
              className="text-indigo-600 hover:text-indigo-800 text-2xl font-bold">‹</button>
            <h2 className="text-lg font-semibold text-gray-800">
              {tabs.find((tab) => tab.key === activeTab)?.label || activeTab}
            </h2>
          </div>
          <div>
            {activeTab === "department" && role === "admin" && (
              <button onClick={() => setShowDeptModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1 text-sm">
                <FaPlus /> Add Dept
              </button>
            )}
            {activeTab === "code" && role === "admin" && (
              <button onClick={() => setShowCodeModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md flex items-center gap-1 text-sm">
                <FaPlus /> Add Code
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {(!showMobileMenu || window.innerWidth >= 768) && (
        <>
          {loading && (activeTab === "department" || activeTab === "code") ? (
            <LoadingSpinner />
          ) : (
            <div className="px-0 md:px-0">
              {/* ✅ Department Overview — admin ya jisko permission hai */}
              {activeTab === "department" && (role === "admin" || allowedPerms.includes("settings_tab_department")) && (
                Object.keys(departmentMap).length === 0 ? (
                  <div className="flex justify-center items-center h-60">
                    <p className="text-center text-gray-500 text-lg">No departments found.</p>
                  </div>
                ) : (
                  <div className="space-y-4 mx-auto max-h-auto overflow-y-auto px-4 md:px-0">
                    {Object.entries(departmentMap).map(([dept, { users }]) => (
                      <div key={dept} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <FaUsers className="text-indigo-600 text-xl" />
                            <h2 className="text-xl font-semibold text-indigo-800">{dept}</h2>
                            <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                              {users.length} user{users.length !== 1 && "s"}
                            </span>
                          </div>
                          {role === "admin" && (
                            <button onClick={() => handleDeleteDepartment(dept)}
                              className="text-red-500 hover:text-red-700 transition-colors" title="Delete Department">
                              <FaTrashAlt size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* ✅ Code Overview — admin ya jisko permission hai */}
              {activeTab === "code" && (role === "admin" || allowedPerms.includes("settings_tab_code")) && (
                taskCodes.length === 0 ? (
                  <div className="flex justify-center items-center h-64">
                    <p className="text-center text-gray-500">No codes found.</p>
                  </div>
                ) : (
                  <div className="space-y-4 mx-auto max-h-[calc(100vh-300px)] overflow-y-auto px-4 md:px-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {taskCodes.map((codeObj) => (
                        <div key={codeObj._id}
                          className="bg-white flex justify-between items-center border border-gray-200 p-3 rounded-md shadow hover:shadow-md transition">
                          <h3 className="text-base font-semibold text-indigo-800">{codeObj.name}</h3>
                          {role === "admin" && (
                            <button onClick={() => handleDeleteCode(codeObj._id)}
                              className="text-red-500 hover:text-red-700" title="Delete Code">
                              <FaTrashAlt size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}

              <Suspense fallback={<LoadingSpinner />}>
                {/* ✅ Har tab: admin ya jisko us tab ki permission hai */}
                {activeTab === "templates" && (role === "admin" || allowedPerms.includes("settings_tab_templates")) && <MessageTemplatesManager />}
                {activeTab === "report" && (role === "admin" || allowedPerms.includes("settings_tab_report")) && <ReportGeneration />}
                {activeTab === "Manage Leave" && (role === "admin" || allowedPerms.includes("settings_tab_leave")) && <LeaveManagement />}
                {activeTab === "mail" && (role === "admin" || allowedPerms.includes("settings_tab_mail")) && <MailCreation />}
                {activeTab === "bank" && (role === "admin" || allowedPerms.includes("settings_tab_bank")) && <BankDetails />}
              </Suspense>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showDeptModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create New Department</h3>
              <button onClick={() => setShowDeptModal(false)} className="text-gray-500 hover:text-gray-700"><FaTimes /></button>
            </div>
            <input type="text" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)}
              placeholder="Enter department name"
              className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" autoFocus />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDeptModal(false)} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmitDepartment} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Create</button>
            </div>
          </div>
        </div>
      )}

      {showCodeModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Create New Code</h3>
              <button onClick={() => setShowCodeModal(false)} className="text-gray-500 hover:text-gray-700"><FaTimes /></button>
            </div>
            <input type="text" value={newCodeName} onChange={(e) => setNewCodeName(e.target.value)}
              placeholder="Enter code name"
              className="w-full p-2 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" autoFocus />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCodeModal(false)} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
              <button onClick={handleSubmitCode} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;