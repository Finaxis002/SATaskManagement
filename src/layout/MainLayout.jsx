// src/layout/MainLayout.jsx
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import ReminderAlertManager from "../Components/ReminderAlertManager";

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen w-full bg-gray-900 text-white overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 text-gray-800 overflow-hidden w-full">

          {children}
          <ReminderAlertManager />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
