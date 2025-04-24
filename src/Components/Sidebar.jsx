import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaInbox,
  FaPlus,
  FaUsers,
  FaBell,
  FaClipboardList,
} from "react-icons/fa";
import useSocketSetup from "../hook/useSocketSetup"; // ✅ For tasks
import useMessageSocket from "../hook/useMessageSocket"; // ✅ For inbox
import useNotificationSocket from "../hook/useNotificationSocket";

import { io } from "socket.io-client";
const socket = io("https://sataskmanagementbackend.onrender.com"); // Or your backend URL

const Sidebar = () => {
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [role, setRole] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [inboxCount, setInboxCount] = useState(0);
  const userEmail = localStorage.getItem("userId");
  // Real-time updates for inbox messages via socket
  useMessageSocket(setInboxCount); // ✅ Inbox badge real-time

  useNotificationSocket(setNotificationCount);

  return (
    <div className="bg-[#1F2124] text-white w-45 h-screen flex flex-col justify-between border-r border-gray-800 shadow-xl transition-all ease-in-out duration-300">
      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-6 mt-8">
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
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-800 text-xs text-gray-400 flex justify-center">
        <span className="text-center">© 2025 Finaxis</span>
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
