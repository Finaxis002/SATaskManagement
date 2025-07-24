import React, { useState, useEffect } from "react";
import { FaStickyNote, FaPlus, FaSync } from "react-icons/fa";
import NoteContainer from "./NoteContainer";

const API_BASE = "https://taskbe.sharda.co.in/api/stickynotes";

const StickyNotesDashboard = () => {
  const [notes, setNotes] = useState([]);
  const [creating, setCreating] = useState(false);

  const token = localStorage.getItem("authToken");

  console.log("token : ", token);

  // Create a note
  const createNote = async () => {
    setCreating(true);
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ content: "", color: "#fffde7" }),
    });
    const newNote = await res.json();
    setNotes((notes) => [...notes, newNote]);
    setCreating(false);
  };

  return (
    <div className="bg-yellow-50 rounded-xl shadow-lg border border-yellow-100 p-5 w-full max-w-xl  relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-bold text-yellow-900 flex items-center gap-2">
          <FaStickyNote className="text-yellow-400" />
          Sticky Notes
        </h2>
        <button
          className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 px-3 py-1 rounded-lg shadow-sm transition-all flex items-center gap-2"
          disabled={creating}
          onClick={createNote}
        >
          <FaPlus />
          New
        </button>
      </div>
      {/* Notes */}
      <NoteContainer />
    </div>
  );
};

export default StickyNotesDashboard;
