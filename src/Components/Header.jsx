import { useState, useEffect } from "react";
import { FaBell, FaUserCircle, FaSearch } from "react-icons/fa";
import { FiHelpCircle } from "react-icons/fi";
import { LuSparkles } from "react-icons/lu"; // Use lucide-react or any sparkle icon lib

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Track if the dropdown menu is open

  // Close the dropdown menu when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest("#profile-menu") === null) {
        setIsMenuOpen(false); // Close the dropdown if clicked outside
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleMenuToggle = () => {
    setIsMenuOpen((prevState) => !prevState); // Toggle the menu visibility
  };

  const handleLogout = () => {
    // Clear the auth token or session
    localStorage.removeItem("authToken");

    // Redirect to the login page after logout
    window.location.href = "/login"; // Use React Router's `useNavigate()` if needed
  };

  return (
    <header className="bg-[#1e1f21] w-full text-white px-4 py-2 flex items-center justify-between border-b border-gray-700">
      {/* Search Bar */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-2xl">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <FaSearch />
          </span>
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 rounded-full bg-[#3a3b3c] text-sm placeholder-gray-400 text-white focus:outline-none"
          />
        </div>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-4 ml-6 relative">
        <FiHelpCircle className="text-lg text-gray-400 hover:text-white cursor-pointer" />
        <LuSparkles className="text-lg text-pink-500 hover:text-pink-400 cursor-pointer" />

        {/* Profile Icon */}
        <div
          id="profile-menu" // Added ID for easier click outside detection
          onClick={handleMenuToggle} // Toggle the menu when profile is clicked
          className="bg-purple-500 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer"
        >
          Fi
        </div>

        {/* Dropdown Menu */}
        {isMenuOpen && (
         <div
         id="profile-menu-dropdown"
         style={{
           marginTop: "100%", // Use camelCase for CSS property names
           position: "absolute",
           zIndex: 12, // Ensure it's a number, not a string
         }}
         className="absolute right-0 mt-2 w-40 bg-white text-black rounded-lg shadow-lg p-2"
         onClick={(e) => e.stopPropagation()} // Prevent menu from closing on click
       >
         {/* Menu contents */}
  
       
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 rounded-md"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
