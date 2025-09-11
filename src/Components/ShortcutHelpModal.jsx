import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ShortcutHelpModal from "./ShortcutHelpModal";

const ShortcutHandler = ({ children }) => {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const navigate = useNavigate();

  const role = localStorage.getItem("role"); // "admin" or "user"

  useEffect(() => {
    const handleKeyDown = (e) => {
      // ✅ If Esc is pressed, close modal
      if (e.key === "Escape" && showShortcuts) {
        e.preventDefault();
        setShowShortcuts(false);
        return;
      }

      if (!e.ctrlKey) return; // using Ctrl shortcuts now

      // Common shortcuts
      if (e.key.toLowerCase() === "d") {
        e.preventDefault();
        navigate("/");
      }
      if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        setShowShortcuts(true);
      }

      // Admin-only shortcuts
      if (role === "admin") {
        if (e.key.toLowerCase() === "t") {
          e.preventDefault();
          navigate("/all-tasks");
        }
        if (e.key.toLowerCase() === "c") {
          e.preventDefault();
          navigate("/clients");
        }
        if (e.key.toLowerCase() === "l") {
          e.preventDefault();
          navigate("/leave");
        }
        if (e.key.toLowerCase() === "i") {
          e.preventDefault();
          navigate("/invoice");
        }
        if (e.key.toLowerCase() === "u") {
          e.preventDefault();
          navigate("/all-employees");
        }
        if (e.key.toLowerCase() === "q") {
          e.preventDefault();
          navigate("/departments");
        }
        if (e.key.toLowerCase() === "a") {
          e.preventDefault();
          // Example: open add event
          console.log("Open Add Event popup");
        }
      }

      // User-only shortcuts
      if (role === "user") {
        if (e.key.toLowerCase() === "t") {
          e.preventDefault();
          navigate("/all-tasks");
        }
        if (e.key.toLowerCase() === "l") {
          e.preventDefault();
          navigate("/leave");
        }
        if (e.key.toLowerCase() === "a") {
          e.preventDefault();
          console.log("Add Event for user");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, role, showShortcuts]);

  return (
    <>
      {children}
      <ShortcutHelpModal
        open={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </>
  );
};

export default ShortcutHandler;
