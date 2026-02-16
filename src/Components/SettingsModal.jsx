import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCog, FaSave, FaUsers } from "react-icons/fa";
import { MdSecurity } from "react-icons/md";

/* ---------------------------- Constants ---------------------------- */

const ALL_MENU_ITEMS = [
  { key: "home", label: "Home", icon: "🏠" },
  { key: "allUsers", label: "All Users", icon: "👥", adminOnly: true },
  { key: "teamStatus", label: "IT Department", icon: "📊" },
  { key: "tasks", label: "Tasks", icon: "📋" },
  { key: "agent", label: "Agent", icon: "👔" },
  { key: "supportRequests", label: "Support Requests", icon: "📧" },
  { key: "clients", label: "Clients", icon: "💼" },
  { key: "leave", label: "Leave", icon: "⛳" },
  { key: "settings", label: "Settings", icon: "⚙️", adminOnly: true },
  {
    key: "completedTasks",
    label: "Completed Tasks",
    icon: "✅",
    adminOnly: true,
  },
  { key: "invoicing", label: "Invoicing", icon: "💰" },
  { key: "updates", label: "Updates", icon: "🕒" },
];

const DEFAULT_PERMISSIONS = {
  marketing: ["home", "tasks", "agent", "clients", "leave", "teamStatus"],
  operations: ["home", "tasks", "agent", "clients", "leave", "teamStatus"],
  "it/software": [
    "home",
    "teamStatus",
    "tasks",
    "agent",
    "supportRequests",
    "clients",
    "leave",
    "updates",
  ],
  seo: ["home", "tasks", "agent", "clients", "leave", "teamStatus"],
  "human resource": [
    "home",
    "tasks",
    "agent",
    "clients",
    "leave",
    "teamStatus",
  ],
  finance: ["home", "tasks", "agent", "clients", "leave", "teamStatus"],
  sales: [
    "home",
    "tasks",
    "agent",
    "clients",
    "leave",
    "invoicing",
    "teamStatus",
  ],
};

const getRandomColor = () => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-violet-500",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/* ---------------------------- Settings Modal ---------------------------- */
function SettingsModal({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [showScrollHint, setShowScrollHint] = useState(false);

  // Ref to prevent multiple API calls
  const hasLoadedPermissions = useRef(false);
  const hasLoadedDepartments = useRef(false);

  const [departmentPermissions, setDepartmentPermissions] =
    useState(DEFAULT_PERMISSIONS);
  const [selectedDepartment, setSelectedDepartment] = useState("marketing");

  // ✅ Fetch departments from backend
  useEffect(() => {
    if (!open || hasLoadedDepartments.current) return;

    let isMounted = true;

    const fetchDepartments = async () => {
      try {
        const response = await fetch(
          "https://taskbe.sharda.co.in/api/departments"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!isMounted) return;

        if (!data || data.length === 0) {
          setDepartments([]);
          return;
        }

        const fetchedDepartments = data
          .filter((dept) => dept.name.toLowerCase().trim() !== "administration")
          .map((dept) => ({
            key: dept.name.toLowerCase().trim(),
            label: dept.name,
            color: getRandomColor(),
          }));

        setDepartments(fetchedDepartments);
        hasLoadedDepartments.current = true;

        if (fetchedDepartments.length > 0 && !selectedDepartment) {
          setSelectedDepartment(fetchedDepartments[0].key);
        }

        // Check if horizontal scroll is needed (mobile view)
        setTimeout(() => {
          const container = document.getElementById("dept-scroll-container");
          if (container && container.scrollWidth > container.clientWidth) {
            setShowScrollHint(true);
            setTimeout(() => setShowScrollHint(false), 3000);
          }
        }, 100);
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching departments:", error);
          setDepartments([]);
        }
      }
    };

    fetchDepartments();

    return () => {
      isMounted = false;
    };
  }, [open, selectedDepartment]);

  // ✅ Load permissions from backend on mount
  useEffect(() => {
    if (!open || hasLoadedPermissions.current) return;

    let isMounted = true;

    const loadPermissions = async () => {
      try {
        const response = await fetch(
          "https://taskbe.sharda.co.in/api/permissions"
        );
        const data = await response.json();

        if (!isMounted) return;

        const mergedPermissions = { ...DEFAULT_PERMISSIONS, ...data };
        setDepartmentPermissions(mergedPermissions);

        localStorage.setItem(
          "departmentPermissions",
          JSON.stringify(mergedPermissions)
        );

        hasLoadedPermissions.current = true;
      } catch (error) {
        if (!isMounted) return;

        console.error("Error loading permissions:", error);
        const savedPermissions = localStorage.getItem("departmentPermissions");
        if (savedPermissions) {
          try {
            const parsed = JSON.parse(savedPermissions);
            setDepartmentPermissions(parsed);
          } catch {
            setDepartmentPermissions(DEFAULT_PERMISSIONS);
          }
        } else {
          setDepartmentPermissions(DEFAULT_PERMISSIONS);
        }
      }
    };

    loadPermissions();

    return () => {
      isMounted = false;
    };
  }, [open]); // Dependencies are genuinely just 'open' since other vars are constants/stable

  // Reset refs when modal closes
  useEffect(() => {
    if (!open) {
      hasLoadedPermissions.current = false;
      hasLoadedDepartments.current = false;
    }
  }, [open]);

  const handlePermissionToggle = (menuItemKey) => {
    setDepartmentPermissions((prev) => {
      const currentPerms = prev[selectedDepartment] || [];
      const newPerms = currentPerms.includes(menuItemKey)
        ? currentPerms.filter((key) => key !== menuItemKey)
        : [...currentPerms, menuItemKey];

      return {
        ...prev,
        [selectedDepartment]: newPerms,
      };
    });
  };

  const handleSavePermissions = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        "https://taskbe.sharda.co.in/api/permissions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(departmentPermissions),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem(
          "departmentPermissions",
          JSON.stringify(departmentPermissions)
        );

        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } else {
        throw new Error(data.message || "Failed to save permissions");
      }
    } catch (error) {
      console.error("❌ Error saving permissions:", error);
      alert(
        "Failed to save permissions. Please try again.\nError: " + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPermissions = async () => {
    if (
      window.confirm(
        "Are you sure you want to reset all permissions to default?"
      )
    ) {
      console.log("🔄 Resetting to default permissions");
      setLoading(true);

      try {
        const response = await fetch(
          "https://taskbe.sharda.co.in/api/permissions/reset",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setDepartmentPermissions(data.permissions);
          localStorage.setItem(
            "departmentPermissions",
            JSON.stringify(data.permissions)
          );
          console.log("✅ Reset complete");
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        } else {
          throw new Error("Failed to reset permissions");
        }
      } catch (error) {
        console.error("❌ Error resetting permissions:", error);
        alert("Failed to reset permissions. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (!open) return null;

  const currentPermissions = departmentPermissions[selectedDepartment] || [];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4"
        role="dialog"
        aria-modal="true"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <motion.div
          className="w-full max-w-5xl rounded-xl sm:rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden h-[95vh] sm:h-auto sm:max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
          initial={{ y: 30, scale: 0.98 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 30, opacity: 0.9 }}
          transition={{
            duration: 0.35,
            type: "spring",
            stiffness: 120,
            damping: 18,
          }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-indigo-600 px-3 sm:px-5 py-3 sm:py-4 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <span className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/20 flex-shrink-0">
                <FaCog className="text-white text-base sm:text-lg" />
              </span>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold truncate">
                Department Permissions
              </h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 sm:p-2 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition flex-shrink-0 ml-2"
              aria-label="Close"
              title="Close"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          </div>

          {/* Success Message */}
          {saveSuccess && (
            <div className="bg-green-50 border-l-4 border-green-500 p-3 sm:p-4 mx-3 sm:mx-6 mt-3 sm:mt-4 rounded-lg">
              <div className="flex items-center gap-2">
                <FaSave className="text-green-600 flex-shrink-0" />
                <p className="text-green-800 font-semibold text-xs sm:text-sm">
                  Permissions saved successfully!
                </p>
              </div>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row min-h-0">
            {/* Left Sidebar - Department List */}
            <div className="w-full lg:w-64 bg-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200 overflow-y-auto flex-shrink-0">
              <div className="p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-600 uppercase mb-2 sm:mb-3 flex items-center gap-2">
                  <FaUsers className="text-purple-600 flex-shrink-0" />
                  <span className="truncate">Departments</span>
                </h3>

                {departments.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <div className="text-gray-400 mb-2">
                      <FaUsers className="mx-auto text-4xl" />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">
                      No departments found
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">
                      Please add departments from Settings
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Swipe Instruction Badge - Shows on mobile only */}
                    {departments.length > 3 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{
                          opacity: showScrollHint ? 1 : 0,
                          y: showScrollHint ? 0 : -10,
                        }}
                        className="lg:hidden absolute -top-8 right-0 bg-purple-600 text-white text-[10px] px-2.5 py-1 rounded-full font-semibold shadow-lg flex items-center gap-1 z-10"
                      >
                        <span>👉 Swipe</span>
                      </motion.div>
                    )}

                    <div
                      id="dept-scroll-container"
                      className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 -mx-3 px-3 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                      onScroll={(e) => {
                        const container = e.target;
                        if (container.scrollLeft > 10) {
                          setShowScrollHint(false);
                        }
                      }}
                    >
                      <style>{`
                        #dept-scroll-container::-webkit-scrollbar {
                          display: none;
                        }
                      `}</style>
                      {departments.map((dept) => (
                        <button
                          key={dept.key}
                          onClick={() => setSelectedDepartment(dept.key)}
                          className={`snap-start whitespace-nowrap lg:w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 flex items-center gap-2 sm:gap-3 ${
                            selectedDepartment === dept.key
                              ? "bg-purple-600 text-white shadow-md"
                              : "bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <span
                            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${dept.color}`}
                          ></span>
                          <span className="font-medium text-xs sm:text-sm">
                            {dept.label}
                          </span>
                          <span className="ml-auto text-[10px] sm:text-xs opacity-70 flex-shrink-0">
                            {(departmentPermissions[dept.key] || []).length}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Glowing Edge Effect - Permanent */}
                    <div className="lg:hidden absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-purple-100/80 via-transparent to-transparent pointer-events-none rounded-r-lg"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Content - Permissions */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 bg-gradient-to-b from-white to-gray-50 min-h-0">
              {departments.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center py-12 px-4">
                    <div className="text-gray-300 mb-4">
                      <FaCog className="mx-auto text-6xl animate-pulse" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No Departments Available
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md">
                      Please add departments from the Settings page before
                      configuring permissions.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-4 sm:mb-5 md:mb-6">
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-1 sm:mb-2 capitalize">
                      {
                        departments.find((d) => d.key === selectedDepartment)
                          ?.label
                      }{" "}
                      Permissions
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Select menu items this department can access
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
                    {ALL_MENU_ITEMS.map((item) => {
                      const isEnabled = currentPermissions.includes(item.key);
                      const isAdminOnly = item.adminOnly;

                      return (
                        <motion.div
                          key={item.key}
                          className={`flex items-center justify-between p-2.5 sm:p-3 md:p-4 bg-white rounded-lg sm:rounded-xl border-2 transition-all duration-200 ${
                            isAdminOnly
                              ? "border-orange-300 bg-orange-50"
                              : isEnabled
                              ? "border-purple-300 shadow-sm"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 flex-1 min-w-0">
                            <span className="text-lg sm:text-xl md:text-2xl flex-shrink-0">
                              {item.icon}
                            </span>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-xs sm:text-sm md:text-base text-gray-900 truncate">
                                {item.label}
                                {isAdminOnly && (
                                  <span className="ml-2 text-[10px] sm:text-xs font-semibold text-orange-600 bg-orange-100 px-1.5 sm:px-2 py-0.5 rounded">
                                    Admin Only
                                  </span>
                                )}
                              </h4>
                            </div>
                          </div>
                          {isAdminOnly ? (
                            <div className="flex items-center justify-center w-9 sm:w-11 h-5 sm:h-6 flex-shrink-0 ml-2">
                              <span className="text-orange-600 text-xs sm:text-sm font-bold">
                                🔒
                              </span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handlePermissionToggle(item.key)}
                              className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 cursor-pointer flex-shrink-0 ml-2 ${
                                isEnabled ? "bg-purple-600" : "bg-gray-300"
                              }`}
                              role="switch"
                              aria-checked={isEnabled}
                            >
                              <span
                                className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                                  isEnabled
                                    ? "translate-x-5 sm:translate-x-6"
                                    : "translate-x-0.5 sm:translate-x-1"
                                }`}
                              />
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="mt-4 sm:mt-5 md:mt-6 p-2.5 sm:p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl">
                    <div className="flex items-start gap-2 sm:gap-2.5 md:gap-3">
                      <MdSecurity className="text-blue-600 text-base sm:text-lg md:text-xl mt-0.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-blue-900 mb-1 text-xs sm:text-sm md:text-base">
                          Permission Settings
                        </h4>
                        <ul className="text-[10px] sm:text-xs md:text-sm text-blue-800 space-y-0.5 sm:space-y-1 list-disc list-inside">
                          <li>
                            <strong>Admin Only Items:</strong> All Users,
                            Settings, and Completed Tasks are restricted to
                            admins only and cannot be assigned to departments
                          </li>
                          <li>
                            <strong>Settings Tab:</strong> Admins can view all
                            tabs in Settings page - Department Overview, Code
                            Overview, Message Templates, Report Generation,
                            Leave Management, Mail Creation, and Bank Details
                          </li>
                          <li>
                            <strong>Add/Delete Actions:</strong> Only admins can
                            add or delete departments and codes
                          </li>
                          <li>Changes apply immediately via WebSocket</li>
                          <li>
                            Permissions sync in real-time across all sessions
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
            <div className="flex gap-2 sm:gap-3 order-2 sm:order-1">
              <button
                onClick={handleResetPermissions}
                disabled={loading}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg text-gray-700 hover:bg-gray-100 active:scale-[0.99] transition disabled:opacity-50 font-medium"
              >
                Reset
              </button>
            </div>
            <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 active:scale-[0.99] transition disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePermissions}
                disabled={loading}
                className="flex-1 sm:flex-none px-4 sm:px-5 md:px-6 py-2 text-xs sm:text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700 active:scale-[0.99] transition flex items-center justify-center gap-1.5 sm:gap-2 disabled:opacity-50 font-medium"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3.5 w-3.5 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                    <span className="hidden xs:inline">Saving...</span>
                  </>
                ) : (
                  <>
                    <FaSave className="text-xs sm:text-sm" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default SettingsModal;