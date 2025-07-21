import { useEffect, useState, useCallback } from "react";

export default function useStickyNotes(limit = 3) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch notes (with sorting & limit)
  const fetchNotes = useCallback(() => {
    setLoading(true);
    fetch("http://localhost:1100/api/stickynotes", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
    })
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        if (Array.isArray(data)) {
          const sorted = data
            .sort(
              (a, b) =>
                new Date(b.updatedAt || b.createdAt) -
                new Date(a.updatedAt || a.createdAt)
            )
            .slice(0, limit);
          setNotes(sorted);
        } else {
          setNotes([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setNotes([]);
        setLoading(false);
      });
  }, [limit]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Add Note function
  const addNote = async (content = "", color = "#fffde7") => {
    const res = await fetch("http://localhost:1100/api/stickynotes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
      },
      body: JSON.stringify({ content, color }),
    });
    const newNote = await res.json();
    // Optimistically update UI:
    setNotes((prev) => [newNote, ...prev].slice(0, limit));
    // Or refetch notes for up-to-date sort/limit:
    // fetchNotes();
    return newNote;
  };

  // Optionally: expose a refresh function
  return { notes, loading, addNote, refresh: fetchNotes };
}
