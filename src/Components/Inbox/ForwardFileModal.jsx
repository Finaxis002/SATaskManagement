import React from "react";
import { FaTimes } from "react-icons/fa";

const ForwardFileModal = ({
  showForwardModal,
  setShowForwardModal,
  forwardRecipient,
  setForwardRecipient,
  availableRecipients,
  forwardFile,
}) => {
  if (!showForwardModal) return null;

  return (
   <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
  <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl transform transition-all">
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl font-bold text-gray-800">Forward File</h3>
      <button
        onClick={() => setShowForwardModal(false)}
        className="text-gray-500 hover:text-gray-700 transition-colors"
        aria-label="Close modal"
      >
        <FaTimes className="w-5 h-5" />
      </button>
    </div>

    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Recipient
      </label>
      <select
        value={forwardRecipient}
        onChange={(e) => setForwardRecipient(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white transition-all"
      >
        <option value="" disabled>
          Select a user or group
        </option>

        <optgroup label="Groups" className="text-gray-700">
          {availableRecipients
            .filter((recipient) => recipient.type === "group")
            .map((recipient) => (
              <option
                key={`group-${recipient.id}`}
                value={recipient.id}
                className="text-gray-700"
              >
                📌 Group: {recipient.name}
              </option>
            ))}
        </optgroup>

        <optgroup label="Users" className="text-gray-700">
          {availableRecipients
            .filter((recipient) => recipient.type === "user")
            .map((recipient) => (
              <option
                key={`user-${recipient.id}`}
                value={recipient.id}
                className="text-gray-700"
              >
                👤 User: {recipient.name}
              </option>
            ))}
        </optgroup>
      </select>
    </div>

    <div className="flex justify-end gap-3">
      <button
        onClick={() => setShowForwardModal(false)}
        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
      >
        Cancel
      </button>
      <button
        onClick={forwardFile}
        disabled={!forwardRecipient}
        className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ${
          forwardRecipient
            ? "bg-blue-600 hover:bg-blue-700"
            : "bg-blue-400 cursor-not-allowed"
        }`}
      >
        Forward
      </button>
    </div>
  </div>
</div>

  );
};

export default ForwardFileModal;