import React, { useState, useEffect, useRef } from "react";
import QuillEditor from "./QuillEditor";
import { FaTrash } from "react-icons/fa";
import debounce from "lodash.debounce";

const API_BASE = "https://taskbe.sharda.co.in/api/stickynotes";

function NoteContainer({}) {
  const [notes, setNotes] = useState([]);
  const [draggingId, setDraggingId] = useState(null);
  const dragOverIdRef = useRef(null);

  useEffect(() => {
    fetch(API_BASE, {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized or API error");
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) return setNotes([]);
        const sorted = [...data].sort((a, b) => {
          const ao = typeof a.order === "number" ? a.order : 0;
          const bo = typeof b.order === "number" ? b.order : 0;
          return ao - bo;
        });
        setNotes(sorted);
      })
      .catch(() => setNotes([]));
  }, []);

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
    }, 400),
    []
  );

  const deleteNote = async (id) => {
    await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` },
    });
    setNotes((prev) => prev.filter((n) => n._id !== id));
  };

  const reorderByIds = (list, fromId, toId) => {
    if (fromId === toId) return list;
    const fromIdx = list.findIndex((n) => n._id === fromId);
    const toIdx = list.findIndex((n) => n._id === toId);
    if (fromIdx === -1 || toIdx === -1) return list;

    const updated = [...list];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);

    return updated.map((n, i) => ({ ...n, order: i }));
  };

  const persistOrder = async (ordered) => {
    // Optional: call your backend if you add a /reorder route
    // await fetch(`${API_BASE}/reorder`, { ... });
  };

  // DnD handlers
  const onDragStart = (e, id) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id); // Firefox support
  };

  const onDragOver = (e, overId) => {
    e.preventDefault();
    dragOverIdRef.current = overId;
  };

  const onDrop = (e) => {
    e.preventDefault();
    const fromId = draggingId;
    const toId = dragOverIdRef.current;
    setDraggingId(null);
    dragOverIdRef.current = null;
    if (!fromId || !toId || fromId === toId) return;

    setNotes((prev) => {
      const ordered = reorderByIds(prev, fromId, toId);
      persistOrder(ordered);
      return ordered;
    });
  };

  const onDragEnd = () => {
    setDraggingId(null);
    dragOverIdRef.current = null;
  };

  return (
    <div
      className="flex-1 overflow-y-auto px-2 py-2 space-y-4"
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {notes.map((note) => {
        const isDragging = draggingId === note._id;

        return (
          <div
            key={note._id}
            draggable
            onDragStart={(e) => onDragStart(e, note._id)}
            onDragOver={(e) => onDragOver(e, note._id)}
            className={[
              "bg-yellow-100 rounded-xl shadow-sm border border-yellow-100 hover:shadow-md transition-shadow relative group",
              isDragging ? "opacity-70 ring-2 ring-yellow-400 select-none" : "",
            ].join(" ")}
          >
            {/* Delete button (won't start drag) */}
                        <button
              className="absolute -top-2 -right-2 opacity-100 transition-opacity bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                deleteNote(note._id);
              }}
              draggable={false}
              title="Delete"
            >
              <FaTrash className="text-xs" />
            </button>

            {/* Editor */}
            <div className="px-3 py-3">
              <QuillEditor
                value={note.content}
                onChange={(content) => updateNote(note._id, content)}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default NoteContainer;
