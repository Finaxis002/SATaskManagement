import { useState, useEffect, useRef } from "react";
import {
  FaBell,
  FaUserCircle,
  FaSearch,
  FaSignOutAlt,
  FaHome,
  FaStar,
  FaBars,
  FaTimes,
  FaCog,
  FaUserShield,
  FaCheck,
  FaCheckDouble,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { MdSupportAgent } from "react-icons/md";
import { motion } from "framer-motion";
import useNotificationSocket from "../hook/useNotificationSocket";
import StickyNotes from "../Components/notes/StickyNotes";
import QuickActionsDropdown from "../Components/QuickActionsDropdown";
import SettingsModal from "../Components/SettingsModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { TbLayoutSidebarLeftCollapse } from "react-icons/tb";

/* ---------------------------- What's New Modal ---------------------------- */
function WhatsNewModal({
  open,
  onClose,
  items = [],
  loading = false,
  error = "",
  readIds = [],
  onMarkRead,
  onMarkAllRead,
}) {
  if (!open) return null;

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

          <div className="flex items-center gap-3">
            {/* Mark All as Read Button */}
            {items.length > 0 && (
              <button
                onClick={onMarkAllRead}
                className="flex items-center gap-1 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-white"
                title="Mark all items as read"
              >
                <FaCheckDouble className="text-xs" />
                <span className="hidden sm:inline">Mark All Read</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition"
              aria-label="Close"
              title="Close"
            >
              <span className="block h-4 w-4 leading-none">✕</span>
            </button>
          </div>
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
            items.map((it) => {
              const isRead = readIds.includes(it.id);

              return (
                <div
                  key={it.id}
                  className={`group rounded-xl border transition-all duration-200 p-4 relative ${
                    isRead
                      ? "border-gray-200 bg-gray-50/50"
                      : "border-indigo-200 bg-white shadow-sm ring-1 ring-indigo-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-1.5 pr-8">
                    <div className="flex items-center gap-2">
                      {/* Unread Indicator Dot */}
                      {!isRead && (
                        <span className="flex h-2 w-2 relative shrink-0 mt-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                      )}
                      <span
                        className={`text-sm sm:text-base font-semibold leading-snug line-clamp-2 ${
                          isRead ? "text-gray-600" : "text-gray-900"
                        }`}
                      >
                        {it.title}
                      </span>
                    </div>
                    {it.date ? (
                      <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                        {it.date}
                      </span>
                    ) : null}
                  </div>

                  {it.desc ? (
                    <p
                      className={`text-sm leading-relaxed mt-1 line-clamp-4 ${
                        isRead ? "text-gray-500" : "text-gray-700"
                      }`}
                    >
                      {it.desc}
                    </p>
                  ) : null}

                  {/* Footer of Card: Tags & Read Button */}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {it.tags?.length
                        ? it.tags.map((t, ti) => (
                            <span
                              key={`${it.id}-${t}-${ti}`}
                              className={`text-[11px] px-2 py-1 rounded-full border ${
                                isRead
                                  ? "bg-gray-100 text-gray-500 border-gray-200"
                                  : "bg-indigo-50 text-indigo-700 border-indigo-100"
                              }`}
                            >
                              #{t}
                            </span>
                          ))
                        : null}
                    </div>

                    {!isRead && (
                      <button
                        onClick={() => onMarkRead(it.id)}
                        className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded transition-colors"
                      >
                        <FaCheck className="text-[10px]" />
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              );
            })
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
const Header = ({ onToggleSidebar, isSidebarOpen }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileInitial, setProfileInitial] = useState("Fi");
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightCount, setHighlightCount] = useState(0);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [whatsNewItems, setWhatsNewItems] = useState([]);
  const [wnLoading, setWnLoading] = useState(false);
  const [wnError, setWnError] = useState("");
  const [whatsNewCount, setWhatsNewCount] = useState(0);

  // --- LOGIC CHANGE: Get Unique User Identifier ---
  // We prefer userId, fallback to email, fallback to name, fallback to "guest"
  const getUserId = () => {
    return (
      localStorage.getItem("userId") || 
      localStorage.getItem("_id") ||
      localStorage.getItem("email") || 
      localStorage.getItem("name") || 
      "guest"
    ).replace(/\s+/g, '_'); // Replace spaces with underscore
  };

  const [currentUserId, setCurrentUserId] = useState(getUserId());
  const [readUpdateIds, setReadUpdateIds] = useState([]);

  const contentRef = useRef(null);
  const navigate = useNavigate();
  useNotificationSocket(setNotificationCount);

  const userRole = localStorage.getItem("role");
  const isAdmin = userRole === "admin" || userRole === "Admin";

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- LOGIC CHANGE: Load User-Specific Data ---
  useEffect(() => {
    // Determine the storage key based on current user
    const storageKey = `readWhatsNewIds_${currentUserId}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setReadUpdateIds(JSON.parse(saved));
      } else {
        setReadUpdateIds([]);
      }
    } catch (e) {
      setReadUpdateIds([]);
    }
  }, [currentUserId]);

  /* ---------------------- Whats New Logic ---------------------- */

  // Mark single item as read (Saved to User-Specific Key)
  const handleMarkAsRead = (id) => {
    if (!readUpdateIds.includes(id)) {
      const newIds = [...readUpdateIds, id];
      setReadUpdateIds(newIds);
      const storageKey = `readWhatsNewIds_${currentUserId}`;
      localStorage.setItem(storageKey, JSON.stringify(newIds));
    }
  };

  // Mark all items as read (Saved to User-Specific Key)
  const handleMarkAllAsRead = () => {
    const allIds = whatsNewItems.map((item) => item.id);
    const combinedIds = [...new Set([...readUpdateIds, ...allIds])];
    setReadUpdateIds(combinedIds);
    const storageKey = `readWhatsNewIds_${currentUserId}`;
    localStorage.setItem(storageKey, JSON.stringify(combinedIds));
  };

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
        
        // Sorting
        const sortedItems = mappedItems.sort((a, b) => {
          if (!a.createdAt && !b.createdAt) return 0;
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Filter: You can add Backend Role Filtering logic here if needed
        // For example: if (u.targetRole && u.targetRole !== userRole) return false;
        
        if (!updateCountOnly) {
          setWhatsNewItems(sortedItems);
        }
        setWhatsNewCount(sortedItems.length);
      }
    } catch (apiErr) {
      if (!updateCountOnly) {
        setWnError("Failed to load updates. Please try again.");
      }
    } finally {
      if (!updateCountOnly) {
        setWnLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchWhatsNew();
  }, []);

  // Calculate unread count (User Specific)
  const unreadCount = whatsNewItems.filter(
    (item) => !readUpdateIds.includes(item.id)
  ).length;

  const handleWhatsNewClick = () => {
    setShowWhatsNew(true);
    fetchWhatsNew(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchWhatsNew(true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  /* ---------------------- Search Logic ---------------------- */

  // Advanced Search Functions from layout.tsx
  const escapeReg = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const clearHighlights = (root) => {
    if (!root) return;
    const marks = root.querySelectorAll("mark.__hl");
    marks.forEach((m) => {
      const parent = m.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(m.textContent || ""), m);
        parent.normalize();
      }
    });
  };

  const applyHighlights = (root, term) => {
    if (!root || !term) return;
    const safeTerm = escapeReg(term);
    const rx = new RegExp(safeTerm, "gi");

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);

    const skipTags = new Set([
      "SCRIPT",
      "STYLE",
      "NOSCRIPT",
      "MARK",
      "INPUT",
      "TEXTAREA",
      "DIALOG",
    ]);

    const skipSelectors = [
      '[role="dialog"]',
      '[aria-modal="true"]',
      ".modal",
      ".dialog",
      ".MuiModal-root",
      '[data-state="open"]',
      "dialog[open]",
    ];

    let nodes = [];
    let node;

    while ((node = walker.nextNode())) {
      const textNode = node;
      const el = textNode.parentElement;

      if (!el) continue;
      if (skipTags.has(el.tagName)) continue;

      const isInModal = skipSelectors.some((selector) => {
        return el.closest(selector) !== null;
      });

      if (isInModal) continue;

      const style = window.getComputedStyle(el);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.opacity === "0"
      ) {
        continue;
      }

      let parent = el.parentElement;
      let isHidden = false;
      while (parent && parent !== root) {
        const parentStyle = window.getComputedStyle(parent);
        if (
          parentStyle.display === "none" ||
          parentStyle.visibility === "hidden"
        ) {
          isHidden = true;
          break;
        }
        parent = parent.parentElement;
      }

      if (isHidden) continue;

      if (textNode.nodeValue?.trim()) {
        nodes.push(textNode);
      }
    }

    let count = 0;

    nodes.forEach((textNode) => {
      const text = textNode.nodeValue || "";
      const matches = [...text.matchAll(rx)];
      if (matches.length === 0) return;

      const frag = document.createDocumentFragment();
      let lastIndex = 0;

      matches.forEach((m) => {
        const start = m.index;
        const end = start + m[0].length;

        if (start > lastIndex) {
          frag.appendChild(
            document.createTextNode(text.slice(lastIndex, start))
          );
        }

        const mark = document.createElement("mark");
        mark.className = "__hl";

        if (count === currentHighlightIndex) {
          mark.style.backgroundColor = "#f59e0b";
          mark.style.color = "#000000";
          mark.style.fontWeight = "bold";
          mark.style.boxShadow = "0 0 0 2px #d97706";
        } else {
          mark.style.backgroundColor = "yellow";
          mark.style.color = "#000000";
          mark.style.fontWeight = "normal";
        }

        mark.style.padding = "2px 1px";
        mark.style.borderRadius = "3px";
        mark.style.cursor = "pointer";

        mark.textContent = m[0];
        frag.appendChild(mark);

        lastIndex = end;
        count++;
      });

      if (lastIndex < text.length) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      }

      textNode.replaceWith(frag);
    });

    setHighlightCount(count);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        navigateToHighlight("prev");
      } else {
        navigateToHighlight("next");
      }
    }
  };

  const navigateToHighlight = (direction = "next") => {
    if (highlightCount === 0) return;

    let newIndex;
    if (direction === "next") {
      newIndex = (currentHighlightIndex + 1) % highlightCount;
    } else {
      newIndex = (currentHighlightIndex - 1 + highlightCount) % highlightCount;
    }

    setCurrentHighlightIndex(newIndex);
    scrollToHighlight(newIndex);
  };

  const scrollToHighlight = (index) => {
    const marks = document.querySelectorAll("mark.__hl");
    if (marks && marks[index]) {
      const targetMark = marks[index];
      targetMark.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  // Main Highlighting Effect
  useEffect(() => {
    const runSearch = () => {
      const root = document.body;
      if (!root) return;

      const term = searchTerm.trim();

      if (!term) {
        clearHighlights(root);
        setHighlightCount(0);
        setCurrentHighlightIndex(0);
        return;
      }
      clearHighlights(root);
      applyHighlights(root, term);
    };

    const timer1 = setTimeout(() => {
      runSearch();
    }, 300);

    const timer2 = setTimeout(() => {
      if (searchTerm.trim()) {
        runSearch();
      }
    }, 1500);

    const timer3 = setTimeout(() => {
      if (searchTerm.trim()) {
        runSearch();
      }
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [searchTerm, currentHighlightIndex]);

  // Reset highlight index on navigation
  useEffect(() => {
    setCurrentHighlightIndex(0);
  }, [window.location.pathname]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === "ArrowDown" &&
        currentHighlightIndex < highlightCount - 1
      ) {
        setCurrentHighlightIndex(currentHighlightIndex + 1);
        scrollToHighlight(currentHighlightIndex + 1);
      }

      if (event.key === "ArrowUp" && currentHighlightIndex > 0) {
        setCurrentHighlightIndex(currentHighlightIndex - 1);
        scrollToHighlight(currentHighlightIndex - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentHighlightIndex, highlightCount]);

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
    // Do NOT remove readWhatsNewIds_USERID so preferences persist on next login
    window.location.href = "/login";
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key === "k") || (e.altKey && e.key === "s")) {
        e.preventDefault();
        const searchInput = document.getElementById("global-search-input");
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="bg-white w-full text-gray-800 px-2 sm:px-4 md:px-6 py-2 sm:py-3 flex items-center justify-between shadow-sm sticky top-0 z-50">
        {/* Left Side - Hamburger Button */}
        <div className="flex items-center">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200 mr-2"
            aria-label="Toggle Menu"
            title="Toggle Menu"
          >
            {isSidebarOpen ? (
              <FaTimes className="text-gray-600 text-lg" />
            ) : (
              <TbLayoutSidebarLeftCollapse className="text-gray-600 text-xl" />
            )}
          </button>
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
              onKeyDown={handleSearchKeyDown}
              placeholder="Search anything on this page..."
              id="global-search-input"
              className="w-full pl-8 sm:pl-10 pr-16 sm:pr-32 py-2 sm:py-2.5 rounded-full bg-gray-100 text-xs sm:text-sm placeholder-gray-500 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all duration-200"
              autoComplete="off"
              spellCheck="false"
            />
            <div className="absolute inset-y-0 right-2 sm:right-3 flex items-center gap-1 sm:gap-2">
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setHighlightCount(0);
                    setCurrentHighlightIndex(0);
                  }}
                  className="text-gray-500 hover:text-gray-700 flex-shrink-0 transition-colors duration-200"
                  aria-label="Clear search"
                  title="Clear search"
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
                Alt + S
              </span>
              {highlightCount > 0 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => navigateToHighlight("prev")}
                    className="text-xs text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200"
                    title="Previous match (Shift+Enter)"
                  >
                    ↑
                  </button>
                  <span className="text-[10px] sm:text-xs text-gray-500 bg-gray-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-medium min-w-[30px] text-center">
                    {currentHighlightIndex + 1}/{highlightCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => navigateToHighlight("next")}
                    className="text-xs text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200"
                    title="Next match (Enter)"
                  >
                    ↓
                  </button>
                </div>
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
            <span className="hidden md:flex bg-indigo-600 text-white text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-full hover:opacity-90 items-center gap-1 sm:gap-2">
              <FaStar className="text-yellow-300 text-xs sm:text-sm" />
              <span className="hidden lg:inline">What's New</span>
              <span className="lg:hidden">New</span>
            </span>
            <div className="md:hidden relative">
              <span className="bg-indigo-600 rounded-full px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-indigo-700 flex items-center">
                <HiSparkles className="text-yellow-400 text-sm sm:text-base" />
              </span>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-20">
                What's New
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
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
            title="Notifications"
          >
            <FaBell className="text-gray-600 text-base sm:text-lg" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center font-bold">
                {notificationCount > 99 ? "99+" : notificationCount}
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
                {isAdmin && (
                  <button
                    onClick={() => {
                      setShowSettings(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 hover:bg-purple-50 text-gray-700 flex items-center gap-2 sm:gap-3 transition-colors duration-150 text-sm sm:text-base"
                  >
                    <FaUserShield className="text-gray-500 flex-shrink-0 text-sm sm:text-base" />
                    <span>Permissions</span>
                  </button>
                )}
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
        readIds={readUpdateIds}
        onMarkRead={handleMarkAsRead}
        onMarkAllRead={handleMarkAllAsRead}
      />

      {/* Settings Modal */}
      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
};

export default Header;