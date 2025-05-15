import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaInbox,
  FaPlus,
  FaUsers,
  FaBell,
  FaClipboardList,
  FaClock,
  FaSitemap,
  FaCheckCircle,
  FaCog,
  FaUber,
  FaDotCircle,
} from "react-icons/fa";
import { MdDoneAll } from "react-icons/md";
import useMessageSocket from "../hook/useMessageSocket"; // ✅ For inbox
import useNotificationSocket from "../hook/useNotificationSocket";
import InvoiceForm from "../pages/InvoiceForm";

const Sidebar = () => {
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [role, setRole] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [inboxCount, setInboxCount] = useState(0);
  const [leaveAlert, setLeaveAlert] = useState(false);

 useEffect(() => {
  const updateLeaveAlert = () => {
    const leaveFlag = localStorage.getItem("showLeaveAlert") === "true";
    console.log("🔁 Detected localStorage change → showLeaveAlert:", leaveFlag);
    setLeaveAlert(leaveFlag);
  };

  // Initial load
  updateLeaveAlert();

  // Listen to localStorage change
  window.addEventListener("storage", updateLeaveAlert);

  return () => window.removeEventListener("storage", updateLeaveAlert);
}, []);


  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);
  const openAddEmployeeModal = () => {
    setIsAddEmployeeModalOpen(true);
  };

  useMessageSocket(setInboxCount); // ✅ Inbox badge real-time

  useNotificationSocket(setNotificationCount);
  // console.log("🔢 Notification count state:", notificationCount);

  return (
    <div className="bg-[#1e1f21] text-white pt-[10vh] h-screen flex flex-col justify-between border-r border-gray-700">
      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {/* Core nav */}
        <SidebarItem icon={<FaHome />} label="Home" to="/" />
        {role === "admin" && (
          <>
            <SidebarItem
              icon={<FaPlus />}
              label="Add User"
              to="/add-employee"
              onClick={openAddEmployeeModal}
            />
            <SidebarItem
              icon={<FaUsers />}
              label="All Users"
              to="/all-employees"
            />
          </>
        )}

        <SidebarItem icon={<FaClipboardList />} label="Tasks" to="/all-tasks" />
        <SidebarItem
          icon={
            <div className="relative">
              <FaInbox />
              {inboxCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 py-0 rounded-full shadow-lg">
                  {inboxCount}
                </span>
              )}
            </div>
          }
          label="Inbox"
          to="/inbox"
        />

        {/* Notification Badge */}
        <SidebarItem
          icon={
            <div className="relative">
              <FaBell />
              {notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 py-0 rounded-full shadow-lg">
                  {notificationCount}
                </span>
              )}
            </div>
          }
          label="Notifications"
          to="/notifications"
        />

        <SidebarItem icon={<FaClock />} label="Reminders" to="/reminders" />

         {! role === "admin" && (<SidebarItem
          icon={
            <div className="relative">
              <FaUber />
              {leaveAlert && (
                <span className="absolute -top-2 -right-2 text-red-500 text-lg leave-alert-animation">
                  <FaDotCircle />
                </span>
              )}
            </div>
          }
          label="Leave"
          to="/leave"
        />)}

        {role === "admin" && (
          <SidebarItem
            icon={
              <div className="relative">
                <FaUber />
                {leaveAlert && (
                  <span className="absolute -top-2 -right-2 text-red-500 text-lg leave-alert-animation">
                    <FaDotCircle />
                  </span>
                )}
              </div>
            }
            label="LeaveManagement"
            to="/leavemanagement"
          />
        )}
        
          <SidebarItem icon={<FaCog />} label="Settings" to="/departments" />
        
        {role === "admin" && (
          <SidebarItem
            icon={<FaCheckCircle />}
            label="Completed Tasks"
            to="/completed"
          />
        )}

        {/* {role === "admin" && (
          <SidebarItem
            icon={<FaCheckCircle />}
            label="Invoice"
            to="/invoice"
          />
        )} */}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-700 text-xs text-gray-400">
        © 2025 Finaxis
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, to, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded transition-colors text-sm ${
        isActive ? "bg-gray-800 text-white" : "hover:bg-[#2b2c2f] text-white"
      }`
    }
  >
    <span className="text-base text-white">{icon}</span>
    <span className="text-white">{label}</span>
  </NavLink>
);

export default Sidebar;
