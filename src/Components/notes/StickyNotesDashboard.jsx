import React, { useState, useEffect, useContext } from "react";
import { FaStickyNote, FaPlus, FaSync } from "react-icons/fa";
import NoteContainer from "./NoteContainer";

const API_BASE = "https://taskbe.sharda.co.in/api/stickynotes";

// Theme context hook (same as in other components)
const useTheme = () => {
  // If ThemeContext is not available, return default light theme
  try {
    const ThemeContext = React.createContext();
    const context = useContext(ThemeContext);
    if (context) return context;
  } catch (e) {
    // Fallback: check for dark class on document
  }
  
  // Fallback theme detection
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
           localStorage.getItem('theme-mode') === 'dark';
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  return { isDark, setIsDark: () => {} };
};

// Theme styles hook
const useThemeStyles = () => {
  const { isDark } = useTheme();
  
  return {
    // Main container - adapting the sticky note aesthetic to both themes
    container: isDark 
      ? "bg-gradient-to-br from-amber-900/80 to-orange-900/60 backdrop-blur-xl border border-amber-700/50 shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
      : "bg-gradient-to-br from-yellow-200 to-yellow-100 border border-yellow-100 shadow-lg",
    
    // Header text
    title: isDark ? "text-amber-200" : "text-yellow-900",
    
    // Icon color  
    icon: isDark ? "text-amber-400" : "text-yellow-400",
    
    // Button styling
    button: {
      bg: isDark ? "bg-amber-800/60 hover:bg-amber-700/80" : "bg-yellow-200 hover:bg-yellow-300",
      text: isDark ? "text-amber-200" : "text-yellow-900",
      shadow: isDark ? "shadow-amber-900/30" : "shadow-sm"
    }
  };
};

const StickyNotesDashboard = () => {
  const [notes, setNotes] = useState([]);
  const [creating, setCreating] = useState(false);
  const styles = useThemeStyles();
  const { isDark } = useTheme();

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
      body: JSON.stringify({ 
        content: "", 
        color: isDark ? "#451a03" : "#fffde7" // Dark brown for dark mode, light yellow for light mode
      }),
    });
    const newNote = await res.json();
    setNotes((notes) => [...notes, newNote]);
    setCreating(false);
  };

  return (   
    <div className={`${styles.container} rounded-xl p-2 py-4 w-full max-w-xl relative transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4">
        <h2 className={`text-xl font-bold ${styles.title} flex items-center gap-2`}>
          <FaStickyNote className={styles.icon} />
          Sticky Notes
        </h2>
        <button
          className={`
            ${styles.button.bg} ${styles.button.text} 
            px-3 py-1 rounded-lg ${styles.button.shadow}
            transition-all flex items-center gap-2
            ${creating ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
            backdrop-blur-sm
          `}
          disabled={creating}
          onClick={createNote}
        >
          <FaPlus className={creating ? 'animate-spin' : ''} />
          {creating ? 'Creating...' : 'New'}
        </button>
      </div>
      
      {/* Notes Container */}
      <div className="mt-2">
        <NoteContainer />
      </div>
      
      {/* Optional: Theme indicator for sticky notes context */}
      <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${isDark ? 'bg-amber-600/50' : 'bg-yellow-400/50'} opacity-60`}></div>
    </div>
  );
};

export default StickyNotesDashboard;