import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaClipboardList,
  FaBriefcase,
  FaCog,
  FaCheckCircle,
  FaClock,
  FaMoneyBill,
  FaGolfBall,
  FaUserTie,
  FaRegEnvelopeOpen,
} from "react-icons/fa";
import { io } from "socket.io-client";
import useMessageSocket from "../hook/useMessageSocket";
import useNotificationSocket from "../hook/useNotificationSocket";
import axios from "axios";

const socket = io("https://taskbe.sharda.co.in", {
  query: { token: localStorage.getItem("authToken") },
});

const Sidebar = ({ isOpen, onClose }) => {
  const storedRole = localStorage.getItem("role") || "";
  const storedDepartment = localStorage.getItem("department") || "";

  const [role, setRole] = useState(storedRole);
  const [department, setDepartment] = useState(storedDepartment.toLowerCase());
  const [isLoadingDept, setIsLoadingDept] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [inboxCount, setInboxCount] = useState(0);
  const [leaveAlert, setLeaveAlert] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [allowedMenuItems, setAllowedMenuItems] = useState([]);
  const [permissionVersion, setPermissionVersion] = useState(0);

  // Permission mapping - NO adminOnly restrictions
  const menuItemConfig = {
    home: { to: "/", icon: <FaHome />, label: "Home" },
    allUsers: { to: "/all-employees", icon: <FaUsers />, label: "All Users" },
    tasks: { to: "/all-tasks", icon: <FaClipboardList />, label: "Tasks" },
    agent: { to: "/agent", icon: <FaUserTie />, label: "Agent" },
    supportRequests: {
      to: "/developer-support",
      icon: <FaRegEnvelopeOpen />,
      label: "Support Requests",
    },
    clients: { to: "/clients", icon: <FaBriefcase />, label: "Clients" },
    leave: { to: "/leave", icon: <FaGolfBall />, label: "Leave" },
    settings: {
      to: "/departments",
      icon: <FaCog />,
      label: "Settings",
      badge: true,
    },
    completedTasks: {
      to: "/completed",
      icon: <FaCheckCircle />,
      label: "Completed Tasks",
    },
    invoicing: {
      to: "/viewinvoicewithotp",
      icon: <FaMoneyBill />,
      label: "Invoicing",
    },
    updates: { to: "/updates", icon: <FaClock />, label: "Updates" },
  };

  // Default fallback permissions
  const defaultFallbackPermissions = {
    marketing: ["home", "tasks", "agent", "clients", "leave"],
    operations: ["home", "tasks", "agent", "clients", "leave"],
    "it/software": [
      "home",
      "tasks",
      "agent",
      "supportRequests",
      "clients",
      "leave",
      "updates",
    ],
    seo: ["home", "tasks", "agent", "clients", "leave"],
    "human resource": ["home", "tasks", "agent", "clients", "leave"],
    finance: ["home", "tasks", "agent", "clients", "leave"],
    administration: ["home", "tasks", "agent", "clients", "leave"],
    sales: ["home", "tasks", "agent", "clients", "leave", "invoicing"],
  };

  // Helper function to normalize department names
  const normalizeDepartment = (dept) => {
    if (!dept) return "";
    return dept.toLowerCase().trim().replace(/\s+/g, " ");
  };

  // Function to load permissions from backend
  const loadPermissions = async () => {
    // Admin gets everything
    if (role === "admin") {
      setAllowedMenuItems(Object.keys(menuItemConfig));
      return;
    }

    // Check if department exists
    if (!department || department === "null" || department === "undefined") {
      setAllowedMenuItems(["home", "tasks", "leave"]);
      return;
    }

    try {
      // Try to fetch from backend

      const response = await axios.get(
        "https://taskbe.sharda.co.in/api/permissions"
      );
      const permissions = response.data;

      // Cache in localStorage for offline access
      localStorage.setItem(
        "departmentPermissions",
        JSON.stringify(permissions)
      );

      // Try exact match first
      let deptPermissions = permissions[department];

      // If not found, try normalized match
      if (!deptPermissions) {
        const normalizedDept = normalizeDepartment(department);
        const matchingKey = Object.keys(permissions).find(
          (key) => normalizeDepartment(key) === normalizedDept
        );

        if (matchingKey) {
          deptPermissions = permissions[matchingKey];
        }
      }

      if (
        deptPermissions &&
        Array.isArray(deptPermissions) &&
        deptPermissions.length > 0
      ) {
        setAllowedMenuItems(deptPermissions);
      } else {
        const fallback = defaultFallbackPermissions[department] ||
          defaultFallbackPermissions[normalizeDepartment(department)] || [
            "home",
            "tasks",
            "leave",
          ];

        setAllowedMenuItems(fallback);
      }
    } catch (error) {
      // Fallback to localStorage cache

      const savedPermissions = localStorage.getItem("departmentPermissions");

      if (savedPermissions) {
        try {
          const permissions = JSON.parse(savedPermissions);

          const normalizedDept = normalizeDepartment(department);
          const deptPermissions =
            permissions[department] ||
            permissions[
              Object.keys(permissions).find(
                (key) => normalizeDepartment(key) === normalizedDept
              )
            ];

          if (
            deptPermissions &&
            Array.isArray(deptPermissions) &&
            deptPermissions.length > 0
          ) {
            setAllowedMenuItems(deptPermissions);
            return;
          }
        } catch (parseError) {}
      }

      // Final fallback to defaults

      const fallback = defaultFallbackPermissions[department] ||
        defaultFallbackPermissions[normalizeDepartment(department)] || [
          "home",
          "tasks",
          "leave",
        ];
      setAllowedMenuItems(fallback);
    }
  };

  const fetchPendingLeaveCount = async () => {
    try {
      const res = await axios.get(
        "https://taskbe.sharda.co.in/api/leave/pending"
      );
      const leaveCount = res.data.length || 0;
      setPendingLeaveCount(leaveCount);
    } catch {
      setPendingLeaveCount(0);
    }
  };

  useEffect(() => {
    fetchPendingLeaveCount();
    socket.on("new-leave", fetchPendingLeaveCount);
    socket.on("leave-status-updated", fetchPendingLeaveCount);
    return () => {
      socket.off("new-leave", fetchPendingLeaveCount);
      socket.off("leave-status-updated", fetchPendingLeaveCount);
    };
  }, []);

  useEffect(() => {
    const initializeSidebar = async () => {
      const currentRole = localStorage.getItem("role");
      const currentDepartment = localStorage.getItem("department");
      const storedEmail = localStorage.getItem("email");

      if (currentRole) {
        setRole(currentRole);
      }

      if (
        currentDepartment &&
        currentDepartment !== "null" &&
        currentDepartment !== "undefined"
      ) {
        const normalizedDept = normalizeDepartment(currentDepartment);

        setDepartment(normalizedDept);
      } else if (currentRole === "user" && storedEmail) {
        setIsLoadingDept(true);
        await fetchUserDepartment();
      } else {
      }
    };

    initializeSidebar();
  }, []);

  // Listen for socket events for real-time permission updates
  useEffect(() => {
    socket.on("permissions-updated", (newPermissions) => {
      localStorage.setItem(
        "departmentPermissions",
        JSON.stringify(newPermissions)
      );
      setPermissionVersion((prev) => prev + 1); // Trigger reload
    });

    return () => {
      socket.off("permissions-updated");
    };
  }, []);

  // Poll for permission changes every 10 seconds (backup to socket)
  useEffect(() => {
    if (role === "admin") {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(
          "https://taskbe.sharda.co.in/api/permissions"
        );
        const newPermissions = response.data;

        const oldPerms = localStorage.getItem("departmentPermissions");
        const newPermsString = JSON.stringify(newPermissions);

        if (oldPerms !== newPermsString) {
          localStorage.setItem("departmentPermissions", newPermsString);
          setPermissionVersion((prev) => prev + 1);
        }
      } catch (error) {
        // Silent fail - socket will handle it
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [role]);

  // Load permissions when role, department, or permissionVersion changes
  useEffect(() => {
    if (role && department) {
      loadPermissions();
    } else {
    }
  }, [role, department, permissionVersion]);

  const fetchUserDepartment = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const userEmail = localStorage.getItem("email");

      if (!userEmail) {
        setIsLoadingDept(false);
        return;
      }

      const res = await axios.get("https://taskbe.sharda.co.in/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const currentUser = res.data.find((emp) => emp.email === userEmail);

      if (currentUser) {
        let userDept = "";

        if (Array.isArray(currentUser.department)) {
          const salesDept = currentUser.department.find(
            (d) =>
              d &&
              (normalizeDepartment(d) === "sales" ||
                normalizeDepartment(d) === "selles")
          );
          userDept = salesDept
            ? "sales"
            : normalizeDepartment(currentUser.department[0] || "");
        } else {
          userDept = normalizeDepartment(currentUser.department || "");
        }

        setDepartment(userDept);
        localStorage.setItem("department", userDept);
      } else {
        setDepartment("");
      }
    } catch (err) {
      setDepartment("");
    } finally {
      setIsLoadingDept(false);
    }
  };

  useMessageSocket(setInboxCount);
  useNotificationSocket(setNotificationCount);

  // Helper function to check if menu item should be shown
  const shouldShowMenuItem = (menuKey) => {
    // Admin gets everything
    if (role === "admin") {
      return true;
    }

    // Check if user has permission
    const hasPermission = allowedMenuItems.includes(menuKey);

    if (!hasPermission) {
    }

    return hasPermission;
  };

  // Debug effect to log allowed items
  useEffect(() => {
    if (allowedMenuItems.length > 0) {
    }
  }, [allowedMenuItems, role, department]);

  if (isLoadingDept) {
    return (
      <div className="hidden md:flex fixed left-0 top-0 h-screen z-[999] w-[70px] bg-gradient-to-b from-purple-50 to-indigo-50 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex fixed left-0 top-0 h-screen z-[999]
        bg-gradient-to-b from-purple-50 to-indigo-50 text-gray-800 flex-col
        transition-all duration-200 border-r shadow-lg
        ${expanded ? "w-[220px]" : "w-[70px]"}`}
        style={{ borderRightColor: "#e0dcf9" }}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Logo Section */}
        <div
          className="flex items-center justify-center h-16 border-b flex-shrink-0"
          style={{ borderBottomColor: "#e0dcf9" }}
        >
          <NavLink to="/" className="flex items-center justify-center px-4">
            {expanded ? (
              <div className="flex items-center gap-3 w-full">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                  style={{ background: "#4332d2" }}
                >
                  <span className="text-white font-bold text-lg">ASA</span>
                </div>
                <div className="flex flex-col">
                  <span
                    className="font-bold text-base leading-tight"
                    style={{ color: "#4332d2" }}
                  >
                    Task Management
                  </span>
                </div>
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                style={{ background: "#4332d2" }}
              >
                <span className="text-white font-bold text-lg">ASA</span>
              </div>
            )}
          </NavLink>
        </div>

        {/* Desktop Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 sidebar-scroll">
          {Object.entries(menuItemConfig).map(([key, config]) => {
            if (!shouldShowMenuItem(key)) return null;

            const icon =
              key === "leave" && leaveAlert ? (
                <div className="relative">
                  {config.icon}
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </div>
              ) : (
                config.icon
              );

            return (
              <SidebarItem
                key={key}
                icon={icon}
                label={config.label}
                to={config.to}
                expanded={expanded}
              />
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="h-10 flex items-center justify-center px-3 text-xs text-gray-600 border-t flex-shrink-0"
          style={{
            borderTopColor: "#e0dcf9",
            backgroundColor: "rgba(224, 220, 249, 0.2)",
          }}
        >
          {expanded
            ? `© ${new Date().getFullYear()} Finaxis`
            : `© ${new Date().getFullYear()}`}
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[999]"
          onClick={onClose}
        ></div>
      )}

      <div
        className={`md:hidden fixed left-0 top-0 h-screen z-[1000] bg-gradient-to-b from-purple-50 to-indigo-50 text-gray-800 flex flex-col transition-transform duration-300 border-r shadow-2xl w-[280px]
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ borderRightColor: "#e0dcf9" }}
      >
        {/* Mobile Logo Section */}
        <div
          className="flex items-center justify-center h-20 border-b flex-shrink-0"
          style={{ borderBottomColor: "#e0dcf9" }}
        >
          <NavLink
            to="/"
            className="flex items-center justify-center px-4"
            onClick={onClose}
          >
            <div className="flex items-center gap-3 w-full">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                style={{ background: "#4332d2" }}
              >
                <span className="text-white font-bold text-xl">ASA</span>
              </div>
              <div className="flex flex-col">
                <span
                  className="font-bold text-lg leading-tight"
                  style={{ color: "#4332d2" }}
                >
                  Task Management
                </span>
              </div>
            </div>
          </NavLink>
        </div>

        {/* Mobile Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 sidebar-scroll">
          {Object.entries(menuItemConfig).map(([key, config]) => {
            if (!shouldShowMenuItem(key)) return null;

            const badge =
              config.badge && key === "settings" ? pendingLeaveCount : null;

            return (
              <MobileSidebarItem
                key={key}
                icon={config.icon}
                label={config.label}
                to={config.to}
                onClick={onClose}
                badge={badge}
              />
            );
          })}
        </div>

        {/* Footer */}
        <div
          className="h-12 flex items-center justify-center px-4 text-sm text-gray-600 border-t flex-shrink-0"
          style={{
            borderTopColor: "#e0dcf9",
            backgroundColor: "rgba(224, 220, 249, 0.2)",
          }}
        >
          © {new Date().getFullYear()} Finaxis
        </div>
      </div>

      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(67, 50, 210, 0.3);
          border-radius: 10px;
        }
      `}</style>
    </>
  );
};

// Helper Components
const SidebarItem = ({ icon, label, to, expanded, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
        ${
          isActive ? "text-white shadow-md" : "text-gray-600 hover:bg-white/70"
        }`
    }
    style={({ isActive }) => ({
      background: isActive ? "#4332d2" : "transparent",
      color: isActive ? "#ffffff" : undefined,
    })}
  >
    <span className="relative flex items-center justify-center min-w-[24px] text-lg">
      {icon}
      {badge && badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-md">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </span>
    {expanded && <span className="text-sm font-semibold">{label}</span>}
  </NavLink>
);

const MobileSidebarItem = ({ icon, label, to, onClick, badge }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200
        ${
          isActive ? "text-white shadow-md" : "text-gray-600 hover:bg-white/70"
        }`
    }
    style={({ isActive }) => ({
      background: isActive ? "#4332d2" : "transparent",
      color: isActive ? "#ffffff" : undefined,
    })}
  >
    <span className="relative flex items-center justify-center min-w-[24px] text-xl">
      {icon}
      {badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-md">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </span>
    <span className="text-base font-semibold">{label}</span>
  </NavLink>
);

export default Sidebar;
