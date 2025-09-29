// src/layout/MainLayout.jsx
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import ReminderAlertManager from "../Components/ReminderAlertManager";

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen w-full bg-gray-900 text-white">
      <Sidebar className="z-[100]" />
      <div className="flex flex-col flex-1">
        <Header />

        <main className="flex-1 text-gray-800 overflow-y-auto w-full z-0 md:pl-[70px] max-w-[100vw] pb-16 md:pb-0">

          {children}
          <ReminderAlertManager />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
