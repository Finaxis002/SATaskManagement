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
  FaMailBulk,
  FaEnvelope,
  FaDrupal,
  FaBusinessTime,
} from "react-icons/fa";
import { io } from "socket.io-client";
import useMessageSocket from "../hook/useMessageSocket"; // ✅ For inbox
import useNotificationSocket from "../hook/useNotificationSocket";
import icon from "/icon.png";
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
    console.log("Leave response:", res.data); // Log the data received from the API
    const leaveCount = res.data.length || 0;
    setPendingLeaveCount(leaveCount);
    console.log("pending leave count:", leaveCount); // Log the count
  } catch (err) {
    setPendingLeaveCount(0);
    console.error("Error fetching pending leaves:", err);
  }
};

useEffect(() => {
  console.log("useEffect triggered to fetch pending leave count");
  fetchPendingLeaveCount();
}, []);



  useEffect(() => {
    fetchPendingLeaveCount();

    // Listen for new leaves via socket (optional, for real-time update)
    socket.on("new-leave", fetchPendingLeaveCount);
    socket.on("leave-status-updated", fetchPendingLeaveCount); // Optional, handle approve/reject too

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

  useMessageSocket(setInboxCount); // ✅ Inbox badge real-time

  useNotificationSocket(setNotificationCount);
  
  // In your Task Management sidebar component
const openInvoiceTab = () => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    Swal.fire('Error', 'Please login first', 'error');
    return;
  }

  const isLocal = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1';
  
  const invoiceUrl = isLocal 
    ? 'http://localhost:5174'
    : 'https://invoicing.sharda.co.in';
  
  const newWindow = window.open(invoiceUrl, '_blank');
  
  if (newWindow) {
    // Listen for acknowledgment from the invoicing app
    const handleAcknowledgment = (event) => {
      if (event.data.type === 'tokenReceived' && event.data.status === 'success') {
        console.log('Token successfully received by invoicing app');
        window.removeEventListener('message', handleAcknowledgment);
      }
    };
    
    window.addEventListener('message', handleAcknowledgment);
    
    // Send token via postMessage
    let attempts = 0;
    const maxAttempts = 15; // Try for 7.5 seconds (500ms * 15)
    
    const trySendToken = () => {
      try {
        newWindow.postMessage(
          { 
            type: 'authToken', 
            token: token,
            source: 'taskManagement',
            timestamp: Date.now()
          },
          isLocal ? 'http://localhost:5174' : 'https://invoicing.sharda.co.in'
        );
        console.log('Token sent via postMessage, attempt', attempts + 1);
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(trySendToken, 500);
        }
      } catch (error) {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(trySendToken, 500);
        } else {
          console.error('Failed to send token after multiple attempts:', error);
          window.removeEventListener('message', handleAcknowledgment);
        }
      }
    };
    
    // Start trying to send the token
    setTimeout(trySendToken, 1000);
  }
};


  return (
    // <div className="bg-[#1e1f21] text-white h-screen flex flex-col justify-between border-r border-gray-700 w-[70px] hover:w-[250px] transition-all duration-300">
    <div
      className={`
    fixed left-0 top-0 h-screen z-100
    bg-[#0b1425] text-white flex flex-col justify-between border-r border-gray-700
    transition-all duration-300
    ${expanded ? "w-[220px]" : "w-[70px]"}
  `}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
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
          expanded={expanded}
        />
        {role === "admin" && (
          <>
            {/* <SidebarItem
              icon={<FaPlus className="text-xl" />}
              label="Add User"
              to="/add-employee"
            /> */}
            <SidebarItem
              icon={<FaUsers className="text-xl" />}
              label="All Users"
              to="/all-employees"
              expanded={expanded}
            />
          </>
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
        {/* <SidebarItem
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
        /> */}

        {/* Notification Badge */}
        {/* <SidebarItem
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
        /> */}

        {/* <SidebarItem
          icon={<FaClock className="text-xl" />}
          label="Reminders"
          to="/reminders"
        /> */}

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
          expanded={expanded}
        />

        {/* {role === "admin" && (
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
            expanded={expanded}
          />
        )} */}

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

        {/* {role === "admin" && (
          <SidebarItem
            icon={<FaMoneyBill className="text-xl" />}
            label="Invoice"
            to="/invoice"
            expanded={expanded}
          />
        )} */}

        {role === "admin" && (
          <SidebarItem
            icon={<FaMoneyBill className="text-xl" />}
            label="Invoicing"
            to="/viewinvoicewithotp"
            expanded={expanded}
          />
        )}

        
{/* {role === "admin" && (
  <SidebarItem
    icon={<FaBusinessTime className="text-xl" />}
    label="Invoicing"
    onClick={openInvoiceTab}
    expanded={expanded}
  />
)} */}
        

        {/* <SidebarItem
          icon={<FaEnvelope className="text-xl" />}
          label="Mail Box"
          to="/mailbox"
          expanded={expanded}
        /> */}

        {/* {role === "admin" && (
          <SidebarItem
            icon={<FaMailBulk className="text-xl" />}
            label="Admin Mailbox"
            to="/admin-mailbox"
          />
        )} */}
      </div>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-gray-700 text-xs text-gray-400">
        © 2025 Finaxis
      </div>
    </div>
  );
};
const SidebarItem = ({ icon, label, to, onClick, expanded, badge }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded transition-all duration-300 text-sm relative
      ${
        isActive
          ? "bg-indigo-700 text-white border-l-4 border-indigo-400 shadow-md"
          : "hover:bg-[#2b2c2f] text-white border-l-4 border-transparent"
      }`
    }
  >
    <span className="text-base relative">
      {icon}
      {badge && (
        <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-600 text-white text-[9px] font-semibold rounded-full px-2 flex items-center justify-center">
          {badge}
        </span>
      )}
    </span>
    {expanded && <span className="ml-1.5 whitespace-nowrap">{label}</span>}
  </NavLink>
);

export default Sidebar;
