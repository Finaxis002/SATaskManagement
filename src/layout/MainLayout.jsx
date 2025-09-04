// src/layout/MainLayout.jsx
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import ReminderAlertManager from "../Components/ReminderAlertManager";
import {
  FaHome,
  FaClipboardList,
  FaBriefcase,
  FaGolfBall,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

const MainLayout = ({ children }) => {
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-300 flex justify-around py-2">
        <MobileNavItem to="/" label="Home" icon={<FaHome className="text-xl" />} />
        <MobileNavItem to="/all-tasks" label="Tasks" icon={<FaClipboardList className="text-xl" />} />
        <MobileNavItem to="/clients" label="Clients" icon={<FaBriefcase className="text-xl" />} />
        <MobileNavItem to="/leave" label="Leave" icon={<FaGolfBall className="text-xl" />} />
      </div>
    </div>
  );
};
const MobileNavItem = ({ to, label, icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col items-center justify-center px-3 py-1 transition-all duration-200 relative ${
        isActive ? "text-black font-semibold scale-105" : "text-gray-500"
      }`
    }
  >
    {({ isActive }) => (
      <>
        {/* Top Indicator */}
        {isActive && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-700 rounded-b-md"></div>
        )}

        {icon}
        <span className="text-xs">{label}</span>
      </>
    )}
  </NavLink>
);


export default MainLayout;
