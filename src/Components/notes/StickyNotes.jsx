// StickyNotes
import React, { useState, useEffect } from "react";
import { FaStickyNote, FaTimes, FaPlus, FaTrash, FaThumbtack } from "react-icons/fa";
import NoteContainer from "./NoteContainer";

const API_BASE = "https://taskbe.sharda.co.in/api/stickynotes"; // Change as needed

const COLOR_OPTIONS = [
  "#fffde7", // Light yellow
  "#e1f5fe", // Light blue
  "#e8f5e9", // Light green
  "#fce4ec", // Light pink
  "#f3e5f5", // Light violet
  "#fbe9e7", // Light orange
];

const StickyNotes = ({ onClose }) => {
  const [notes, setNotes] = useState([]);  // Initialize notes state
  const [creating, setCreating] = useState(false);

  // Fetch existing notes when the component mounts
  useEffect(() => {
    const fetchNotes = async () => {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
      });
      const data = await res.json();

      // Load pinned notes from localStorage
      const storedPinnedNotes = JSON.parse(localStorage.getItem("pinnedNotes")) || [];

      const updatedNotes = data.map((note) => ({
        ...note,
        pinned: storedPinnedNotes.includes(note._id), // Mark notes as pinned based on localStorage
      }));

      // Separate pinned and unpinned notes
      const pinnedNotes = updatedNotes.filter((note) => note.pinned);
      const unpinnedNotes = updatedNotes.filter((note) => !note.pinned);

      setNotes([...pinnedNotes, ...unpinnedNotes]); // Set notes with pinned notes on top
    };

    fetchNotes();
  }, []);

  // Returns a random color from the palette
  function getRandomColor() {
    return COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
  }

  // Create a new note
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

  // Pin a note
  const pinNote = (id) => {
    setNotes((prevNotes) => {
      const updatedNotes = prevNotes.map((note) =>
        note._id === id ? { ...note, pinned: !note.pinned } : note
      );

      // Separate pinned and unpinned notes
      const pinnedNotes = updatedNotes.filter((note) => note.pinned);
      const unpinnedNotes = updatedNotes.filter((note) => !note.pinned);

      // Ensure pinned notes are at the top
      const reorderedNotes = [...pinnedNotes, ...unpinnedNotes];

      // Save pinned note IDs to localStorage
      const pinnedNoteIds = pinnedNotes.map((note) => note._id);
      localStorage.setItem("pinnedNotes", JSON.stringify(pinnedNoteIds)); // Save pinned note IDs to localStorage

      return reorderedNotes;
    });
  };

  // Delete a note
  const deleteNote = async (id) => {
    await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
    });
    setNotes((prevNotes) => prevNotes.filter((note) => note._id !== id));
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay with subtle blur effect */}
      <div className="fixed inset-0 bg-black/40 " onClick={onClose} />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-[420px] max-w-full
        bg-white shadow-2xl z-50
        transform transition-transform duration-300 ease-in-out
        translate-x-0 flex flex-col`}
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
        <NoteContainer
          notes={notes}
          setNotes={setNotes}
          pinNote={pinNote}
          deleteNote={deleteNote}
        />

        {/* Footer */}
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
      </div>
    </div>
  );
};

export default StickyNotes;
