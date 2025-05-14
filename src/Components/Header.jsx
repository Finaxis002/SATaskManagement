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
  const [highlightRefs, setHighlightRefs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const navigate = useNavigate();

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
    <header className="bg-[#1e1f21] w-full text-white px-4 py-2 flex items-center justify-between border-b border-gray-700">
      {/* Search Bar */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-2xl">
          {/* Search Icon */}
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <FaSearch />
          </span>

          {/* Search Input */}
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search..."
            id="global-search-input"
            className="w-full pl-10 pr-10 py-2 rounded-full bg-[#3a3b3c] text-sm placeholder-gray-400 text-white focus:outline-none"
          />

          {/* Right-side controls (clear button and match count) */}
          <div className="absolute inset-y-0 right-3 flex items-center gap-2">
            {/* Match Count - only shows when there are matches */}
            {highlightRefs.length > 0 && (
              <span className="text-xs text-gray-300 whitespace-nowrap">
                {currentIndex + 1}/{highlightRefs.length}
              </span>
            )}

            {/* Clear Button - only shows when there's text */}
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setHighlightRefs([]);
                  setCurrentIndex(0);
                }}
                className="text-gray-400 hover:text-white flex-shrink-0"
              >
                ✖
              </button>
            )}
          </div>
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
