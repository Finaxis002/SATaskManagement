import { useState, useEffect, useRef } from "react";
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

import { useNavigate, useRoutes } from "react-router-dom";
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

      walk(document.body);
      setHighlightRefs(foundMarks);
      setCurrentIndex(0);
    };

    highlightMatches(searchTerm);
  }, [searchTerm]);

  //useEffect to handle Enter key for scrolling to highlighted elements
  useEffect(() => {
    const handleEnterKey = (e) => {
      if (e.key === "Enter" && highlightRefs.length > 0) {
        e.preventDefault();

        const el = highlightRefs[currentIndex];
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.background = "orange";

        // Reset previous highlight color
        highlightRefs.forEach((mark, idx) => {
          if (idx !== currentIndex) mark.style.background = "yellow";
        });

        setCurrentIndex((prev) => (prev + 1) % highlightRefs.length);
      }
    };

    window.addEventListener("keydown", handleEnterKey);
    return () => window.removeEventListener("keydown", handleEnterKey);
  }, [highlightRefs, currentIndex]);

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
    const value = e.target.value.trim();
    setSearchTerm(value);
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
    <header className="bg-white w-full text-gray-800 px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
      {/* Search Bar */}
      <div className="flex-1 flex justify-end">
        <div className="relative w-full max-w-xl">
          {/* Search Icon */}
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <FaSearch className="w-4 h-4" />
          </span>

          {/* Search Input */}
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search..."
            id="global-search-input"
            className="w-full pl-10 pr-24 py-2.5 rounded-full bg-gray-100 text-sm placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200"
          />

          {/* Right-side controls */}
          <div className="absolute inset-y-0 right-3 flex items-center gap-2">
            {/* Match Count */}
            {highlightRefs.length > 0 && (
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                {currentIndex + 1}/{highlightRefs.length}
              </span>
            )}

            {/* Clear Button */}
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-5 ml-6 relative">
        {/* Notifications */}
        <button
          onClick={() => navigate("/notifications")}
          className="relative bg-gray-100 rounded-full p-2 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200"
          aria-label="Notifications"
        >
          <FaBell className="text-gray-600 text-lg" />
          {/* Notification badge */}
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center ">
              {notificationCount}
            </span>
          )}
        </button>

        {/* Notes */}
        <QuickActionsDropdown
          onShowNotes={() => setShowNotes(true)}
          onShowInbox={() => setShowInbox(true)}
          onShowReminders={() => setShowReminders(true)}
        />

        {showNotes && <StickyNotes onClose={() => setShowNotes(false)} />}

        {/* Profile Menu */}
        <div className="relative">
          <button
            id="profile-menu"
            onClick={handleMenuToggle}
            className="bg-blue-400 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
            aria-label="Profile menu"
          >
            {profileInitial}
          </button>

          {/* Dropdown Menu */}
          {isMenuOpen && (
            <div
              id="profile-menu-dropdown"
              className="absolute top-12 right-0 w-48 bg-white rounded-lg shadow-xl  py-1 z-50 border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Home Button */}
              <button
                onClick={() => {
                  navigate("/");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-purple-50 text-gray-700 flex items-center gap-3 transition-colors duration-150"
              >
                <FaHome className="text-gray-500 flex-shrink-0" />
                <span>Home</span>
              </button>

              {/* Profile Button */}
              <button
                onClick={() => {
                  navigate("/profile");
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-purple-50 text-gray-700 flex items-center gap-3 transition-colors duration-150"
              >
                <FaUserCircle className="text-gray-500 flex-shrink-0" />
                <span>Profile</span>
              </button>

              <div className="border-t border-gray-100 my-1"></div>

              {/* Logout Button */}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-500 flex items-center gap-3 transition-colors duration-150"
              >
                <FaSignOutAlt className="flex-shrink-0" />
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
