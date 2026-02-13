// src/layout/MainLayout.jsx
import { useState } from "react"; // 1. useState import karna zaroori hai
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import ReminderAlertManager from "../Components/ReminderAlertManager";

const MainLayout = ({ children }) => {
  // 2. Yahan state banayein jo Sidebar ko open/close karegi
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 3. Toggle Function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen w-full bg-gray-900 text-white">
      {/* 4. Sidebar ko batayein ki wo khula hai ya band (isOpen prop) */}
      <Sidebar 
        className="z-[100]" 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex flex-col flex-1">
        {/* 5. Header ko remote control dein (onToggleSidebar prop) */}
        <Header 
          onToggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen} 
        />

        <main className="flex-1 text-gray-800 overflow-y-auto w-full z-0 md:pl-[70px] max-w-[100vw] pb-16 md:pb-0 relative">
          {children}
          <ReminderAlertManager />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;