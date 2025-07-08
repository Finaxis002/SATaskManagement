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
  FaCheckCircle,
  FaCog,
  FaUber,
  FaDotCircle,
  FaBriefcase,
  FaMoneyBill,
  FaDochub,
  FaGolfBall,
  FaWhatsapp
} from "react-icons/fa";
import { io } from "socket.io-client";
import useMessageSocket from "../hook/useMessageSocket"; // ✅ For inbox
import useNotificationSocket from "../hook/useNotificationSocket";
import icon from "/icon.png";


const socket = io("https://taskbe.sharda.co.in", {
  withCredentials: true,
});


const Sidebar = () => {
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [role, setRole] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [inboxCount, setInboxCount] = useState(0);
  const [leaveAlert, setLeaveAlert] = useState(false);

  useEffect(() => {
    const updateLeaveAlert = () => {
      const leaveAlertFlag = localStorage.getItem("showLeaveAlert");
      setLeaveAlert(leaveAlertFlag === "true");
    };

    // Initial load
    updateLeaveAlert();

    // Custom event listener for more reliable updates
    const handleStorageChange = (e) => {
      if (e.key === "showLeaveAlert") {
        setLeaveAlert(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen to custom events if localStorage isn't reliable
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

  const resetLeaveAlert = () => {
    localStorage.setItem("showLeaveAlert", "false");
    setLeaveAlert(false);
  };

  useMessageSocket(setInboxCount); // ✅ Inbox badge real-time

  useNotificationSocket(setNotificationCount);
  // console.log("🔢 Notification count state:", notificationCount);

  return (
    // <div className="bg-[#1e1f21] text-white h-screen flex flex-col justify-between border-r border-gray-700 w-[70px] hover:w-[250px] transition-all duration-300">
    <div className="bg-[#1e1f21] text-white h-screen flex flex-col justify-between border-r border-gray-700 w-[70px] ">
      {/* Logo at the top */}
      <div className="flex justify-center pt-2">
        <NavLink to="/">
          <img
            src="/SALOGO.png"
            alt="Logo"
            className="w-10 h-10 object-contain rounded-4xl z-0"
          />
        </NavLink>
      </div>

      {/* Main Navigation */}
      <div className="flex-1  px-3 py-4 pt-2 ">
        {/* Core nav */}
        <SidebarItem
          icon={<FaHome className="text-xl" />}
          label="Home"
          to="/"
        />
        {role === "admin" && (
          <>
            <SidebarItem
              icon={<FaPlus className="text-xl" />}
              label="Add User"
              to="/add-employee"
            />
            <SidebarItem
              icon={<FaUsers className="text-xl" />}
              label="All Users"
              to="/all-employees"
            />
          </>
        )}

        <SidebarItem
          icon={<FaClipboardList className="text-xl" />}
          label="Tasks"
          to="/all-tasks"
        />
        <SidebarItem
          icon={<FaBriefcase className="text-xl" />}
          label="Clients"
          to="/clients"
        />
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
              <FaBell className="text-xl" />
              {notificationCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 py-0 rounded-full shadow-lg">
                  {notificationCount}
                </span>
              )}
            </div>
          }
          label={<span className="text-sm">Notification</span>}
          to="/notifications"
        />

        <SidebarItem
          icon={<FaClock className="text-xl" />}
          label="Reminders"
          to="/reminders"
        />

        <SidebarItem
          icon={
            <div className="relative">
              <FaGolfBall className="text-xl" />
              {leaveAlert && (
                <span className="absolute -top-2 -right-2 text-red-500 text-lg leave-alert-animation">
                  <FaDotCircle />
                </span>
              )}
            </div>
          }
          label="Leave"
          to="/leave"
        />

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
            label="Leave Management"
            to="/leavemanagement"
            onClick={resetLeaveAlert}
          />
        )}

        {role === "admin" && (
          <SidebarItem
            icon={<FaCog className="text-xl" />}
            label="Settings"
            to="/departments"
          />
        )}

        {role === "admin" && (
          <SidebarItem
            icon={<FaCheckCircle className="text-xl" />}
            label="Completed Tasks"
            to="/completed"
          />
        )}

        {role === "admin" && (
          <SidebarItem
            icon={<FaMoneyBill className="text-xl" />}
            label="Invoice"
            to="/invoice"
          />
        )}

        {/* {role === "admin" && (
          <SidebarItem
            icon={<FaDochub className="text-xl" />}
            label="View Invoice"
            to="/viewinvoices"
          />
        )} */}
        {role === "admin" && (
          <SidebarItem
            icon={<FaDochub className="text-xl" />}
            label="View Invoice"
            to="/viewinvoicewithotp"
          />
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-700 text-xs text-gray-400">
        © 2025 Finaxis
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, to, onClick }) => (
  // <NavLink
  //   to={to}
  //   onClick={onClick}
  //   className={({ isActive }) =>
  //     `flex items-center gap-3 px-3 py-2 rounded transition-colors text-sm ${
  //       isActive ? "bg-gray-800 text-white" : "hover:bg-[#2b2c2f] text-white"
  //     }`
  //   }
  // >
  //   <span className="text-base text-white">{icon}</span>
  //   <span className="text-white">{label}</span>
  // </NavLink>

  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded transition-all duration-300 text-sm relative ${
        isActive
          ? "bg-gray-800 text-white"
          : "hover:bg-[#2b2c2f] text-white group"
      }`
    }
  >
    <span className="text-base">{icon}</span>
    {/* Tooltip that appears on hover */}
    <span className="absolute left-full top-0 transform -translate-x-1/2 ml-10 px-2 py-1 bg-blue-500 text-white text-sm rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[9999] pointer-events-none">
      <span className="whitespace-normal break-words max-w-[150px]  text-ellipsis">
        {label}
      </span>
      {/* Tooltip arrow */}
      <div className="absolute left-0 top-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-0 border-t-4 border-l-transparent border-r-transparent border-t-blue-500 "></div>
    </span>
  </NavLink>
);

export default Sidebar;