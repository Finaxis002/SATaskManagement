import { useState, useEffect, useCallback } from "react";
import { FaBell, FaUserCircle, FaSearch, FaSignOutAlt, FaHome, FaNewspaper, FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import useNotificationSocket from "../hook/useNotificationSocket";
import StickyNotes from "./notes/StickyNotes";
import QuickActionsDropdown from "./QuickActionsDropdown";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/* ---------------------------- Inline Modal UI ---------------------------- */
function WhatsNewModal({ open, onClose, items = [], loading = false, error = "" }) {
  if (!open) return null;

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
        transition={{ duration: 0.35, type: "spring", stiffness: 120, damping: 18 }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 text-white flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-yellow-400 text-xs font-semibold">★</span>
            <h2 className="text-base sm:text-lg font-semibold">What's New</h2>
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
              <p className="text-gray-800 font-medium">Nothing to see here (yet)</p>
              <p className="text-sm text-gray-500 mt-1">New updates will show up as soon as they're published.</p>
            </div>
          ) : (
            items.map((it) => (
              <div
                key={it.id}
                className="group rounded-xl border border-gray-200/70 hover:border-gray-300 bg-white shadow-sm hover:shadow-md transition-all duration-200 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
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
  const [showWhatsNew, setShowWhatsNew] = useState(false);

  const [whatsNewItems, setWhatsNewItems] = useState([]);
  const [wnLoading, setWnLoading] = useState(false);
  const [wnError, setWnError] = useState("");
  
  // Add state for What's New count and last seen count
  const [whatsNewCount, setWhatsNewCount] = useState(0);
  const [lastSeenCount, setLastSeenCount] = useState(0);

  const navigate = useNavigate();
  useNotificationSocket(setNotificationCount);

  const mapStored = (u) => ({
    id: u.id || u._id || Math.random().toString(36).slice(2),
    title: u.title,
    desc: u.details,
    tags: Array.isArray(u.tags) ? u.tags : [],
    date: u.createdAt ? new Date(u.createdAt).toLocaleString() : "",
  });

  const fetchWhatsNew = async (updateCountOnly = false) => {
    try {
      if (!updateCountOnly) {
        setWnLoading(true);
        setWnError("");
      }
      
      const token = localStorage.getItem("authToken");
      if (token) {
        const res = await axios.get("http://localhost:1100/api/UpdateGet", {
          headers: {
            "Content-Type": "application/json",
          },
        });

        const list = Array.isArray(res.data) ? res.data : res.data?.data || [];

        const mappedItems = list.map((u) => ({
          id: u._id,
          title: u.title,
          desc: u.description,
          tags: u.tags || [],
          date: u.createdAt ? new Date(u.createdAt).toLocaleString() : "",
          // Store the original createdAt for sorting
          createdAt: u.createdAt,
        }));

        // Sort items by createdAt in descending order (newest first)
        const sortedItems = mappedItems.sort((a, b) => {
          if (!a.createdAt && !b.createdAt) return 0;
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Update items only if not just checking count
        if (!updateCountOnly) {
          setWhatsNewItems(sortedItems);
        }
        
        // Always update count
        setWhatsNewCount(sortedItems.length);
        
        if (!updateCountOnly) {
          console.log("Sorted Items (newest first):", sortedItems);
          console.log("Axios Response Data:", res.data);
        }
      }
    } catch (apiErr) {
      if (!updateCountOnly) {
        console.warn("WhatsNew server merge failed:", apiErr?.message || apiErr);
        setWnError("Failed to load updates. Please try again.");
      }
    } finally {
      if (!updateCountOnly) {
        setWnLoading(false);
      }
    }
  };

  // Load last seen count from localStorage on component mount
  useEffect(() => {
    const savedLastSeenCount = localStorage.getItem("whatsNewLastSeen");
    if (savedLastSeenCount) {
      setLastSeenCount(parseInt(savedLastSeenCount, 10));
    }
    // Initial fetch to get current count
    fetchWhatsNew();
  }, []);

  // Calculate unread count
  const unreadCount = Math.max(0, whatsNewCount - lastSeenCount);

  // Handle What's New button click
  const handleWhatsNewClick = () => {
    setShowWhatsNew(true);
    // Mark all current items as seen
    localStorage.setItem("whatsNewLastSeen", whatsNewCount.toString());
    setLastSeenCount(whatsNewCount);
    // Fetch fresh data when opening modal
    fetchWhatsNew(false);
  };

  // Periodically check for new updates (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      // Only update count, don't show loading or update items unless modal is open
      fetchWhatsNew(true);
    }, 30000); // Check every 30 seconds instead of 5 minutes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onEnter = (e) => {
      if (e.key === "Enter" && highlightRefs.length) {
        e.preventDefault();
        const el = highlightRefs[currentIndex];
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.background = "orange";
        highlightRefs.forEach((m, i) => {
          if (i !== currentIndex) m.style.background = "yellow";
        });
        setCurrentIndex((p) => (p + 1) % highlightRefs.length);
      }
    };
    window.addEventListener("keydown", onEnter);
    return () => window.removeEventListener("keydown", onEnter);
  }, [highlightRefs, currentIndex]);

  useEffect(() => {
    const name = localStorage.getItem("name");
    if (name) {
      const initials = name.split(" ").map((n) => n[0]?.toUpperCase()).join("").substring(0, 2);
      setProfileInitial(initials);
    }
  }, []);

  const handleMenuToggle = () => setIsMenuOpen((prev) => !prev);
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("name");
    localStorage.removeItem("role");
    localStorage.removeItem("whatsNewLastSeen");
    window.location.href = "/login";
  };
  const handleSearchChange = (e) => setSearchTerm(e.target.value.trim());

  useEffect(() => {
    const keyHandler = (e) => {
      if ((e.ctrlKey && e.key === "k") || e.key === "/") {
        e.preventDefault();
        document.getElementById("global-search-input")?.focus();
      }
    };
    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
  }, []);

  return (
    <>
      <header className="bg-white w-full text-gray-800 px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex-1 flex justify-end">
          <div className="relative w-full max-w-xl">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              <FaSearch className="w-4 h-4" />
            </span>

            <motion.input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search..."
              id="global-search-input"
              className="w-full pl-10 pr-24 py-2.5 rounded-full bg-gray-100 text-sm placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200"
              whileFocus={{ scale: 1.05 }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 ml-6 relative">
          {/* What's New - Desktop: Button, Mobile: Icon */}
          <motion.button
            onClick={handleWhatsNewClick}
            className="relative focus:outline-none focus:ring-2 focus:ring-indigo-300 transition group"
            aria-label="What's New"
            title="What's New"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Desktop View - Button with Text */}
            <span className="hidden sm:flex bg-indigo-600 text-white text-sm px-3 py-2 rounded-full hover:opacity-90 items-center gap-2">
              <FaStar className="text-yellow-300" />
              What's New
            </span>
            
            {/* Mobile View - Icon Only with Hover Tooltip */}
            <div className="sm:hidden relative ">
              <span className="bg-indigo-600 rounded-full px-3 py-2 hover:bg-gray-200 flex items-center">
                <FaStar className="text-yellow-400 text-base" />
              </span>
              
              {/* Tooltip for mobile */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-20">
                What's New
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
            
            {/* Count Badge - Shows on both desktop and mobile */}
            {unreadCount > 0 && (
              <motion.span
                className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-bold shadow-md z-10"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </motion.span>
            )}
          </motion.button>

          {/* Notifications */}
          <button
            onClick={() => navigate("/notifications")}
            className="relative bg-gray-100 rounded-full px-3 py-2 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200 flex items-center gap-2"
            aria-label="Notifications"
            title="Notifications"
          >
            <FaBell className="text-gray-600 text-base" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          <QuickActionsDropdown
            onShowNotes={() => setShowNotes(true)}
            onShowInbox={() => {}}
            onShowReminders={() => {}}
          />

          {showNotes && <StickyNotes onClose={() => setShowNotes(false)} />}

          <div className="relative">
            <motion.button
              id="profile-menu"
              onClick={handleMenuToggle}
              className="bg-blue-400 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
              aria-label="Profile menu"
              whileHover={{ scale: 1.1 }}
            >
              {profileInitial}
            </motion.button>

            {isMenuOpen && (
              <div
                id="profile-menu-dropdown"
                className="absolute top-12 right-0 w-48 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.button
                  onClick={() => {
                    navigate("/");
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-purple-50 text-gray-700 flex items-center gap-3 transition-colors duration-150"
                  whileHover={{ scale: 1.05 }}
                >
                  <FaHome className="text-gray-500 flex-shrink-0" />
                  <span>Home</span>
                </motion.button>

                <motion.button
                  onClick={() => {
                    navigate("/profile");
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-purple-50 text-gray-700 flex items-center gap-3 transition-colors duration-150"
                  whileHover={{ scale: 1.05 }}
                >
                  <FaUserCircle className="text-gray-500 flex-shrink-0" />
                  <span>Profile</span>
                </motion.button>

                <div className="border-t border-gray-100 my-1"></div>

                <motion.button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-500 flex items-center gap-3 transition-colors duration-150"
                  whileHover={{ scale: 1.05 }}
                >
                  <FaSignOutAlt className="flex-shrink-0" />
                  <span>Logout</span>
                </motion.button>
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
      />
    </>
  );
};

export default Header;