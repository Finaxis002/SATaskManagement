import React, { useState } from "react";
import { FaThumbtack, FaTrash } from "react-icons/fa";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

const API_BASE = "https://taskbe.sharda.co.in/api/stickynotes";

const QuillEditor = ({ value, onChange }) => {
  const { quill, quillRef } = useQuill({
    modules: {
      toolbar: {
        container: [
          [{ color: [] }, { background: [] }, { list: "ordered" }, { list: "bullet" }],
          ["bold", "italic", "underline", "strike", "link"]
        ],
      },
    },
  });

  React.useEffect(() => {
    if (quill) {
      const toolbar = quill.getModule("toolbar");

      toolbar.addHandler("list", function (value) {
        if (value === "ordered") {
          quill.format("list", false);
          quill.format("list", "ordered");
        } else if (value === "bullet") {
          quill.format("list", false);
          quill.format("list", "bullet");
        } else {
          quill.format("list", false);
        }
      });

      quill.on("text-change", () => {
        const htmlContent = quill.root.innerHTML;
        if (htmlContent !== value) {
          onChange(htmlContent);
        }
      });

      if (value && quill.root.innerHTML !== value) {
        quill.clipboard.dangerouslyPasteHTML(value || "");
      }
    }
  }, [quill, onChange, value]);

  return (
    <div className="w-full">
      <div ref={quillRef} />
    </div>
  );
};

const NoteContainer = ({ notes, setNotes, pinNote, deleteNote }) => {
  const [draggedNote, setDraggedNote] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null;

  // Update note content
  const updateNote = async (id, content) => {
    try {
      await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
    } catch (err) {
      console.error("Failed to update note:", err);
    }
  };

  // Handle drag start
  const handleDragStart = (e, note, index) => {
    setDraggedNote({ note, index });
    e.dataTransfer.effectAllowed = "move";
    e.target.style.opacity = "0.5";
  };

  // Handle drag end
  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
    setDraggedNote(null);
    setDragOverIndex(null);
  };

  // Handle drag over
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    if (draggedNote && draggedNote.index !== index) {
      setDragOverIndex(index);
    }
  };

  // Handle drop
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (!draggedNote || draggedNote.index === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    const newNotes = [...notes];
    const draggedItem = newNotes[draggedNote.index];
    
    // Remove from old position
    newNotes.splice(draggedNote.index, 1);
    
    // Insert at new position
    newNotes.splice(dropIndex, 0, draggedItem);
    
    setNotes(newNotes);
    setDragOverIndex(null);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
      {notes.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No notes yet. Create one!</p>
      ) : (
        notes.map((note, index) => (
          <div
            key={note._id}
            draggable
            onDragStart={(e) => handleDragStart(e, note, index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            className={`
              bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 shadow-sm 
              hover:shadow-md transition-all cursor-move relative
              ${dragOverIndex === index ? 'border-yellow-400 scale-105' : ''}
              ${note.pinned ? 'ring-2 ring-yellow-400' : ''}
            `}
            style={{ backgroundColor: note.color || "#fffde7" }}
          >
            {/* Pin & Delete Buttons */}
            <div className="flex justify-end gap-2 mb-2">
              <button
                className={`p-1.5 rounded transition-colors ${
                  note.pinned
                    ? "text-yellow-600 hover:text-yellow-700"
                    : "text-gray-400 hover:text-yellow-500"
                }`}
                onClick={() => pinNote(note._id)}
                title={note.pinned ? "Unpin note" : "Pin note"}
              >
                <FaThumbtack className={note.pinned ? "rotate-45" : ""} />
              </button>
              <button
                className="text-gray-400 hover:text-red-500 p-1.5 rounded transition-colors"
                onClick={() => deleteNote(note._id)}
                title="Delete note"
              >
                <FaTrash />
              </button>
            </div>

            {/* Quill Editor */}
            <QuillEditor
              value={note.content}
              onChange={(newContent) => {
                setNotes((prev) =>
                  prev.map((n) =>
                    n._id === note._id ? { ...n, content: newContent } : n
                  )
                );
                updateNote(note._id, newContent);
              }}
            />

            {/* Drag Handle Indicator */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              ⋮⋮
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NoteContainer;