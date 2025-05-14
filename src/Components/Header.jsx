import { useState, useEffect } from "react";
import {
  FaBell,
  FaUserCircle,
  FaSearch,
  FaSignOutAlt,
  FaHome,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileInitial, setProfileInitial] = useState("Fi");
  const [searchTerm, setSearchTerm] = useState("");


  const mockData = ["Dashboard", "Tasks", "Inbox", "Reminders"];
  const filteredResults = mockData.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (e.target.closest("#profile-menu") === null) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const name = localStorage.getItem("name");

    // if (role === "admin") {
    //   setProfileInitial("Fi");
    // } else
    if (name) {
      const initials = name
        .split(" ")
        .map((n) => n[0]?.toUpperCase())
        .join("")
        .substring(0, 2);
      setProfileInitial(initials);
    }
  }, []);

  const handleMenuToggle = () => setIsMenuOpen((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    console.log("Search Term:", e.target.value); // Replace with real logic
  };



useEffect(() => {
  const handleKeyDown = (e) => {
    if ((e.ctrlKey && e.key === "k") || e.key === "/") {
      e.preventDefault();
      document.getElementById("global-search-input")?.focus();
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);


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
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-full bg-[#3a3b3c] text-sm placeholder-gray-400 text-white focus:outline-none"
          />
          {searchTerm && (
            <ul className="absolute z-10 bg-white text-black mt-2 w-full rounded-md shadow-md">
              {filteredResults.length > 0 ? (
                filteredResults.map((item, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {item}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500">No results</li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-4 ml-6 relative">
        {/* Profile Icon */}
        <div
          id="profile-menu"
          onClick={handleMenuToggle}
          className="bg-purple-500 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold cursor-pointer"
        >
          {profileInitial}
        </div>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div
            id="profile-menu-dropdown"
            style={{
              top: "110%",
              right: 0,
              position: "absolute",
              zIndex: 10,
            }}
            className="w-40 bg-white text-black rounded-lg shadow-lg p-2"
            onClick={(e) => e.stopPropagation()}
          >
              {/* Home Button */}
            <button
              onClick={() => {
                navigate("/");
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md flex items-center gap-2"
            >
              <FaHome className="text-gray-600" />
              Home
            </button>
            {/* Profile Button */}
            <button
              onClick={() => {
                navigate("/profile");
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md flex items-center gap-2"
            >
              <FaUserCircle className="text-gray-600" />
              Profile
            </button>

            {/* Logout Button */}
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 rounded-md flex items-center gap-2"
            >
              <FaSignOutAlt className="text-red-500" />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
