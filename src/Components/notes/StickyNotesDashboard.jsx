import React, { useState, useEffect } from "react";
import { FaStickyNote, FaPlus } from "react-icons/fa";
import NoteContainer from "./NoteContainer";

const API_BASE = "https://taskbe.sharda.co.in/api/stickynotes";

const StickyNotesDashboard = () => {
  const [notes, setNotes] = useState([]);
  const [creating, setCreating] = useState(false);

  const token = localStorage.getItem("authToken");

  // Fetch all notes
  const fetchNotes = async () => {
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch {
      setNotes([]);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Create a note
  const createNote = async () => {
    setCreating(true);
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: "", color: "#fffde7" }),
    });
    const newNote = await res.json();
    setNotes((prev) => [...prev, newNote]); // ✅ update instantly
    setCreating(false);
  };

  // Delete note (passed to NoteContainer)
  const deleteNote = async (id) => {
    await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotes((prev) => prev.filter((n) => n._id !== id));
  };

  return (
    <div className="bg-yellow-200 rounded-xl shadow-lg border border-yellow-100 p-2 py-4 w-full max-w-xl relative">
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

      {/* Notes */}
       <div className=" ">
        <NoteContainer notes={notes} setNotes={setNotes} onDelete={deleteNote} />
      </div>
    </div>
  );
};

export default StickyNotesDashboard;
