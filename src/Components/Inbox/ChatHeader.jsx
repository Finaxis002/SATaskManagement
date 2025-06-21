import React from "react";

const ChatHeader = ({ selectedGroup, selectedUser }) => {
  return (
    <div className="px-6 py-3 border-b bg-white text-lg font-semibold text-gray-800 shadow-sm">
      {selectedGroup && `Chat with ${selectedGroup}`}
      {selectedUser && `Chat with ${selectedUser.name}`}
    </div>
  );
};

export default ChatHeader;
