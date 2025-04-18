// src/components/Sidebar.jsx
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
} from "react-icons/fa";

import { useSelector, useDispatch } from "react-redux";

const Sidebar = () => {
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [role, setRole] = useState("");
  
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  const openAddEmployeeModal = () => {
    setIsAddEmployeeModalOpen(true);
  };

  const closeAddEmployeeModal = () => {
    setIsAddEmployeeModalOpen(false);
  };
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const dispatch = useDispatch();

  const handleNotificationClick = () => {
    dispatch(markAllAsRead()); // Mark all notifications as read when clicked
  };
  return (
    <div className="bg-[#1e1f21] text-white w-64 h-screen flex flex-col justify-between border-r border-gray-700">
      {/* Top Bar */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="bg-gray-500 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
            Fi
          </div>
          <button className="bg-yellow-600 text-white text-sm px-3 py-1 rounded hover:bg-yellow-700">
            <FaPlus className="inline mr-2" />
            Create
          </button>
        </div>
        <input
          type="text"
          placeholder="Search"
          className="w-full px-3 py-2 text-sm rounded bg-[#2b2c2f] placeholder-gray-400 text-white focus:outline-none"
        />
      </div>

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

        <SidebarItem icon={<FaClipboardList />} label="Tasks" to="/Tasks" />
        {/* <SidebarItem
          icon={
            <div className="relative">
              <FaInbox />
              {inboxCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                  {inboxCount}
                </span>
              )}
            </div>
          }
          label="Inbox"
          to="/inbox"
        /> */}

<SidebarItem
      icon={
        <div className="relative">
          <FaBell />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
      }
      label="Notifications"
      to="/notifications"
      onClick={handleNotificationClick}
    />
        <SidebarItem icon={<FaClock />} label="Reminders" to="/reminders" />

        {/* Insights */}
        {/* <div className="mt-6">
          <p className="text-xs text-gray-400 uppercase px-2 mb-2">Insights</p>
          <SidebarItem
            icon={<FaChartBar />}
            label="Reporting"
            to="/reporting"
          />
         
          <SidebarItem icon={<FaBullseye />} label="Goals" to="/goals" />
        </div> */}
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
