import React from "react";
import { User2, Users } from "lucide-react";

const ChatSidebar = ({
  showGroups,
  setShowGroups,
  searchTerm,
  setSearchTerm,
  groups,
  users,
  selectedGroup,
  selectedUser,
  groupUnreadCounts,
  userUnreadCounts,
  handleGroupClick,
  handleUserClick,
}) => {
  return (
    <div className="w-1/4 border-r border-gray-200 p-4 bg-white">
      <div className="flex justify-between mb-4">
        <button
          className={`px-3 py-1 rounded-md font-medium ${
            showGroups ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setShowGroups(true)}
        >
          Groups
        </button>
        <button
          className={`px-3 py-1 rounded-md font-medium ${
            !showGroups ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-700"
          }`}
          onClick={() => setShowGroups(false)}
        >
          Personal Chat
        </button>
      </div>

      {showGroups ? (
        <>
          <h2 className="text-lg font-semibold mb-2">Your Groups</h2>
          {groups.map((group) => (
            <div
              key={group}
              className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer mb-1 ${
                selectedGroup === group
                  ? "bg-blue-100 font-medium"
                  : "hover:bg-gray-100"
              }`}
              onClick={() => handleGroupClick(group)}
            >
              <div className="flex items-center gap-2">
                <Users size={18} />
                {group}
              </div>
              {groupUnreadCounts[group] > 0 && (
                <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5">
                  {groupUnreadCounts[group]}
                </span>
              )}
            </div>
          ))}
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Search users..."
            className="w-full p-2 border rounded-md mb-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {users.admin.length > 0 && (
            <>
              <h2 className="text-lg font-semibold mt-3 mb-1">Admins</h2>
              {users.admin
                .filter((user) =>
                  user.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((user) => (
                  <div
                    key={user.name}
                    className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer mb-1 ${
                      selectedUser?.name === user.name
                        ? "bg-blue-100 font-medium"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="flex items-center gap-2">
                      <User2 size={18} />
                      {user.name}
                    </div>
                    {userUnreadCounts[user.name] > 0 && (
                      <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5">
                        {userUnreadCounts[user.name]}
                      </span>
                    )}
                  </div>
                ))}
            </>
          )}

          {users.others.length > 0 && (
            <>
              <h2 className="text-lg font-semibold mt-3 mb-1">Others</h2>
              {users.others
                .filter((user) =>
                  user.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((user) => (
                  <div
                    key={user.name}
                    className={`flex items-center justify-between px-3 py-2 rounded-md cursor-pointer mb-1 ${
                      selectedUser?.name === user.name
                        ? "bg-blue-100 font-medium"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => handleUserClick(user)}
                  >
                    <div className="flex items-center gap-2">
                      <User2 size={18} />
                      {user.name}
                    </div>
                    {userUnreadCounts[user.name] > 0 && (
                      <span className="text-xs bg-red-500 text-white rounded-full px-2 py-0.5">
                        {userUnreadCounts[user.name]}
                      </span>
                    )}
                  </div>
                ))}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ChatSidebar;
