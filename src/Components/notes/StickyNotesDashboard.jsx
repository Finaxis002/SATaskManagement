import React, { useState, useEffect } from "react";
import { FaStickyNote, FaPlus } from "react-icons/fa";
import NoteContainer from "./NoteContainer";

const API_BASE = "https://taskbe.sharda.co.in/api/stickynotes";

const StickyNotesDashboard = () => {
  const [notes, setNotes] = useState([]);
  const [creating, setCreating] = useState(false);

  const token = localStorage.getItem("authToken");

  // Fetch all notes on mount
  const fetchNotes = async () => {
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!Array.isArray(data)) return setNotes([]);

      // Load pinned notes from localStorage
      const storedPinnedNotes = JSON.parse(localStorage.getItem("pinnedNotes")) || [];

      const updatedNotes = data.map((note) => ({
        ...note,
        pinned: storedPinnedNotes.includes(note._id),
      }));

      // Separate pinned and unpinned notes
      const pinnedNotes = updatedNotes.filter((note) => note.pinned);
      const unpinnedNotes = updatedNotes.filter((note) => !note.pinned);

      // Set notes with pinned notes on top
      setNotes([...pinnedNotes, ...unpinnedNotes]);
    } catch {
      setNotes([]);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Create a new note (optimistic rendering)
  const createNote = async () => {
    setCreating(true);

    // Create a temporary note for instant display
    const tempNote = {
      _id: `temp-${Date.now()}`, // temporary unique ID
      content: "",
      color: "#fffde7",
      pinned: false,
    };

    setNotes((prev) => [...prev, tempNote]);

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: "", color: "#fffde7" }),
      });

      const newNote = await res.json();

      // Replace temporary note with actual note from backend
      setNotes((prev) =>
        prev.map((n) => (n._id === tempNote._id ? newNote : n))
      );
    } catch (err) {
      // Remove temporary note if API call fails
      setNotes((prev) => prev.filter((n) => n._id !== tempNote._id));
      console.error("Failed to create note:", err);
    } finally {
      setCreating(false);
    }
  };

  // Pin or unpin a note
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
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotes((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <div className="bg-yellow-200 rounded-xl shadow-lg border border-yellow-100 p-2 py-4 w-full max-w-xl relative hidden md:block">
      {/* Header */}
      <div className="flex items-center justify-between px-4">
        <h2 className="text-xl font-bold text-yellow-900 flex items-center gap-2">
          <FaStickyNote className="text-yellow-400" />
          Sticky Notes
        </h2>
        <button
          className="bg-yellow-400 hover:bg-yellow-300 border border-amber-400 text-yellow-900 px-3 py-1 rounded-lg shadow-sm transition-all flex items-center gap-2"
          disabled={creating}
          onClick={createNote}
        >
          <FaPlus />
          New
        </button>
      </div>

      {/* Notes - Hidden on mobile (phone) views */}
      <div className="mt-4 hidden sm:block">
        <NoteContainer notes={notes} setNotes={setNotes} pinNote={pinNote} deleteNote={deleteNote} />
      </div>
    </div>
  );
};

export default StickyNotesDashboard;
