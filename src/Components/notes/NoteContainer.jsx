import React, { useState, useRef } from "react";
import { FaTrash, FaThumbtack } from "react-icons/fa";
import QuillEditor from "./QuillEditor";
import debounce from "lodash.debounce";

function NoteContainer({ notes = [], setNotes, pinNote, deleteNote }) {
  const [draggingId, setDraggingId] = useState(null);
  const dragOverIdRef = useRef(null);

  // Debounced update function
  const updateNote = React.useCallback(
    debounce(async (id, content) => {
      await fetch(`https://taskbe.sharda.co.in/api/stickynotes/${id}`, {
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

  // Function to start dragging
  const onDragStart = (e, id) => {
    // Prevent dragging if text is selected
    if (window.getSelection().toString()) {
      e.preventDefault(); // Prevent drag behavior if text is selected
      return;
    }
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  // const onDragOver = (e, overId) => {
  //   e.preventDefault();
  //   dragOverIdRef.current = overId;
  // };

  const onDrop = (e) => {
    e.preventDefault();
    const fromId = draggingId;
    const toId = dragOverIdRef.current;
    setDraggingId(null);
    dragOverIdRef.current = null;
    if (!fromId || !toId || fromId === toId) return;

    setNotes((prev) => {
      const ordered = reorderByIds(prev, fromId, toId);
      return ordered;
    });
  };

  const onDragEnd = () => {
    setDraggingId(null);
    dragOverIdRef.current = null;
  };

  // Reorder notes by IDs after drag/drop
  const reorderByIds = (list, fromId, toId) => {
    if (fromId === toId) return list;

    const fromIdx = list.findIndex((n) => n._id === fromId);
    const toIdx = list.findIndex((n) => n._id === toId);

    if (fromIdx === -1 || toIdx === -1) return list;

    const updated = [...list];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);

    return updated;
  };

  // Handle pin/unpin functionality
  const pinNoteHandler = (id) => {
    pinNote(id);
    setNotes((prevNotes) => {
      // Separate pinned and unpinned notes
      const pinnedNotes = prevNotes.filter((note) => note.pinned);
      const unpinnedNotes = prevNotes.filter((note) => !note.pinned);

      // Ensure pinned notes are at the top
      return [...pinnedNotes, ...unpinnedNotes];
    });
  };

  return (
    <div
      className="flex-1 overflow-y-auto px-2 py-2 space-y-4"
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {notes.length > 0 ? (
        notes.map((note) => {
          const isDragging = draggingId === note._id;
          return (
            <div
              key={note._id}
              className={[
                "bg-yellow-100 rounded-xl shadow-sm border border-yellow-100 hover:shadow-md transition-shadow relative group",
                isDragging ? "opacity-70 ring-2 ring-yellow-400 select-none" : "",
              ].join(" ")}
            >
              {/* Pin button (drag handle) */}
              <button
                className={`absolute top-[-5px] left- transition-opacity ${note.pinned ? "text-black" : "text-yellow-500"
                  }`}
                draggable
                onDragStart={(e) => onDragStart(e, note._id)} // Trigger pin drag here
                onClick={() => pinNoteHandler(note._id)} // Trigger pin
              >
                <FaThumbtack />
              </button>

              {/* Delete button */}
              <button
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
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
        })
      ) : (
        <p>No notes available.</p> // Display this message if notes array is empty
      )}
    </div>
  );
}

export default NoteContainer;
