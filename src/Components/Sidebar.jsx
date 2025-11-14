// Professional Sidebar - Cleaned Version (Minimal Animations)
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
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  useMessageSocket(setInboxCount);
  useNotificationSocket(setNotificationCount);

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex fixed left-0 top-0 h-screen z-[999]
        bg-gradient-to-b from-blue-50 to-indigo-50 text-gray-800 flex-col
        transition-all duration-200 border-r border-indigo-200/50 shadow-lg
        ${expanded ? "w-[220px]" : "w-[70px]"}`}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-center h-20 mb-4 border-b border-indigo-200/50">
          <NavLink to="/" className="flex items-center justify-center px-4">
            {expanded ? (
              <div className="flex items-center gap-3 w-full">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-xl">ASA</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-indigo-700 font-bold text-lg leading-tight">Finaxis</span>
                  <span className="text-gray-500 text-xs font-medium">Task Manager</span>
                </div>
              </div>
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">ASA</span>
              </div>
            )}
          </NavLink>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 sidebar-scroll">
          <SidebarItem icon={<FaHome />} label="Home" to="/" expanded={expanded} />

          {role === "admin" && (
            <SidebarItem icon={<FaUsers />} label="All Users" to="/all-employees" expanded={expanded} />
          )}

          <SidebarItem icon={<FaClipboardList />} label="Tasks" to="/all-tasks" expanded={expanded} />

          <SidebarItem icon={<FaBriefcase />} label="Clients" to="/clients" expanded={expanded} />

          <SidebarItem
            icon={
              <div className="relative">
                <FaGolfBall />
                {leaveAlert && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
              </div>
            }
            label="Leave"
            to="/leave"
            expanded={expanded}
          />

          {role === "admin" && (
            <SidebarItem
              icon={<FaCog />}
              label="Settings"
              to="/departments"
              expanded={expanded}
              badge={pendingLeaveCount > 0 ? pendingLeaveCount : null}
            />
          )}

          {role === "admin" && (
            <SidebarItem icon={<FaCheckCircle />} label="Completed Tasks" to="/completed" expanded={expanded} />
          )}

          {role === "admin" && (
            <SidebarItem icon={<FaMoneyBill />} label="Invoicing" to="/viewinvoicewithotp" expanded={expanded} />
          )}

          {role === "admin" && (
            <SidebarItem icon={<FaClock />} label="Updates" to="/updates" expanded={expanded} />
          )}
        </div>

        {/* Footer */}
        <div className="h-12 flex items-center justify-center px-3 text-xs text-gray-600 border-t border-indigo-200/50 bg-indigo-100/20">
          {expanded ? "© 2025 Finaxis" : "©"}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[999] bg-white border-t border-gray-200 shadow-lg pb-safe">
        <div className={`grid ${role === "admin" ? "grid-cols-6" : "grid-cols-4"} gap-0 px-1 py-2`}>
          {role === "admin" ? (
            <>
              <MobileNavItem icon={<FaUsers />} label="All Users" to="/all-employees" />
              <MobileNavItem icon={<FaClipboardList />} label="Tasks" to="/all-tasks" />
              <MobileNavItem icon={<FaBriefcase />} label="Clients" to="/clients" />
              <MobileNavItem icon={<FaGolfBall />} label="Leave" to="/leave" />
              <MobileNavItem icon={<FaCog />} label="Settings" to="/departments" badge={pendingLeaveCount} />
              <MobileNavItem icon={<FaMoneyBill />} label="Invoices" to="/viewinvoicewithotp" />
            </>
          ) : (
            <>
              <MobileNavItem icon={<FaHome />} label="Home" to="/" />
              <MobileNavItem icon={<FaClipboardList />} label="Tasks" to="/all-tasks" />
              <MobileNavItem icon={<FaBriefcase />} label="Clients" to="/clients" />
              <MobileNavItem icon={<FaGolfBall />} label="Leave" to="/leave" />
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 10px;
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  );
};

const SidebarItem = ({ icon, label, to, expanded, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
        ${
          isActive
            ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md"
            : "text-gray-600 hover:bg-white/70 hover:text-indigo-700"
        }`
    }
  >
    <span className="relative flex items-center justify-center min-w-[24px] text-lg">
      {icon}
      {badge && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-md">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </span>
    {expanded && <span className="text-sm font-semibold">{label}</span>}
  </NavLink>
);

const MobileNavItem = ({ icon, label, to, badge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center py-2 px-1 transition-all duration-150
        ${isActive ? "text-indigo-600" : "text-gray-500"}`
    }
  >
    <div className="relative mb-1 text-lg">{icon}</div>
    <span className="text-[9px] font-medium text-center leading-tight">{label}</span>
    {badge && (
      <span className="absolute top-1 right-3 min-w-[14px] h-[14px] bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
        {badge > 9 ? "9+" : badge}
      </span>
    )}
  </NavLink>
);

export default Sidebar;
