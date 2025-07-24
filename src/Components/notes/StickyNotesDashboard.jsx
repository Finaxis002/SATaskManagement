import React, { useState, useEffect } from "react";
import { FaStickyNote, FaPlus, FaTrash } from "react-icons/fa";
import debounce from "lodash.debounce";
import QuillEditor from "./QuillEditor";

const API_BASE = "https://taskbe.sharda.co.in/api/stickynotes";

const StickyNotesDashboard = () => {
  const [notes, setNotes] = useState([]);
  const [creating, setCreating] = useState(false);

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
      <div
        className="space-y-3 relative overflow-y-auto"
        style={{ maxHeight: "52vh" }}
      >
        {notes.length === 0 ? (
          <div className="text-sm text-gray-500">No notes yet.</div>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              className="relative bg-yellow-100 rounded-lg border border-yellow-100 shadow-sm hover:shadow-md transition flex items-center"
            >
              {/* <textarea
                className="w-full resize-none p-3 bg-transparent outline-none text-gray-700 rounded-lg font-normal"
                rows={Math.max(2, note.content.split("\n").length)}
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
              /> */}

              <QuillEditor
                value={note.content}
                onChange={(content) => {
                  setNotes((prevNotes) =>
                    prevNotes.map((n) =>
                      n._id === note._id ? { ...n, content } : n
                    )
                  );
                  updateNote(note._id, content);
                }}
              />

              <button
                className="absolute right-2 top-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow"
                onClick={() => deleteNote(note._id)}
                title="Delete"
              >
                <FaTrash className="text-xs" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StickyNotesDashboard;
