import React from 'react';
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  FaUsersCog,
} from "react-icons/fa";
import { io } from "socket.io-client";
import useMessageSocket from "../hook/useMessageSocket";
import useNotificationSocket from "../hook/useNotificationSocket";
import axios from "axios";

// Socket ko component ke bahar initialize karein
let socket = null;
const getSocket = () => {
  if (!socket) {
    socket = io("https://taskbe.sharda.co.in", {
      query: { token: localStorage.getItem("authToken") },
    });
  }
  return socket;
};

const Sidebar = ({ isOpen, onClose }) => {
  const [role, setRole] = useState(() => localStorage.getItem("role") || "");
  const [department, setDepartment] = useState(() => 
    (localStorage.getItem("department") || "").toLowerCase()
  );
  const [isLoadingDept, setIsLoadingDept] = useState(false);
  
  const [, setNotificationCount] = useState(0);
  const [, setInboxCount] = useState(0);

  const [leaveAlert] = useState(false);
  
  const [expanded, setExpanded] = useState(false);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [allowedMenuItems, setAllowedMenuItems] = useState([]);
  
  const permissionsLoadedRef = useRef(false);
  const socketInitializedRef = useRef(false);

  const menuItemConfig = useMemo(() => ({
    home: { to: "/", icon: <FaHome />, label: "Home" },
    allUsers: { to: "/all-employees", icon: <FaUsers />, label: "All Users" },
    teamStatus: { to: "/team-status", icon: <FaUsersCog />, label: "IT Department" },
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
  }), []);

  const defaultFallbackPermissions = useMemo(() => ({
    marketing: ["home", "tasks", "agent", "clients", "leave"],
    operations: ["home", "tasks", "agent", "clients", "leave"],
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
    seo: ["home", "tasks", "agent", "clients", "leave"],
    // ✅ HR ko "settings" access diya — wahan sirf Leave Management tab dikhega
    "human resource": ["home", "tasks", "agent", "clients", "leave", "settings"],
    finance: ["home", "tasks", "agent", "clients", "leave"],
    administration: ["home", "tasks", "agent", "clients", "leave"],
    sales: ["home", "tasks", "agent", "clients", "leave", "invoicing"],
  }), []);

  const normalizeDepartment = useCallback((dept) => {
    if (!dept) return "";
    return dept.toLowerCase().trim().replace(/\s+/g, " ");
  }, []);

  const loadPermissions = useCallback(async () => {
    if (permissionsLoadedRef.current) return;
    
    if (role === "admin") {
      setAllowedMenuItems(Object.keys(menuItemConfig));
      permissionsLoadedRef.current = true;
      return;
    }

    if (!department || department === "null" || department === "undefined") {
      setAllowedMenuItems(["home", "tasks", "leave"]);
      permissionsLoadedRef.current = true;
      return;
    }

    try {
      const response = await axios.get(
        "https://taskbe.sharda.co.in/api/permissions"
      );
      const permissions = response.data;

      localStorage.setItem(
        "departmentPermissions",
        JSON.stringify(permissions)
      );

      let deptPermissions = permissions[department];

      if (!deptPermissions) {
        const normalizedDept = normalizeDepartment(department);
        const matchingKey = Object.keys(permissions).find(
          (key) => normalizeDepartment(key) === normalizedDept
        );

        if (matchingKey) {
          deptPermissions = permissions[matchingKey];
        }
      }

      // ✅ HR ke liye "settings" force add karo — chahe backend mein ho ya na ho
      const normalizedDeptCheck = normalizeDepartment(department);
      if (
        deptPermissions &&
        Array.isArray(deptPermissions) &&
        normalizedDeptCheck === "human resource" &&
        !deptPermissions.includes("settings")
      ) {
        deptPermissions = [...deptPermissions, "settings"];
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
    } catch {
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
            permissionsLoadedRef.current = true;
            return;
          }
        } catch {
          // Fallback to default if parsing fails
        }
      }

      const fallback = defaultFallbackPermissions[department] ||
        defaultFallbackPermissions[normalizeDepartment(department)] || [
          "home",
          "tasks",
          "leave",
        ];
      setAllowedMenuItems(fallback);
    }
    
    permissionsLoadedRef.current = true;
  }, [role, department, menuItemConfig, defaultFallbackPermissions, normalizeDepartment]);

  const fetchPendingLeaveCount = useCallback(async () => {
    try {
      const res = await axios.get(
        "https://taskbe.sharda.co.in/api/leave/pending"
      );
      const leaveCount = res.data.length || 0;
      setPendingLeaveCount(leaveCount);
    } catch {
      setPendingLeaveCount(0);
    }
  }, []);

  const fetchUserDepartment = useCallback(async () => {
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
      }
    } catch {
      setDepartment("");
    } finally {
      setIsLoadingDept(false);
    }
  }, [normalizeDepartment]);

  useEffect(() => {
    const initializeSidebar = async () => {
      const currentRole = localStorage.getItem("role");
      const currentDepartment = localStorage.getItem("department");
      const storedEmail = localStorage.getItem("email");

      if (currentRole && currentRole !== role) {
        setRole(currentRole);
      }

      if (
        currentDepartment &&
        currentDepartment !== "null" &&
        currentDepartment !== "undefined"
      ) {
        const normalizedDept = normalizeDepartment(currentDepartment);
        if (normalizedDept !== department) {
          setDepartment(normalizedDept);
        }
      } else if (currentRole === "user" && storedEmail) {
        setIsLoadingDept(true);
        await fetchUserDepartment();
      }
    };

    initializeSidebar();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if (role && (department || role === "admin") && !permissionsLoadedRef.current) {
      loadPermissions();
    }
  }, [role, department, loadPermissions]);

  useEffect(() => {
    if (socketInitializedRef.current) return;
    
    const socketInstance = getSocket();
    
    fetchPendingLeaveCount();
    socketInstance.on("new-leave", fetchPendingLeaveCount);
    socketInstance.on("leave-status-updated", fetchPendingLeaveCount);

    socketInstance.on("permissions-updated", (newPermissions) => {
      localStorage.setItem(
        "departmentPermissions",
        JSON.stringify(newPermissions)
      );
      permissionsLoadedRef.current = false;
      loadPermissions();
    });

    socketInitializedRef.current = true;

    return () => {
      socketInstance.off("new-leave", fetchPendingLeaveCount);
      socketInstance.off("leave-status-updated", fetchPendingLeaveCount);
      socketInstance.off("permissions-updated");
    };
  }, [fetchPendingLeaveCount, loadPermissions]);

  useEffect(() => {
    if (role === "admin") return;

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
          permissionsLoadedRef.current = false;
          loadPermissions();
        }
      } catch {
        // Silent fail
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [role, loadPermissions]);

  useMessageSocket(setInboxCount);
  useNotificationSocket(setNotificationCount);

  const shouldShowMenuItem = useCallback((menuKey) => {
    if (role === "admin") return true;
    return allowedMenuItems.includes(menuKey);
  }, [role, allowedMenuItems]);

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
                <div className="relative flex items-center justify-center">
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

const SidebarItem = React.memo(({ icon, label, to, expanded, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-200
        ${
          isActive ? "text-white shadow-md" : "text-gray-600 hover:bg-white/70"
        }`
    }
    style={({ isActive }) => ({
      background: isActive ? "#4332d2" : "transparent",
      color: isActive ? "#ffffff" : undefined,
    })}
  >
    <span className="relative flex items-center justify-center min-w-[24px] text-lg flex-shrink-0">
      {icon}
      {badge && badge > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-md">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </span>
    <span className={`text-sm font-semibold whitespace-nowrap transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>
      {label}
    </span>
  </NavLink>
));

const MobileSidebarItem = React.memo(({ icon, label, to, onClick, badge }) => (
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
));

export default Sidebar;