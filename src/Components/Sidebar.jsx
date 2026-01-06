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
  // 🔥 Initialize from localStorage immediately
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

      // Update state with localStorage values
      if (currentRole) {
        setRole(currentRole);
      }

      if (
        currentDepartment &&
        currentDepartment !== "null" &&
        currentDepartment !== "undefined"
      ) {
        const normalizedDept = currentDepartment.toLowerCase();

        setDepartment(normalizedDept);
      } else if (currentRole === "user" && storedEmail) {
        // Only fetch if we truly don't have department info

        setIsLoadingDept(true);
        await fetchUserDepartment();
      }
    };

    initializeSidebar();
  }, []);

  const fetchUserDepartment = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const userEmail = localStorage.getItem("email");

      if (!userEmail) {
        console.error("❌ No email found in localStorage");
        setIsLoadingDept(false);
        return;
      }

      const res = await axios.get("https://taskbe.sharda.co.in/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const currentUser = res.data.find((emp) => {
        console.log("Comparing:", emp.email, "with", userEmail);
        return emp.email === userEmail;
      });

      if (currentUser) {
        let userDept = "";

        if (Array.isArray(currentUser.department)) {
          // Check for both spelling variations
          const salesDept = currentUser.department.find(
            (d) =>
              d && (d.toLowerCase() === "sales" || d.toLowerCase() === "selles")
          );
          userDept = salesDept
            ? "sales" // Normalize to correct spelling if found
            : (currentUser.department[0] || "").toLowerCase();
        } else {
          userDept = (currentUser.department || "").toLowerCase();
        }

        setDepartment(userDept);
        localStorage.setItem("department", userDept);
        console.log("💾 Department saved to localStorage");
      } else {
        console.error("❌ User not found in employees list");
        console.log(
          "Available emails:",
          res.data.map((emp) => emp.email)
        );
        setDepartment("");
      }
    } catch (err) {
      console.error("❌ Failed to fetch user department:", err);
      console.error("Error details:", err.response?.data || err.message);
      setDepartment("");
    } finally {
      setIsLoadingDept(false);
    }
  };

  useMessageSocket(setInboxCount);
  useNotificationSocket(setNotificationCount);

  // Helper check for sales department (includes typo support)
  const isSales =
    role === "admin" || department === "sales" || department === "selles";

  // ✅ Helper check for IT department (accepts multiple variations)
  // Note: Since 'role === admin' is included here, using 'isIT' covers both Admin AND IT users.
  const isIT =
    role === "admin" ||
    department === "it" ||
    department === "it/software" ||
    department === "information technology" ||
    department === "IT" ||
    department === "IT/Software" ||
    department === "Information Technology";

  // Show loading state only while fetching department
  if (isLoadingDept) {
    return (
      <div className="hidden md:flex fixed left-0 top-0 h-screen z-[999] w-[70px] bg-gradient-to-b from-purple-50 to-indigo-50 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* ---------------- Desktop Sidebar ---------------- */}
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
          <SidebarItem
            icon={<FaHome />}
            label="Home"
            to="/"
            expanded={expanded}
          />

          {role === "admin" && (
            <SidebarItem
              icon={<FaUsers />}
              label="All Users"
              to="/all-employees"
              expanded={expanded}
            />
          )}

          <SidebarItem
            icon={<FaClipboardList />}
            label="Tasks"
            to="/all-tasks"
            expanded={expanded}
          />

          <SidebarItem
            icon={<FaUserTie />}
            label="Agent"
            to="/agent"
            expanded={expanded}
          />

          {/* ✅ Only show for IT department users */}
          {isIT && (
            <SidebarItem
              icon={<FaRegEnvelopeOpen />}
              label="Support Requests"
              to="/developer-support"
              expanded={expanded}
            />
          )}

          <SidebarItem
            icon={<FaBriefcase />}
            label="Clients"
            to="/clients"
            expanded={expanded}
          />

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
            <SidebarItem
              icon={<FaCheckCircle />}
              label="Completed Tasks"
              to="/completed"
              expanded={expanded}
            />
          )}

          {/* Invoicing for Sales department */}
          {isSales && (
            <SidebarItem
              icon={<FaMoneyBill />}
              label="Invoicing"
              to="/viewinvoicewithotp"
              expanded={expanded}
            />
          )}

          {/* ✅ UPDATED: Ab Admin aur IT Department dono ko dikhega */}
          {isIT && (
            <SidebarItem
              icon={<FaClock />}
              label="Updates"
              to="/updates"
              expanded={expanded}
            />
          )}
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

      {/* ---------------- Mobile Sidebar ---------------- */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-opacity-50 z-[999]"
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
          <MobileSidebarItem
            icon={<FaHome />}
            label="Home"
            to="/"
            onClick={onClose}
          />

          {role === "admin" && (
            <MobileSidebarItem
              icon={<FaUsers />}
              label="All Users"
              to="/all-employees"
              onClick={onClose}
            />
          )}

          <MobileSidebarItem
            icon={<FaClipboardList />}
            label="Tasks"
            to="/all-tasks"
            onClick={onClose}
          />

          <MobileSidebarItem
            icon={<FaUserTie />}
            label="Agent"
            to="/agent"
            onClick={onClose}
          />

          {/* ✅ Only show for IT department users */}
          {isIT && (
            <MobileSidebarItem
              icon={<FaRegEnvelopeOpen />}
              label="Support Requests"
              to="/developer-support"
              onClick={onClose}
            />
          )}

          <MobileSidebarItem
            icon={<FaBriefcase />}
            label="Clients"
            to="/clients"
            onClick={onClose}
          />

          <MobileSidebarItem
            icon={<FaGolfBall />}
            label="Leave"
            to="/leave"
            onClick={onClose}
          />

          {role === "admin" && (
            <MobileSidebarItem
              icon={<FaCog />}
              label="Settings"
              to="/departments"
              onClick={onClose}
              badge={pendingLeaveCount}
            />
          )}

          {role === "admin" && (
            <MobileSidebarItem
              icon={<FaCheckCircle />}
              label="Completed Tasks"
              to="/completed"
              onClick={onClose}
            />
          )}

          {/* Invoicing for Sales department */}
          {isSales && (
            <MobileSidebarItem
              icon={<FaMoneyBill />}
              label="Invoicing"
              to="/viewinvoicewithotp"
              onClick={onClose}
            />
          )}

          {/* ✅ UPDATED: Ab Admin aur IT Department dono ko dikhega */}
          {isIT && (
            <MobileSidebarItem
              icon={<FaClock />}
              label="Updates"
              to="/updates"
              onClick={onClose}
            />
          )}
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
      {badge && (
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
