// src/layout/MainLayout.jsx
import { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import ReminderAlertManager from "../Components/ReminderAlertManager";
import {
  FaHome,
  FaClipboardList,
  FaBriefcase,
  FaGolfBall,
  FaCog,
  FaMoneyBill,
  FaUsers, // 👈 All Users icon import kiya
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

const MainLayout = ({ children }) => {
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  const isAdmin = role === "admin";

  return (
    <div className="flex h-screen w-full bg-gray-900 text-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar className="z-[100]" />
      </div>

      <div className="flex flex-col flex-1 w-full">
        <Header />



        <main className="flex-1 text-gray-800 overflow-auto w-full z-0 md:pl-[70px] max-w-[100vw] pb-16 md:pb-0">



          {children}
          <ReminderAlertManager />
        </main>
      </div>

      {/* Mobile Footer Navigation */}


      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 flex justify-around py-2">
        <MobileNavItem
          to="/"
          label="Home"
          icon={<FaHome className="text-2xl" />} // bigger icon

        />

        <MobileNavItem
          to="/all-tasks"
          label="Tasks"

          icon={<FaClipboardList className="text-2xl" />}

        />
        <MobileNavItem
          to="/clients"
          label="Clients"

          icon={<FaBriefcase className="text-2xl" />}

        />
        <MobileNavItem
          to="/leave"
          label="Leave"

          icon={<FaGolfBall className="text-2xl" />}

        />

        {/* Admin-only links */}
        {isAdmin && (
          <>
            <MobileNavItem
              to="/settings"
              label="Settings"
              icon={<FaCog className="text-2xl" />}
            />
            <MobileNavItem
              to="/invoices"
              label="Invoices"
              icon={<FaMoneyBill className="text-2xl" />}
            />
          </>
        )}
      </div>
    </div>
  );
};

const MobileNavItem = ({ to, label, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center px-2 py-1 transition-all duration-200 relative 
      ${isActive ? "text-black font-semibold scale-105" : "text-gray-500"}`
    }
  >
    {({ isActive }) => (
      <>

        {/* Top Indicator */}
        {isActive && (
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 
                       w-7 sm:w-8 h-[3px] bg-blue-700 rounded-b-md"
          ></div>
        )}

        {/* Icon */}
        <div className="mt-1">{icon}</div>
        <span className="text-[10px] mt-0.5">{label}</span>

      </>
    )}
  </NavLink>
);

export default MainLayout;
