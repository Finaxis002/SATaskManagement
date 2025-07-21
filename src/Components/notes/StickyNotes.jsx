import React, { useState, useEffect } from "react";
import { FaStickyNote, FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import debounce from "lodash.debounce";

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
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);

  // Fetch all notes
  useEffect(() => {
    fetch(API_BASE, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized or API error");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setNotes(data);
        else setNotes([]);
      })
      .catch(() => setNotes([]));
  }, []);

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
  const updateNote = React.useCallback(
    debounce(async (id, content) => {
      await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ content }),
      });
    }, 400), // 400ms debounce
    []
  );

  // Delete note
  const deleteNote = async (id) => {
    await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    });
    setNotes((notes) => notes.filter((n) => n._id !== id));
  };

  // Slide-in animation classes
  // Optionally use a state for controlling animation if you want more fancy open/close

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay with subtle blur effect */}
      <div className="fixed inset-0 bg-black/40 " onClick={onClose} />

      {/* Drawer */}
      <div
        className={`
      fixed right-0 top-0 h-full w-[420px] max-w-full
      bg-white shadow-2xl z-50
      transform transition-transform duration-300 ease-in-out
      translate-x-0 flex flex-col
    `}
      >
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
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
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {notes.map((note) => (
            <div
              key={note._id}
              className="bg-yellow-50 rounded-xl p-4 shadow-sm border border-yellow-100 hover:shadow-md transition-shadow relative group"
            >
              <textarea
                className="w-full resize-none p-1 bg-transparent outline-none text-gray-700 rounded-lg font-normal"
                rows={Math.max(1, note.content.split("\n").length)}
                value={note.content}
                onChange={(e) => {
                  setNotes((notes) =>
                    notes.map((n) =>
                      n._id === note._id ? { ...n, content: e.target.value } : n
                    )
                  );
                  updateNote(note._id, e.target.value);
                }}
                placeholder="Write your note here..."
              />
              <button
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
                onClick={() => deleteNote(note._id)}
                title="Delete"
              >
                <FaTrash className="text-xs" />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4">
          <button
            className="w-full bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-medium px-4 py-3 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            disabled={creating}
            onClick={createNote}
          >
            <FaPlus />
            Add New Note
          </button>
        </div>
      </div>
    </div>
  );
};

export default StickyNotes;
