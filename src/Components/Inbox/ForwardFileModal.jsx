import React, { useState } from "react";
import { FaTimes, FaSearch, FaPaperPlane } from "react-icons/fa";

const ForwardFileModal = ({
  showForwardModal,
  setShowForwardModal,
  forwardRecipients,
  setForwardRecipients, // ✅ USE THIS
  availableRecipients,
  forwardFile,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  if (!showForwardModal) return null;

  const filteredRecipients = availableRecipients.filter((recipient) =>
    recipient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // console.log("filtered Recipients : ", filteredRecipients);

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
              >
                <label className="relative flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="recipient"
                    id={recipient.id}
                    value={recipient.id}
                    checked={forwardRecipients.includes(recipient.id)}
                    onChange={() => {
                      setForwardRecipients((prev) =>
                        prev.includes(recipient.id)
                          ? prev.filter((id) => id !== recipient.id)
                          : [...prev, recipient.id]
                      );
                    }}
                    className="peer appearance-none w-5 h-5 rounded-full border-2 border-blue-500 bg-white checked:bg-blue-600 checked:border-blue-600 transition-all duration-200 focus:outline-none"
                  />
                  {/* Custom checkmark SVG absolutely centered */}
                  <svg
                    className="pointer-events-none absolute left-0 top-0 w-5 h-5 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity duration-150"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 10 18 4 12" />
                  </svg>
                </label>

                <div className="flex items-center justify-between gap-2 w-full">
                  {/* Avatar + Name */}
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-base font-semibold shadow
      ${
        recipient.type === "group" ? "bg-green-600" : "bg-indigo-500"
      } text-white`}
                    >
                      {recipient.name?.charAt(0).toUpperCase()}
                    </div>
                    <label
                      htmlFor={recipient.id}
                      className="text-gray-700 cursor-pointer"
                    >
                      {recipient.name}
                    </label>
                  </div>
                  {/* Position or Group Badge on the right */}
                  <span className="ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700">
                    {recipient.type === "group"
                      ? "Group"
                      : recipient.position
                      ? recipient.position
                      : recipient.role
                      ? recipient.role.charAt(0).toUpperCase() +
                        recipient.role.slice(1)
                      : "User"}
                  </span>
                </div>
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
            disabled={forwardRecipients.length === 0}
            className={`px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ${
              forwardRecipients
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-400 cursor-not-allowed"
            }`}
          >
            <FaPaperPlane size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForwardFileModal;
