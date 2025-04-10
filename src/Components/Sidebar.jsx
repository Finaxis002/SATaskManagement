// src/components/Sidebar.jsx
import { useState } from 'react';
import { FaTasks, FaUsers, FaChartPie, FaBars } from 'react-icons/fa';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`bg-[#1e293b] ${isOpen ? 'w-64' : 'w-16'} transition-all duration-300 h-full p-4`}>
      <div className="flex items-center justify-between mb-10">
        <h1 className={`text-2xl font-bold text-white ${!isOpen && 'hidden'}`}>TaskFlow</h1>
        <FaBars className="text-white cursor-pointer" onClick={() => setIsOpen(!isOpen)} />
      </div>

      <nav className="flex flex-col gap-6">
        <a href="#" className="flex items-center gap-3 text-white hover:text-blue-400 transition">
          <FaTasks />
          {isOpen && <span>Tasks</span>}
        </a>
        <a href="#" className="flex items-center gap-3 text-white hover:text-blue-400 transition">
          <FaUsers />
          {isOpen && <span>Teams</span>}
        </a>
        <a href="#" className="flex items-center gap-3 text-white hover:text-blue-400 transition">
          <FaChartPie />
          {isOpen && <span>Analytics</span>}
        </a>
      </nav>
    </div>
  );
};

export default Sidebar;
