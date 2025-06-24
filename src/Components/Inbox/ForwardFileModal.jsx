import React, { useState } from "react";
import { FaTimes, FaSearch } from "react-icons/fa";

const ForwardFileModal = ({
  showForwardModal,
  setShowForwardModal,
  forwardRecipient,
  setForwardRecipient,
  availableRecipients,
  forwardFile,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  if (!showForwardModal) return null;

  const filteredRecipients = availableRecipients.filter((recipient) =>
    recipient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-opacity-70 flex items-center justify-center z-50 ">
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

        <div className="mb-4 relative">
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 bg-white transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
        </div>

        <div className="mb-6 overflow-y-auto max-h-60">
          <div className="space-y-3">
            {filteredRecipients.map((recipient) => (
              <div
                key={recipient.id}
                className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setForwardRecipient(recipient.id)}
              >
                <input
                  type="radio"
                  name="recipient"
                  id={recipient.id}
                  value={recipient.id}
                  checked={forwardRecipient === recipient.id}
                  onChange={(e) => setForwardRecipient(e.target.value)}
                  className="text-blue-600"
                />
                <label htmlFor={recipient.id} className="text-gray-700 w-full">
                  {recipient.type === "group"
                    ? `📌 Group: ${recipient.name}`
                    : `👤 User: ${recipient.name}`}
                </label>
              </div>
            ))}
          </div>
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
