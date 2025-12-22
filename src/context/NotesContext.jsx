
// src/context/NotesContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const NotesContext = createContext();

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const API_BASE = "https://taskbe.sharda.co.in/api/stickynotes";

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (color = "#fffde7") => {
    setLoading(true);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ content: "", color }),
      });
      const newNote = await res.json();
      setNotes(prev => [...prev, newNote]);
      return newNote;
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (id, content) => {
    try {
      await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ content }),
      });
      setNotes(prev => prev.map(n => n._id === id ? { ...n, content } : n));
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      setNotes(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <NotesContext.Provider value={{ notes, loading, createNote, updateNote, deleteNote, fetchNotes }}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => useContext(NotesContext);