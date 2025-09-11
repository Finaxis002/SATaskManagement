import React from "react";

const ShortcutHelpModal = ({ open, onClose }) => {
  if (!open) return null;

  const role = localStorage.getItem("role"); // "admin" or "user"

  // Common shortcuts
  const commonShortcuts = [
    { keys: "Alt + D", desc: "Go to Dashboard" },
    { keys: "Alt + S", desc: "Show this shortcuts help" },
    
  ];

  // Admin-only shortcuts
  const adminShortcuts = [
    { keys: "Alt + T", desc: "Go to Tasks page & open create task form" },
    { keys: "Alt + C", desc: "Go to Clients page" },
    { keys: "Alt + L", desc: "Go to Leave page" },
    { keys: "Alt + I", desc: "Go to Invoice page" },
    { keys: "Alt + Q", desc: "Go to Settings" },
    { keys: "Alt + U", desc: "Go to All Employees" },
    { keys: "Alt + A", desc: "Open Add Event popup" },
  ];

  // User-only shortcuts
  const userShortcuts = [
    { keys: "Alt + T", desc: "Go to My Tasks" },
    { keys: "Alt + L", desc: "Go to My Leave" },
    { keys: "ALT + A", desc: "Add Events" },
  ];

  const shortcuts =
    role === "admin"
      ? [...commonShortcuts, ...adminShortcuts]
      : [...commonShortcuts, ...userShortcuts];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-[90%] max-w-md">
        <h2 className="text-xl font-bold mb-4">Keyboard Shortcuts</h2>

        <ul className="space-y-2 text-sm">
          {shortcuts.map((sc, idx) => (
            <li key={idx} className="flex justify-between">
              <span className="font-medium">{sc.keys}</span>
              <span>{sc.desc}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ShortcutHelpModal;
