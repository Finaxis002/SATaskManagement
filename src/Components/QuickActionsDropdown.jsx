import React, { useState, useRef, useEffect } from "react";
import {
  FaRegStickyNote,
  FaBell,
  FaInbox,
  FaClock,
  FaEnvelope,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import useMessageSocket from "../hook/useMessageSocket";

// This component receives open modals as props, or you can handle here
const QuickActionsDropdown = ({
  onShowNotes,
  onShowInbox,
  onShowReminders,
}) => {
  const [open, setOpen] = useState(false);
  const [inboxCount, setInboxCount] = useState(0);
  const ref = useRef();
  const navigate = useNavigate();
  useMessageSocket(setInboxCount);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function MailBoxEmbed() {
    return (
      <iframe
        src="https://mailbox.sharda.co.in/"
        style={{ width: "100%", height: "100vh", border: "none" }}
        title="Mailbox"
      />
    );
  }

  return (
    <div className="relative" ref={ref}>
      {/* Main button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative bg-gray-100 rounded-full p-2 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all duration-200"
        aria-label="Quick Actions"
      >
        <FaRegStickyNote className="text-gray-600 text-lg" />
        {inboxCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 py-0 rounded-full shadow-lg">
            {inboxCount}
          </span>
        )}
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
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
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 transition"
            onClick={() => {
              setOpen(false); // <-- Add this line
              navigate("/inbox");
            }}
          >
            <FaInbox className="text-indigo-400" /> Inbox
            {inboxCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 py-0 rounded-full shadow-lg">
                {inboxCount}
              </span>
            )}
          </button>
          <button
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition"
            onClick={() => {
              setOpen(false); // <-- Add this line
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
        </div>
      )}
    </div>
  );
};

export default QuickActionsDropdown;