// Professional Sidebar - Desktop & Mobile Responsive
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
} from "react-icons/fa";
import { io } from "socket.io-client";
import useMessageSocket from "../hook/useMessageSocket";
import useNotificationSocket from "../hook/useNotificationSocket";
import axios from "axios";

const socket = io('https://taskbe.sharda.co.in', {
  query: { token: localStorage.getItem("authToken") },
});

const Sidebar = () => {
  const [role, setRole] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [inboxCount, setInboxCount] = useState(0);
  const [leaveAlert, setLeaveAlert] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);

  const fetchPendingLeaveCount = async () => {
    try {
      const res = await axios.get("https://taskbe.sharda.co.in/api/leave/pending");
      const leaveCount = res.data.length || 0;
      setPendingLeaveCount(leaveCount);
    } catch (err) {
      setPendingLeaveCount(0);
      console.error("Error fetching pending leaves:", err);
    }
  };

  useEffect(() => {
    fetchPendingLeaveCount();
  }, []);

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
    const updateLeaveAlert = () => {
      const leaveAlertFlag = localStorage.getItem("showLeaveAlert");
      setLeaveAlert(leaveAlertFlag === "true");
    };

    updateLeaveAlert();
    const handleStorageChange = (e) => {
      if (e.key === "showLeaveAlert") {
        setLeaveAlert(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("leaveAlertUpdate", updateLeaveAlert);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("leaveAlertUpdate", updateLeaveAlert);
    };
  }, []);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  useMessageSocket(setInboxCount);
  useNotificationSocket(setNotificationCount);

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`
          hidden md:flex
          fixed left-0 top-0 h-screen z-[999]
          bg-gradient-to-b from-blue-50 to-indigo-50 text-gray-800 flex-col
          transition-all duration-300 ease-in-out
          border-r border-indigo-200/50 shadow-xl
          ${expanded ? "w-[220px]" : "w-[70px]"}
        `}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center h-20 mb-4 border-b border-indigo-200/50 animate-fadeIn">
          <NavLink to="/" className="flex items-center justify-content-center px-4">
            {expanded ? (
              <div className="flex items-center gap-3 w-full">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 hover:rotate-3 transition-all duration-300">
                  <span className="text-white font-bold text-xl">ASA</span>
                </div>
                <div className="flex flex-col animate-slideIn">
                  <span className="text-indigo-700 font-bold text-lg leading-tight">Finaxis</span>
                  <span className="text-gray-500 text-xs font-medium">Task Manager</span>
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg hover:scale-110 hover:rotate-3 transition-all duration-300 animate-bounce-slow">
                <span className="text-white font-bold text-xl">ASA</span>
              </div>
            )}
          </NavLink>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 sidebar-scroll">
          <SidebarItem
            icon={<FaHome className="text-xl" />}
            label="Home"
            to="/"
            expanded={expanded}
          />
          
          {role === "admin" && (
            <SidebarItem
              icon={<FaUsers className="text-xl" />}
              label="All Users"
              to="/all-employees"
              expanded={expanded}
            />
          )}
          
          <SidebarItem
            icon={<FaClipboardList className="text-xl" />}
            label="Tasks"
            to="/all-tasks"
            expanded={expanded}
          />
          
          <SidebarItem
            icon={<FaBriefcase className="text-xl" />}
            label="Clients"
            to="/clients"
            expanded={expanded}
          />
          
          <SidebarItem
            icon={
              <div className="relative">
                <FaGolfBall className="text-xl" />
                {leaveAlert && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg" />
                )}
              </div>
            }
            label="Leave"
            to="/leave"
            expanded={expanded}
          />
          
          {role === "admin" && (
            <SidebarItem
              icon={<FaCog className="text-xl" />}
              label="Settings"
              to="/departments"
              expanded={expanded}
              badge={pendingLeaveCount > 0 ? pendingLeaveCount : null}
            />
          )}

          {role === "admin" && (
            <SidebarItem
              icon={<FaCheckCircle className="text-xl" />}
              label="Completed Tasks"
              to="/completed"
              expanded={expanded}
            />
          )}

          {role === "admin" && (
            <SidebarItem
              icon={<FaMoneyBill className="text-xl" />}
              label="Invoicing"
              to="/viewinvoicewithotp"
              expanded={expanded}
            />
          )}

          {role === "admin" && (
            <SidebarItem
              icon={<FaClock className="text-xl" />}
              label="Updates"
              to="/updates"
              expanded={expanded}
            />
          )}
        </div>

        {/* Footer */}
        <div className="h-12 flex items-center justify-center px-3 text-xs text-gray-600 border-t border-indigo-200/50 bg-gradient-to-t from-indigo-100/30">
          {expanded ? "© 2025 Finaxis" : "©"}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[999] bg-white border-t border-gray-200 shadow-lg pb-safe">
        <div className={`grid ${role === "admin" ? "grid-cols-6" : "grid-cols-4"} gap-0 px-1 py-2`}>
          {role === "admin" ? (
            <>
              <MobileNavItem
                icon={<FaUsers className="text-xl" />}
                label="All Users"
                to="/all-employees"
              />
              
              <MobileNavItem
                icon={<FaClipboardList className="text-xl" />}
                label="Tasks"
                to="/all-tasks"
              />
              
              <MobileNavItem
                icon={<FaBriefcase className="text-xl" />}
                label="Clients"
                to="/clients"
              />
              
              <MobileNavItem
                icon={
                  <div className="relative">
                    <FaGolfBall className="text-xl" />
                    {leaveAlert && (
                      <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-lg" />
                    )}
                  </div>
                }
                label="Leave"
                to="/leave"
              />
              
              <MobileNavItem
                icon={<FaCog className="text-xl" />}
                label="Settings"
                to="/departments"
                badge={pendingLeaveCount > 0 ? pendingLeaveCount : null}
              />

              <MobileNavItem
                icon={<FaMoneyBill className="text-xl" />}
                label="Invoices"
                to="/viewinvoicewithotp"
              />
            </>
          ) : (
            <>
              <MobileNavItem
                icon={<FaHome className="text-xl" />}
                label="Home"
                to="/"
              />
              
              <MobileNavItem
                icon={<FaClipboardList className="text-xl" />}
                label="Tasks"
                to="/all-tasks"
              />
              
              <MobileNavItem
                icon={<FaBriefcase className="text-xl" />}
                label="Clients"
                to="/clients"
              />
              
              <MobileNavItem
                icon={
                  <div className="relative">
                    <FaGolfBall className="text-xl" />
                    {leaveAlert && (
                      <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-lg" />
                    )}
                  </div>
                }
                label="Leave"
                to="/leave"
              />
            </>
          )}
        </div>
      </div>

      {/* Custom Scrollbar CSS + Animations */}
      <style jsx>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: rgba(199, 210, 254, 0.2);
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 10px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }

        /* Safe area padding for iOS devices */
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }

        /* Custom Animations */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translate(10px, -50%);
          }
          to {
            opacity: 1;
            transform: translate(0, -50%);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes bounceSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        .animate-bounce-slow {
          animation: bounceSlow 3s ease-in-out infinite;
        }

        .hover\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </>
  );
};

const SidebarItem = ({ icon, label, to, onClick, expanded, badge }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative overflow-hidden
        ${
          isActive
            ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-500/30 scale-105"
            : "text-gray-600 hover:bg-white/60 hover:text-indigo-700 hover:shadow-md hover:scale-102 hover:-translate-y-0.5"
        }`
    }
  >
    {/* Animated background glow */}
    <span className="absolute inset-0 bg-gradient-to-r from-indigo-400/0 via-blue-400/10 to-indigo-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer" />
    
    {/* Icon Container */}
    <span className="relative flex items-center justify-center min-w-[24px] group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 z-10">
      {icon}
      {badge && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg animate-pulse">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </span>

    {/* Label with slide animation */}
    {expanded && (
      <span className="text-sm font-semibold whitespace-nowrap z-10 animate-slideIn">
        {label}
      </span>
    )}

    {/* Active indicator with animation */}
    {expanded && (
      <NavLink to={to}>
        {({ isActive }) =>
          isActive && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full shadow-lg animate-slideInRight" />
          )
        }
      </NavLink>
    )}
  </NavLink>
);

const MobileNavItem = ({ icon, label, to, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center py-2 px-1 transition-all duration-200 relative
        ${
          isActive
            ? "text-indigo-600"
            : "text-gray-500"
        }`
    }
  >
    {/* Icon Container */}
    <div className="relative mb-1">
      <div className={`transition-transform duration-200 ${({ isActive }) => isActive ? 'scale-110' : ''}`}>
        {icon}
      </div>
      {badge && (
        <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center px-0.5 shadow-md">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </div>

    {/* Label */}
    <span className="text-[9px] font-medium text-center leading-tight max-w-full truncate px-0.5">
      {label}
    </span>

    {/* Active indicator */}
    <NavLink to={to}>
      {({ isActive }) =>
        isActive && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 rounded-t-full" />
        )
      }
    </NavLink>
  </NavLink>
);

export default Sidebar;