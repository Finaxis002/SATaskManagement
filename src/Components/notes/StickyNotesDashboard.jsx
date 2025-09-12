
import React, { useRef, useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  List,
  ListOrdered,
  AlignLeft,
  Image,
  Copy,
} from "lucide-react";


export default function StickyNotesDashboard() {
  const [stickyNotes, setStickyNotes] = useState([
    { id: 1, content: "<p>Write your note here...</p>" },
  ]);

  const editorsRef = useRef({});
  const savedRangesRef = useRef({});

  const focusEditor = (id) => editorsRef.current[id]?.focus();


  const saveSelection = (id) => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRangesRef.current[id] = sel.getRangeAt(0);
  };

  const restoreSelection = (id) => {
    const range = savedRangesRef.current[id];
    if (!range) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const applyCommand = (id, command, value = null) => {
    focusEditor(id);
    restoreSelection(id);
    document.execCommand(command, false, value);
    // DOM already updated; just mirror to state (don’t re-inject HTML)
    const html = editorsRef.current[id]?.innerHTML ?? "";
    handleContentChange(id, html);
  };

  const addNewNote = () => {
    const newId = (stickyNotes[stickyNotes.length - 1]?.id || 0) + 1;
    const newNote = { id: newId, content: "<p>Write your new note here...</p>" };
    setStickyNotes((prev) => [...prev, newNote]);
    setTimeout(() => {
      const el = editorsRef.current[newId];
      if (el) {
        el.setAttribute("dir", "ltr");
        el.style.textAlign = "left";
        el.focus();
      }
    }, 0);
  };

  const copyContent = async (id) => {
    const html = stickyNotes.find((n) => n.id === id)?.content || "";
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const blob = new Blob([html], { type: "text/html" });
        const textBlob = new Blob([stripHtml(html)], { type: "text/plain" });
        await navigator.clipboard.write([
          new window.ClipboardItem({ "text/html": blob, "text/plain": textBlob }),
        ]);
      } else {
        await navigator.clipboard.writeText(stripHtml(html));
      }
      alert("Note copied!");
    } catch {
      alert("Copy failed. Your browser may block programmatic clipboard.");
    }
  };

  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const deleteNote = (id) => {
    setStickyNotes((prev) => prev.filter((n) => n.id !== id));
    delete editorsRef.current[id];
    delete savedRangesRef.current[id];
  };

  // ✅ state me HTML save karte hain, par editor me dobara set NHI karte
  const handleContentChange = (id, newHtml) => {
    setStickyNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, content: newHtml } : n))
    );
  };

  // 👉 innerHTML sirf first mount par set karne ke liye helper
  const setEditorRef = (el, id, initialHtml) => {
    if (!el) return;
    // store ref
    editorsRef.current[id] = el;
    // first-time init only
    if (!el.dataset.initialized) {
      el.innerHTML = initialHtml || "";
      el.dataset.initialized = "1";
      el.setAttribute("dir", "ltr");
      el.style.textAlign = "left";
    }
  };

  const handleKeyDown = (id, e) => {
    // Avoid Windows bidi toggle surprises
    if (e.ctrlKey && e.key === "Shift") {
      const el = editorsRef.current[id];
      if (el) {
        el.setAttribute("dir", "ltr");
        el.style.textAlign = "left";
      }
      e.preventDefault();
      return;
    }

    const meta = e.metaKey || e.ctrlKey;
    if (meta && e.key.toLowerCase() === "b") {
      e.preventDefault(); applyCommand(id, "bold");
    } else if (meta && e.key.toLowerCase() === "i") {
      e.preventDefault(); applyCommand(id, "italic");
    } else if (meta && e.key.toLowerCase() === "u") {
      e.preventDefault(); applyCommand(id, "underline");
    } else if (meta && e.key.toLowerCase() === "k") {
      e.preventDefault();
      const url = prompt("Enter URL:");
      if (url) applyCommand(id, "createLink", url);
    } else if (meta && e.shiftKey && e.key === "7") {
      e.preventDefault(); applyCommand(id, "insertOrderedList");
    } else if (meta && e.shiftKey && e.key === "8") {
      e.preventDefault(); applyCommand(id, "insertUnorderedList");
    }
  };

  return (
    <div className="rounded-xl shadow w-80 space-y-3">

      {/* Header */}
      <div className="flex justify-between items-center mb-2 bg-yellow-200 px-2 py-1 rounded-t-xl">
        <h3 className="text-sm font-medium">Sticky Notes</h3>
        <button

          onClick={addNewNote}
          className="p-1 hover:bg-yellow-300 rounded text-sm text-gray-700"
          title="Add new note"

        >
          + New
        </button>
      </div>
      {/* Notes */}

      {stickyNotes.map((note, index) => (
        <div key={note.id} className="p-3 bg-yellow-200 rounded-xl">
          {/* Note header */}
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Note {note.id}</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => copyContent(note.id)}
                className="p-1 hover:bg-yellow-300 rounded"
                title="Copy (HTML)"
              >
                <Copy size={14} />
              </button>
              {index > 0 && (
                <button
                  onClick={() => deleteNote(note.id)}
                  className="p-1 hover:bg-yellow-300 rounded text-xs text-red-600"
                  title="Delete note"
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex gap-3 text-gray-700 mb-2 text-sm">
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand(note.id, "bold")} className="hover:text-black" title="Bold (Ctrl/⌘+B)">
              <Bold size={14} />
            </button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand(note.id, "italic")} className="hover:text-black" title="Italic (Ctrl/⌘+I)">
              <Italic size={14} />
            </button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand(note.id, "underline")} className="hover:text-black" title="Underline (Ctrl/⌘+U)">
              <Underline size={14} />
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const url = prompt("Enter URL:");
                if (url) applyCommand(note.id, "createLink", url);
              }}
              className="hover:text-black"
              title="Insert link (Ctrl/⌘+K)"
            >
              <LinkIcon size={14} />
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const el = editorsRef.current[note.id];
                if (el) { el.setAttribute("dir", "ltr"); el.style.textAlign = "left"; }
                applyCommand(note.id, "justifyLeft");
              }}
              className="hover:text-black"
              title="Align left"
            >
              <AlignLeft size={14} />
            </button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand(note.id, "insertUnorderedList")} className="hover:text-black" title="Bullet list (Ctrl/⌘+Shift+8)">
              <List size={14} />
            </button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => applyCommand(note.id, "insertOrderedList")} className="hover:text-black" title="Numbered list (Ctrl/⌘+Shift+7)">
              <ListOrdered size={14} />
            </button>
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const url = prompt("Enter image URL:");
                if (url) applyCommand(note.id, "insertImage", url);
              }}
              className="hover:text-black"
              title="Insert image"
            >
              <Image size={14} />
            </button>
          </div>

          {/* Editable Area — uncontrolled, caret won't jump */}
          <div
            ref={(el) => setEditorRef(el, note.id, note.content)}
            contentEditable
            suppressContentEditableWarning={true}
            dir="ltr"
            className="w-full h-32 bg-yellow-100 rounded p-2 text-sm outline-none overflow-y-auto focus:ring-2 focus:ring-yellow-200 text-left"
            style={{ unicodeBidi: "plaintext" }}
            onInput={(e) => handleContentChange(note.id, e.currentTarget.innerHTML)}
            onKeyDown={(e) => handleKeyDown(note.id, e)}
            onMouseUp={() => saveSelection(note.id)}
            onKeyUp={() => saveSelection(note.id)}
            onFocus={() => { saveSelection(note.id); }}
          />
        </div>
      ))}

    </div>
  );
}

