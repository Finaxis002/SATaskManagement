import { useState, useEffect } from "react";
import {
  FaBell,
  FaUserCircle,
  FaSearch,
  FaSignOutAlt,
  FaHome,
  FaRegStickyNote,
} from "react-icons/fa";
import useNotificationSocket from "../hook/useNotificationSocket";
import StickyNotes from "./notes/StickyNotes";
import QuickActionsDropdown from "./QuickActionsDropdown";
import { NavLink, useNavigate } from "react-router-dom";
import HeaderLogo from "../assets/HeaderLogo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileInitial, setProfileInitial] = useState("Fi");
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightRefs, setHighlightRefs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotes, setShowNotes] = useState(false);

  const navigate = useNavigate();
  useNotificationSocket(setNotificationCount);


  // Check if device is mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //for search bar
  useEffect(() => {
    const highlightMatches = (term) => {
      // Remove existing highlights
      document.querySelectorAll("mark[data-highlight]").forEach((mark) => {
        const parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
      });

      if (!term) {
        setHighlightRefs([]);
        setCurrentIndex(0);
        return;
      }

      const regex = new RegExp(`(${term})`, "gi");
      const foundMarks = [];

      const walk = (node) => {
        if (
          node.nodeType === 3 &&
          node.parentNode &&
          node.parentNode.nodeName !== "SCRIPT" &&
          node.parentNode.nodeName !== "STYLE"
        ) {
          const text = node.nodeValue;
          if (regex.test(text)) {
            const span = document.createElement("span");
            span.innerHTML = text.replace(
              regex,
              `<mark data-highlight style="background: yellow;">$1</mark>`
            );
            const fragment = document.createDocumentFragment();
            while (span.firstChild) {
              const child = span.firstChild;
              if (child.tagName === "MARK") foundMarks.push(child);
              fragment.appendChild(child);
            }
            node.parentNode.replaceChild(fragment, node);
          }
        } else if (node.nodeType === 1) {
          for (let i = 0; i < node.childNodes.length; i++) {
            walk(node.childNodes[i]);
          }
        }
      };


  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get user initials
  useEffect(() => {
    const name = localStorage.getItem("name");
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

  const handleSearchChange = (e) => setSearchTerm(e.target.value.trim());

  return (
    <header className="bg-white w-full text-gray-800 px-3 sm:px-4 md:px-6 py-2 sm:py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
      {/* Left Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <NavLink to="/" className="flex items-center">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-black/3 rounded-full flex items-center justify-center overflow-hidden">
            <img
              src={HeaderLogo}
              alt="Logo"
              className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
            />
          </div>
        </NavLink>
      </div>

      {/* Search Bar (responsive width) */}
      <div className="flex-1 flex justify-center px-2 sm:px-4">
        <div className="relative w-full max-w-sm sm:max-w-md md:max-w-xl">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <FaSearch className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search..."
            id="global-search-input"
            className="w-full pl-9 pr-20 py-2 text-sm rounded-full bg-gray-100 placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200"
          />
          <div className="absolute inset-y-0 right-3 flex items-center gap-1 sm:gap-2">
            {highlightRefs.length > 0 && (
              <span className="hidden sm:block text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                {currentIndex + 1}/{highlightRefs.length}
              </span>
            )}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setHighlightRefs([]);
                  setCurrentIndex(0);
                }}
                className="text-gray-500 hover:text-gray-700 flex-shrink-0 transition-colors duration-200"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-4 md:gap-5 ml-4 md:ml-6 relative">
        <span className="hidden md:inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full shadow-sm border border-gray-200">
          Shortcuts window:
          <kbd className="px-1.5 py-0.5 bg-gray-50 border border-gray-300 rounded text-gray-700 font-medium shadow-sm">
            Ctrl
          </kbd>
          +
          <kbd className="px-1.5 py-0.5 bg-gray-50 border border-gray-300 rounded text-gray-700 font-medium shadow-sm">
            S
          </kbd>
        </span>
        {/* Mobile view: Show Notes icon instead of Notification icon */}

        {isMobile ? (
          <>
            <button
              onClick={() => setShowNotes(true)}
              className="relative bg-gray-100 rounded-full p-2 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all duration-200"
              aria-label="Notes"
            >
              <FaRegStickyNote className="text-gray-600 text-lg" />
            </button>

            <QuickActionsDropdown
              notificationCount={notificationCount}
              isMobile={isMobile}
            />
          </>
        ) : (
          <>
            <button
              onClick={() => navigate("/notifications")}
              className="relative bg-gray-100 rounded-full p-2 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200"
              aria-label="Notifications"
            >
              <FaBell className="text-gray-600 text-lg" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
            <QuickActionsDropdown
              onShowNotes={() => setShowNotes(true)}
              isMobile={isMobile}
            />
          </>
        )}

        {/* Sticky Notes Popup */}
        {showNotes && <StickyNotes onClose={() => setShowNotes(false)} />}

        {/* Profile Menu */}
        <div className="relative">
          <button
            id="profile-menu"
            onClick={handleMenuToggle}
            className="bg-blue-400 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
            aria-label="Profile menu"
          >
            {profileInitial}
          </button>
          {isMenuOpen && (
            <div
              id="profile-menu-dropdown"

              className="absolute top-11 sm:top-12 right-0 w-40 sm:w-48 bg-white rounded-lg shadow-xl overflow-hidden py-1 z-50 border border-gray-100"

              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  navigate("/");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 sm:py-3 hover:bg-purple-50 text-gray-700 flex items-center gap-2 sm:gap-3 transition-colors duration-150"
              >
                <FaHome className="text-gray-500" />
                <span>Home</span>
              </button>
              <button
                onClick={() => {
                  navigate("/profile");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 sm:py-3 hover:bg-purple-50 text-gray-700 flex items-center gap-2 sm:gap-3 transition-colors duration-150"
              >
                <FaUserCircle className="text-gray-500" />
                <span>Profile</span>
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 sm:py-3 hover:bg-red-50 text-red-500 flex items-center gap-2 sm:gap-3 transition-colors duration-150"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
