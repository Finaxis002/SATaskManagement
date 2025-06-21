import React from "react";
import { Smile, Paperclip, Send, X } from "lucide-react";

const MessageInput = ({
  messageText,
  setMessageText,
  file,
  setFile,
  filePreview,
  setFilePreview,
  messageInputRef,
  handleFileSelect,
  handleSend,
  toggleEmojiPicker,
}) => {
  return (
    <div className="flex items-center p-4 border-t bg-white">
      <button onClick={toggleEmojiPicker} className="mr-2 text-gray-600">
        <Smile size={20} />
      </button>

      <label className="cursor-pointer text-gray-600 mr-2">
        <Paperclip size={20} />
        <input
          type="file"
          accept="image/*,.pdf,.doc,.docx"
          hidden
          onChange={handleFileSelect}
        />
      </label>

      <input
        type="text"
        placeholder="Type your message..."
        ref={messageInputRef}
        className="flex-1 border rounded-md px-3 py-2 mr-2 text-sm focus:outline-none focus:ring focus:border-blue-300"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
      />

      <button
        onClick={handleSend}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        <Send size={18} />
      </button>

      {/* File Preview */}
      {file && (
        <div className="absolute bottom-20 left-4 bg-white border p-2 rounded shadow">
          <div className="flex items-center justify-between">
            <div className="text-sm truncate max-w-[200px]">{file.name}</div>
            <button onClick={() => {
              setFile(null);
              setFilePreview(null);
            }}>
              <X size={14} className="text-red-500 ml-2" />
            </button>
          </div>
          {filePreview && file.type.startsWith("image/") && (
            <img
              src={filePreview}
              alt="preview"
              className="mt-2 rounded w-32"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MessageInput;
