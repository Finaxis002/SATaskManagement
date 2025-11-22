import { useState, useEffect } from "react";
import {
  FaBell,
  FaUserCircle,
  FaSearch,
  FaSignOutAlt,
  FaHome,
  FaStar,
  FaTrash,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { MdSupportAgent } from "react-icons/md";
import { motion } from "framer-motion";
import useNotificationSocket from "../hook/useNotificationSocket";
import StickyNotes from "../Components/notes/StickyNotes";
import QuickActionsDropdown from "../Components/QuickActionsDropdown";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* ---------------------------- What's New Modal ---------------------------- */
function WhatsNewModal({
  open,
  onClose,
  items = [],
  loading = false,
  error = "",
  onDelete,
}) {
  if (!open) return null;

  // Check if user is admin
  const userRole = localStorage.getItem("role");
  const isAdmin = userRole === "admin" || userRole === "Admin";

  const SkeletonCard = () => (
    <div className="rounded-xl border border-gray-200/60 p-4 bg-white/60 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-3 w-40 rounded bg-gray-200" />
        <div className="h-3 w-20 rounded bg-gray-200" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="h-3 w-5/6 rounded bg-gray-200" />
        <div className="h-3 w-2/3 rounded bg-gray-200" />
      </div>
      <div className="flex gap-2 mt-3">
        <span className="h-5 w-12 rounded-full bg-gray-200" />
        <span className="h-5 w-16 rounded-full bg-gray-200" />
        <span className="h-5 w-10 rounded-full bg-gray-200" />
      </div>
    </div>
  );

  const handleDelete = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this update?")) {
      return;
    }
    if (onDelete) {
      await onDelete(itemId);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="w-full max-w-2xl mx-4 rounded-2xl bg-white/90 shadow-2xl ring-1 ring-black/5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 30, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 30, opacity: 0.9 }}
        transition={{
          duration: 0.35,
          type: "spring",
          stiffness: 120,
          damping: 18,
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-yellow-400 text-xs font-semibold">
              ★
            </span>
            <h2 className="text-base sm:text-lg font-semibold">What's New</h2>
            {isAdmin && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                Admin
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition"
            aria-label="Close"
            title="Close"
          >
            <span className="block h-4 w-4 leading-none">✕</span>
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-white to-gray-50">
          {loading ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
              {error}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-10">
              <div className="text-4xl mb-3">📰</div>
              <p className="text-gray-800 font-medium">
                Nothing to see here (yet)
              </p>
              <p className="text-sm text-gray-500 mt-1">
                New updates will show up as soon as they're published.
              </p>
            </div>
          ) : (
            items.map((it) => (
              <div
                key={it.id}
                className="group rounded-xl border border-gray-200/70 hover:border-gray-300 bg-white shadow-sm hover:shadow-md transition-all duration-200 p-4 relative"
              >
                {/* Admin Delete Button */}
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(it.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 transition-all duration-200 z-10"
                    title="Delete this update"
                    aria-label="Delete update"
                  >
                    <FaTrash className="w-3 h-3" />
                  </button>
                )}

                <div className="flex items-start justify-between gap-3 mb-1.5 pr-8">
                  <span className="text-sm sm:text-base font-semibold text-gray-900 leading-snug line-clamp-2">
                    {it.title}
                  </span>
                  {it.date ? (
                    <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                      {it.date}
                    </span>
                  ) : null}
                </div>

                {it.desc ? (
                  <p className="text-sm text-gray-700 leading-relaxed mt-1 line-clamp-4">
                    {it.desc}
                  </p>
                ) : null}

                {it.tags?.length ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {it.tags.map((t, ti) => (
                      <span
                        key={`${it.id}-${t}-${ti}`}
                        className="text-[11px] px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                ) : null}

                {/* subtle divider on hover */}
                <div className="mt-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/90 backdrop-blur px-5 py-3 border-t border-gray-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.99] transition"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* --------------------------------- Header -------------------------------- */
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileInitial, setProfileInitial] = useState("Fi");
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightRefs, setHighlightRefs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  // What's New states
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [whatsNewItems, setWhatsNewItems] = useState([]);
  const [wnLoading, setWnLoading] = useState(false);
  const [wnError, setWnError] = useState("");
  const [whatsNewCount, setWhatsNewCount] = useState(0);
  const [lastSeenCount, setLastSeenCount] = useState(0);
  const navigate = useNavigate();
  useNotificationSocket(setNotificationCount);

  // Check if user is admin for home button visibility
  const userRole = localStorage.getItem("role");
  const isAdmin = userRole === "admin" || userRole === "Admin";

  // Check if device is mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // What's New functions
  const fetchWhatsNew = async (updateCountOnly = false) => {
    try {
      if (!updateCountOnly) {
        setWnLoading(true);
        setWnError("");
      }
      const token = localStorage.getItem("authToken");
      if (token) {
        const res = await axios.get(
          "https://taskbe.sharda.co.in/api/UpdateGet",
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const mappedItems = list.map((u) => ({
          id: u._id,
          title: u.title,
          desc: u.description,
          tags: u.tags || [],
          date: u.createdAt ? new Date(u.createdAt).toLocaleString() : "",
          createdAt: u.createdAt,
        }));
        // Sort items by createdAt in descending order (newest first)
        const sortedItems = mappedItems.sort((a, b) => {
          if (!a.createdAt && !b.createdAt) return 0;
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        if (!updateCountOnly) {
          setWhatsNewItems(sortedItems);
        }
        setWhatsNewCount(sortedItems.length);
      }
    } catch (apiErr) {
      if (!updateCountOnly) {
        console.warn(
          "WhatsNew server merge failed:",
          apiErr?.message || apiErr
        );
        setWnError("Failed to load updates. Please try again.");
      }
    } finally {
      if (!updateCountOnly) {
        setWnLoading(false);
      }
    }
  };

  // Delete function for What's New
  const handleDeleteUpdate = async (itemId) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setWnError("Authentication required");
        return;
      }
      setWnLoading(true);
      const cleanItemId = itemId.toString().split(":")[0];
      const response = await axios.delete(
        `https://taskbe.sharda.co.in/api/UpdateDelete/${cleanItemId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        }
      );
      if (response.status === 200 || response.status === 204) {
        setWhatsNewItems((prevItems) =>
          prevItems.filter((item) => item.id !== itemId)
        );
        setWhatsNewCount((prevCount) => prevCount - 1);
        const newLastSeenCount = Math.max(0, lastSeenCount - 1);
        localStorage.setItem("whatsNewLastSeen", newLastSeenCount.toString());
        setLastSeenCount(newLastSeenCount);
        setWnError("");
      }
    } catch (error) {
      console.error("Error deleting update:", error);
      if (error.response?.status === 404) {
        setWnError("Update not found. It might have been already deleted.");
        setWhatsNewItems((prevItems) =>
          prevItems.filter((item) => item.id !== itemId)
        );
        setWhatsNewCount((prevCount) => prevCount - 1);
      } else if (error.response?.status === 403) {
        setWnError("You don't have permission to delete this update.");
      } else if (error.response?.status === 401) {
        setWnError("Authentication failed. Please login again.");
      } else {
        setWnError("Failed to delete update. Please try again.");
      }
    } finally {
      setWnLoading(false);
    }
  };

  // Load What's New data
  useEffect(() => {
    const savedLastSeenCount = localStorage.getItem("whatsNewLastSeen");
    if (savedLastSeenCount) {
      setLastSeenCount(parseInt(savedLastSeenCount, 10));
    }
    fetchWhatsNew();
  }, []);

  // Calculate unread count for What's New
  const unreadCount = Math.max(0, whatsNewCount - lastSeenCount);

  // Handle What's New button click
  const handleWhatsNewClick = () => {
    setShowWhatsNew(true);
    localStorage.setItem("whatsNewLastSeen", whatsNewCount.toString());
    setLastSeenCount(whatsNewCount);
    fetchWhatsNew(false);
  };

  // Periodically check for new updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchWhatsNew(true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Search highlight logic
  useEffect(() => {
    const highlightMatches = (term) => {
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
          for (let i = 0; i < node.childNodes.length; i++)
            walk(node.childNodes[i]);
        }
      };
      walk(document.body);
      setHighlightRefs(foundMarks);
      setCurrentIndex(0);
    };
    highlightMatches(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const handleEnterKey = (e) => {
      if (e.key === "Enter" && highlightRefs.length > 0) {
        e.preventDefault();
        const el = highlightRefs[currentIndex];
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.background = "orange";
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
      if (!e.target.closest("#profile-menu")) setIsMenuOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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
    localStorage.removeItem("department");
    localStorage.removeItem("whatsNewLastSeen");
    window.location.href = "/login";
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value.trim());

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
    <>
      <header className="bg-white w-full text-gray-800 px-2 sm:px-4 md:px-6 py-2 sm:py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
        {/* Left Side - Home Button (Admin Only) */}
        <div className="flex items-center">
          {isAdmin && (
            <button
              onClick={() => navigate("/")}
              className="bg-gray-100 md:hidden rounded-full p-1.5 sm:p-2 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200 mr-2 sm:mr-4"
              aria-label="Home"
              title="Home"
            >
              <FaHome className="text-gray-600 text-base sm:text-lg" />
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="flex-1 flex justify-center px-1 sm:px-2">
          <div className="relative w-full max-w-xl">
            <span className="absolute inset-y-0 left-2 sm:left-3 flex items-center text-gray-400">
              <FaSearch className="w-3 h-3 sm:w-4 sm:h-4" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search"
              id="global-search-input"
              className="w-full pl-8 sm:pl-10 pr-16 sm:pr-32 py-2 sm:py-2.5 rounded-full bg-gray-100 text-xs sm:text-sm placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-2 sm:right-3 flex items-center gap-1 sm:gap-2">
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
                    className="h-3 w-3 sm:h-4 sm:w-4"
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
              <span className="text-xs text-gray-500 hidden lg:block px-2 py-1 font-medium">
                Short Cut Alt + S
              </span>
              {highlightRefs.length > 0 && (
                <span className="text-[10px] sm:text-xs text-gray-500 bg-gray-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                  {currentIndex + 1}/{highlightRefs.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 ml-2 sm:ml-4 md:ml-6 relative">
          {/* What's New Button */}
          <motion.button
            onClick={handleWhatsNewClick}
            className="relative focus:outline-none focus:ring-2 focus:ring-indigo-300 transition group"
            aria-label="What's New"
            title="What's New"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Desktop View - Button with Text */}
            <span className="hidden md:flex bg-indigo-600 text-white text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-full hover:opacity-90 items-center gap-1 sm:gap-2">
              <FaStar className="text-yellow-300 text-xs sm:text-sm" />
              <span className="hidden lg:inline">What's New</span>
              <span className="lg:hidden">New</span>
            </span>
            {/* Mobile/Tablet View - Icon Only */}
            <div className="md:hidden relative">
              <span className="bg-indigo-600 rounded-full px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-indigo-700 flex items-center">
                <HiSparkles className="text-yellow-400 text-sm sm:text-base" />
              </span>
              {/* Tooltip for mobile */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-20">
                What's New
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
            {/* Count Badge */}
            {unreadCount > 0 && (
              <motion.span
                className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] flex items-center justify-center font-bold shadow-md z-10"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </motion.span>
            )}
          </motion.button>

          {/* Notification Icon */}
          <button
            onClick={() => navigate("/notifications")}
            className="relative bg-gray-100 rounded-full p-1.5 sm:p-2 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200"
            aria-label="Notifications"
          >
            <FaBell className="text-gray-600 text-base sm:text-lg" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          <QuickActionsDropdown
            onShowNotes={() => setShowNotes(true)}
            isMobile={isMobile}
          />

          {showNotes && <StickyNotes onClose={() => setShowNotes(false)} />}

          {/* Profile Menu */}
          <div className="relative">
            <button
              id="profile-menu"
              onClick={handleMenuToggle}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 text-xs sm:text-sm"
              style={{ backgroundColor: "#4332d2", focusRingColor: "#e0dcf9" }}
              aria-label="Profile menu"
            >
              {profileInitial}
            </button>

            {isMenuOpen && (
              <div
                id="profile-menu-dropdown"
                className="absolute top-10 sm:top-12 right-0 w-44 sm:w-48 bg-white rounded-lg shadow-xl overflow-hidden py-1 z-50 border border-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => {
                    navigate("/profile");
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-purple-50 text-gray-700 flex items-center gap-2 sm:gap-3 transition-colors duration-150 text-sm sm:text-base"
                >
                  <FaUserCircle className="text-gray-500 flex-shrink-0 text-sm sm:text-base" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => {
                    navigate("/support");
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-purple-50 text-gray-700 flex items-center gap-2 transition-colors duration-150 text-sm sm:text-base"
                >
                  <MdSupportAgent className="text-gray-500 flex-shrink-0 text-lg sm:text-xl" />
                  <span>Support</span>
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-red-50 text-red-500 flex items-center gap-2 sm:gap-3 transition-colors duration-150 text-sm sm:text-base"
                >
                  <FaSignOutAlt className="flex-shrink-0 text-sm sm:text-base" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* What's New Modal */}
      <WhatsNewModal
        open={showWhatsNew}
        onClose={() => setShowWhatsNew(false)}
        items={whatsNewItems}
        loading={wnLoading}
        error={wnError}
        onDelete={handleDeleteUpdate}
      />
    </>
  );
};

export default Header;
