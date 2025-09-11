import React, { useState, useEffect } from "react";
import { FaStickyNote, FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import NoteContainer from "./NoteContainer";
import { createPortal } from "react-dom";

const API_BASE = "https://taskbe.sharda.co.in/api/stickynotes"; // Change as needed

// At the top of your file
const COLOR_OPTIONS = [
  "#fffde7", // Light yellow
  "#e1f5fe", // Light blue
  "#e8f5e9", // Light green
  "#fce4ec", // Light pink
  "#f3e5f5", // Light violet
  "#fbe9e7", // Light orange
];

const StickyNotes = ({ onClose }) => {
  const [notes, setNotes] = useState([]);
  const [creating, setCreating] = useState(false);


  // Returns a random color from the palette
  function getRandomColor() {
    return COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
  }

  // Create a note
  const createNote = async () => {
    setCreating(true);
    const randomColor = getRandomColor();
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ content: "", color: randomColor }),
    });
    const newNote = await res.json();
    setNotes((notes) => [...notes, newNote]);
    setCreating(false);
  };

  // Update note


  // Delete note

  // Slide-in animation classes
  // Optionally use a state for controlling animation if you want more fancy open/close

return createPortal(
  <div className="fixed inset-0 z-[2147483645]">
      {/* Overlay with subtle blur effect */}
      <div
  className="fixed inset-0 bg-slate-900/50 z-[2147483646]"
  onClick={onClose}
/>
      {/* Drawer */}
      <div
     className={`
       fixed right-0 top-0 h-full
    w-full sm:w-[380px] md:w-[420px] max-w-[100vw]
    bg-gradient-to-b from-slate-50 to-white
    border-l border-slate-200
    shadow-xl z-[2147483647]
    sm:rounded-l-2xl
    transform transition-transform duration-300 ease-in-out
    translate-x-0 flex flex-col
     
     `}
     onClick={(e) => e.stopPropagation()}
   >
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center rounded-tl-none sm:rounded-tl-2xl">

          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FaStickyNote className="text-yellow-400" />
            Sticky Notes
          </h2>
          <button
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Notes Container */}
       <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-4">
  <NoteContainer />
</div>
        {/* Footer */}
<<<<<<< HEAD
        <div className="border-t border-gray-100 px-6 py-4">
          <button
            className="w-full bg-yellow-500 hover:bg-yellow-300 text-yellow-900 font-medium px-4 py-3 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            disabled={creating}
            onClick={createNote}
          >
            <FaPlus />
            Add New Note
          </button>
        </div>
=======
        <div className="bg-slate-50 border-t border-slate-200 px-4 sm:px-6 py-3 rounded-bl-none sm:rounded-bl-2xl">
  <button
    onClick={createNote}
    disabled={creating}
    className="w-full inline-flex items-center justify-center gap-2
               px-4 py-3 rounded-lg font-medium
               bg-amber-400 text-amber-900 shadow-sm
               transition-colors duration-200
               hover:bg-amber-300
               focus:outline-none focus:ring-2 focus:ring-amber-500
               disabled:opacity-60 disabled:cursor-not-allowed"
  >
    <FaPlus className="shrink-0" />
    {creating ? "Adding..." : "Add New Note"}
  </button>
</div>
>>>>>>> 9c6fa57ae2527e4bf1be25c92de3c1a39ec9bce9
      </div>
    </div>,
    document.body
  );
};

export default StickyNotes;
