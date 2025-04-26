import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaTasks,
  FaInbox,
  FaChartBar,
  FaProjectDiagram,
  FaBullseye,
  FaChevronDown,
  FaPlus,
  FaUsers,
  FaBell,
  FaClipboardList,
  FaClock,
} from "react-icons/fa";
import useSocketSetup from "../hook/useSocketSetup"; // ✅ For tasks
import useMessageSocket from "../hook/useMessageSocket"; // ✅ For inbox

import axios from "axios"; // ✅ Use default import

import { useSelector, useDispatch } from "react-redux";

const Sidebar = () => {
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [role, setRole] = useState("");
  const [notificationCount, setNotificationCount] = useState(0);
  const [inboxCount, setInboxCount] = useState(0);
  const [name, setName] = useState("");

  useMessageSocket(setInboxCount); // ✅ Inbox badge
  useSocketSetup(setNotificationCount); // ✅ Task notification badge

  useEffect(() => {
    const storedName = localStorage.getItem("name") || "default";
    const storedRole = localStorage.getItem("role") || "user";
    setName(storedName);
    setRole(storedRole);
  }, []);

  const openAddEmployeeModal = () => {
    setIsAddEmployeeModalOpen(true);
  };


  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const dispatch = useDispatch();

 

  useEffect(() => {
    const fetchInboxCount = async () => {
      const name = localStorage.getItem("name") || "default";
      const role = localStorage.getItem("role") || "user";

      try {
        const res = await axios.get("https://sataskmanagementbackend.onrender.com/api/unread-count", {
          params: { name, role },
        });
        const count = res.data.unreadCount;
        console.log("📥 Unread inbox count:", count); // ✅ LOG COUNT HERE
        setInboxCount(count);
      } catch (error) {
        console.error("❌ Failed to fetch inbox count:", error.message);
      }
    };

    if (name && role) {
      fetchInboxCount();
    }
  }, [name, role]);

  return (
    <div className="bg-[#1F2124] text-white w-64 h-screen flex flex-col justify-between border-r border-gray-800 shadow-xl transition-all ease-in-out duration-300">
      {/* Top Bar */}
      <div className="p-6 border-b border-gray-800">
        <input
          type="text"
          placeholder="Search"
          className="w-full px-4 py-3 text-sm rounded-lg bg-[#2D2F36] placeholder-gray-400 text-white focus:outline-none transition-all duration-300 ease-in-out hover:ring-2 hover:ring-yellow-500 focus:ring-yellow-500"
        />
      </div>

      {/* Main Navigation */}

      <div className="flex-1 overflow-y-auto px-3 py-6">
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

              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                  {unreadCount}
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
