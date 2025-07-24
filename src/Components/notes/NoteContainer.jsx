import React, { useState, useEffect } from "react";
import QuillEditor from "./QuillEditor";
import { FaTrash } from "react-icons/fa";
import debounce from "lodash.debounce";

const API_BASE = "https://taskbe.sharda.co.in/api/stickynotes";
function NoteContainer({}) {
  const [notes, setNotes] = useState([]);

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

  return (
    <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
      {notes.map((note) => (
        <div
          key={note._id}
          className="bg-yellow-100 rounded-xl shadow-sm border border-yellow-100 hover:shadow-md transition-shadow relative group"
        >
          <QuillEditor
            value={note.content}
            onChange={(content) => {
              updateNote(note._id, content); // Update note on change
            }}
          />
          <button
            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
            onClick={() => deleteNote(note._id)} // Delete note
            title="Delete"
          >
            <FaTrash className="text-xs" />
          </button>
        </div>
      ))}
    </div>
  );
}

export default NoteContainer;
