import React, { useState, useEffect } from "react";
import { FaPaperclip, FaPaperPlane, FaFile, FaTimes } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";

const MessageInput = ({
  dragActive,
  showEmojiPicker,
  handleFileChange,
  files,
  messageInputRef,
  messageText,
  handleChange,
  handleKeyPress,
  sendMessage,
  uploadProgress,
  setDragActive,
  setFiles,
  setFilePreviews,
  setUploadProgress,
  setShowEmojiPicker,
  onEmojiClick,
}) => {
  return (
    <div
      className={`relative bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-200 mt-auto
    ${dragActive ? "ring-2 ring-indigo-500" : ""}
  `}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragActive(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const droppedFiles = Array.from(e.dataTransfer.files);

          // Optionally merge with existing files
          setFiles((prev) => [...prev, ...droppedFiles]);

          // Generate previews for all dropped files
          setFilePreviews((prev) => [
            ...prev,
            ...droppedFiles.map((file) => URL.createObjectURL(file)),
          ]);

          // Set initial progress for all dropped files
          setUploadProgress((prev) => [...prev, ...droppedFiles.map(() => 0)]);
        }
      }}
    >
      {" "}
      <div className="flex items-center">
        {/* Emoji Picker Button */}
        <div>
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="mr-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-gray-500"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
              />
            </svg>
          </button>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-0 z-10">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width={300}
                height={350}
                previewConfig={{ showPreview: false }} // Hide preview
                searchDisabled={false} // Keep search enabled
                skinTonesDisabled={true} // Disable skin tone variations
                categories={[
                  { category: "symbols", name: "Symbols" },
                  { category: "objects", name: "Objects" },
                  { category: "flags", name: "Flags" },
                ]}
              />
            </div>
          )}
        </div>

        <input
          type="file"
          className="hidden"
          id="fileInput"
          multiple // <-- allow multi-select
          onChange={handleFileChange}
        />

        <label
          htmlFor="fileInput"
          className="ml-2 cursor-pointer text-indigo-600"
        >
          <FaPaperclip />
        </label>

      

        {files.length > 0 && (
          <div className="absolute bottom-14 left-0 bg-white border border-gray-200 p-3 rounded-lg shadow-md w-80 z-50">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-start gap-3 mb-2">
                {file.type.startsWith("image/") ? (
                  <div className="relative">
                    <img
                      src={filePreviews[idx]}
                      alt="Preview"
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    {uploadProgress[idx] > 0 && uploadProgress[idx] < 100 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full"
                          style={{ width: `${uploadProgress[idx]}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-blue-50 p-2 rounded-md">
                    <FaFile className="text-blue-600 text-xl" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(file.size / 1024)} KB
                  </p>
                  {uploadProgress[idx] > 0 && (
                    <div className="mt-1">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Uploading...</span>
                        <span>{uploadProgress[idx]}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${uploadProgress[idx]}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => {
                    // Remove file/preview/progress at idx
                    setFiles((prev) => prev.filter((_, i) => i !== idx));
                    setFilePreviews((prev) => prev.filter((_, i) => i !== idx));
                    setUploadProgress((prev) =>
                      prev.filter((_, i) => i !== idx)
                    );
                  }}
                >
                  <FaTimes className="text-sm" />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          type="text"
          ref={messageInputRef}
          value={messageText} // Bind the input to the state
          onChange={handleChange} // This updates the state when typing
          onKeyDown={handleKeyPress} // Handle enter key press
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 text-sm bg-transparent focus:outline-none placeholder-gray-400 text-gray-700"
        />

        <button
          onClick={sendMessage}
          className="ml-2 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-150"
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
