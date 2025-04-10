// src/layout/MainLayout.jsx
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen w-full bg-gray-900 text-white">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 text-gray-800 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
