import React from "react";
import { FaArrowLeft } from "react-icons/fa";

const ChatHeader = ({
  selectedUser,
  selectedGroup,
  isFullScreen,
  setIsFullScreen,
  setSelectedUser,
  setSelectedGroup
}) => {
  // 🔹 Yahi pe handleBack function define karo
  const handleBack = () => {
    console.log("🔙 Back button clicked!");
    if (typeof setIsFullScreen === "function") {
      setIsFullScreen(false);
    }
    if (typeof setSelectedUser === "function") {
      setSelectedUser(null);
    }
    if (typeof setSelectedGroup === "function") {
      setSelectedGroup(null);
    }
  };

  return (
    <div className="flex items-center w-full px-4 py-2 bg-white shadow-sm border-b border-gray-200">
      {/* Back Button */}
      <button
        type="button"
        onClick={handleBack}  
        className="sm:hidden flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200"
      >
        <FaArrowLeft size={16} />
      </button>

      {/* Avatar */}
      {(selectedUser || selectedGroup) && (
        <div className="ml-3 w-10 h-10 rounded-full flex items-center justify-center bg-indigo-500 text-white text-lg font-bold">
          {selectedUser
            ? selectedUser.name?.charAt(0).toUpperCase()
            : selectedGroup?.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Name + Details */}
      <div className="ml-3 flex flex-col">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900 truncate max-w-[140px] sm:max-w-none">
            {selectedUser
              ? selectedUser.name || selectedUser.userId
              : selectedGroup
              ? selectedGroup
              : "Select a Group or User"}
          </h2>
          {selectedGroup && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
              Group
            </span>
          )}
          {selectedUser?.position && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
              {selectedUser.position}
            </span>
          )}
        </div>
        {selectedUser?.role && (
          <span className="text-xs text-gray-500">{selectedUser.role}</span>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;