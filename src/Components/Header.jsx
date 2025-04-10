// src/components/Header.jsx
import { FaBell, FaUserCircle } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="bg-white text-gray-700 shadow px-6 py-3 flex justify-between items-center">
      <h2 className="text-xl font-semibold">Task management</h2>
      <div className="flex items-center gap-4">
        <FaBell className="text-xl cursor-pointer" />
        <FaUserCircle className="text-2xl cursor-pointer" />
      </div>
    </header>
  );
};

export default Header;
