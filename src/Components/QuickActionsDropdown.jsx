import React, { useState, useRef, useEffect } from "react";
import {
  FaRegStickyNote,
  FaBell,
  FaInbox,
  FaClock,
  FaEnvelope,
  FaTh,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useMessageSocket from "../hook/useMessageSocket";

const QuickActionsDropdown = ({
  onShowNotes,
  onShowInbox,
  onShowReminders,
}) => {
  const [open, setOpen] = useState(false);
  const [inboxCount, setInboxCount] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const ref = useRef();
  const navigate = useNavigate();
  useMessageSocket(setInboxCount);

  // Check screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      {/* Main button - Different icon for mobile */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative bg-gray-100 rounded-full p-2 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all duration-200"
        aria-label="Quick Actions"
      >
        {isMobile ? (
          // Different icon for mobile (grid icon)
          <FaTh className="text-gray-600 text-lg" />
        ) : (
          // Original icon for desktop
          <FaRegStickyNote className="text-gray-600 text-lg" />
        )}
        {inboxCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 py-0 rounded-full shadow-lg">
            {inboxCount}
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {isMobile ? (
            // Mobile view options
            <>
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 transition"
                onClick={() => {
                  setOpen(false);
                  navigate("/notifications");
                }}
              >
                <FaBell className="text-purple-400" /> Notifications
              </button>
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition relative"
                onClick={() => {
                  setOpen(false);
                  navigate("/inbox");
                }}
              >
                <FaInbox className="text-indigo-400" /> Inbox
                {inboxCount > 0 && (
                  <span className="absolute right-3 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {inboxCount}
                  </span>
                )}
              </button>
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
                onClick={() => {
                  setOpen(false);
                  navigate("/reminders");
                }}
              >
                <FaClock className="text-blue-400" /> Reminders
              </button>
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 transition"
                onClick={() => {
                  setOpen(false);
                  navigate("/mailbox");
                }}
              >
                <FaEnvelope className="text-yellow-400" /> Mailbox
              </button>
            </>
          ) : (
            // Desktop view options (original)
            <>
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 transition"
                onClick={() => {
                  setOpen(false);
                  onShowNotes();
                }}
              >
                <FaRegStickyNote className="text-yellow-400" /> Notes
              </button>
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition relative"
                onClick={() => {
                  setOpen(false);
                  navigate("/inbox");
                }}
              >
                <FaInbox className="text-indigo-400" /> Inbox
                {inboxCount > 0 && (
                  <span className="absolute right-3 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {inboxCount}
                  </span>
                )}
              </button>
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
                onClick={() => {
                  setOpen(false);
                  navigate("/reminders");
                }}
              >
                <FaClock className="text-blue-400" /> Reminders
              </button>
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50 transition"
                onClick={() => {
                  setOpen(false);
                  navigate("/mailbox");
                }}
              >
                <FaEnvelope className="text-yellow-400" /> Mailbox
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default QuickActionsDropdown;
