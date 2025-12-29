// src/context/NotesContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const NotesContext = createContext();

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(false);
  const API_BASE = "https://taskbe.sharda.co.in/api/stickynotes";

  const fetchNotes = async () => {
    // Check if token exists before making request
    const token = localStorage.getItem("authToken");
    
    if (!token) {
      console.warn("No auth token found - skipping notes fetch");
      setAuthError(true);
      return;
    }

    setLoading(true);
    setAuthError(false);
    
    try {
      console.log("Fetching notes with token:", token.substring(0, 20) + "..."); // Debug
      
      const res = await fetch(API_BASE, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Handle non-OK responses
      if (!res.ok) {
        if (res.status === 401) {
          console.error("Authentication failed - token may be invalid or expired");
          setAuthError(true);
          // Optionally clear the invalid token
          // localStorage.removeItem("authToken");
        } else {
          console.error(`Failed to fetch notes: ${res.status} ${res.statusText}`);
        }
        setNotes([]);
        return;
      }

      const data = await res.json();
      console.log("Notes fetched successfully:", data.length, "notes");
      setNotes(Array.isArray(data) ? data : []);
      
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (color = "#fffde7") => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Cannot create note: No auth token");
      setAuthError(true);
      return null;
    }

    setLoading(true);
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: "", color }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          setAuthError(true);
        }
        throw new Error(`Failed to create note: ${res.status}`);
      }

      const newNote = await res.json();
      setNotes(prev => [...prev, newNote]);
      return newNote;
    } catch (error) {
      console.error("Failed to create note:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async (id, content, color) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Cannot update note: No auth token");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, color }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          setAuthError(true);
        }
        throw new Error(`Failed to update note: ${res.status}`);
      }

      const updatedNote = await res.json();
      setNotes(prev => prev.map(n => n._id === id ? updatedNote : n));
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };

  const deleteNote = async (id) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("Cannot delete note: No auth token");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          setAuthError(true);
        }
        throw new Error(`Failed to delete note: ${res.status}`);
      }

      setNotes(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  // Initial fetch - only if token exists
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      console.log("NotesContext mounted - fetching notes");
      fetchNotes();
    } else {
      console.warn("NotesContext mounted but no auth token found");
    }
  }, []);

  return (
    <NotesContext.Provider 
      value={{ 
        notes, 
        loading, 
        authError,
        createNote, 
        updateNote, 
        deleteNote, 
        fetchNotes 
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};