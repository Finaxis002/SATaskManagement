import React from "react";

const ChatHeader = ({ selectedGroup, selectedUser }) => {
  return (
 <div className="flex z-10 w-full mt-0 relative items-center gap-4 px-6 py-2 bg-white shadow-sm rounded-xl border border-gray-200">
  {/* Avatar Circle */}
  {(selectedUser || selectedGroup) && (
    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-indigo-500 text-white text-2xl font-bold">
      {selectedUser
        ? selectedUser.name?.charAt(0).toUpperCase()
        : selectedGroup?.charAt(0).toUpperCase()}
    </div>
  )}

  <div className="flex-1 justify-between">
    <div className="flex items-center gap-2">
      <h2 className="text-xl font-bold text-gray-900">
        {selectedUser
          ? selectedUser.name || selectedUser.userId
          : selectedGroup
          ? selectedGroup
          : "Select a Group or User to Chat"}
      </h2>
      {/* Group/User Badge */}
      {selectedGroup && (
        <span className="ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
          Group
        </span>
      )}
      {selectedUser?.position && (
        <span className="ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
          {selectedUser.position}
        </span>
      )}
    </div>
    {selectedUser?.role && (
      <div className="text-xs text-gray-500 mt-0.5">{selectedUser.role}</div>
    )}
  </div>
</div>

  );
};

export default ChatHeader;
