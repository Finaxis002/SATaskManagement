import React, { useState, useEffect, useRef } from "react";
import { User2, Users } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FaUsers } from "react-icons/fa";

const ChatSidebar = ({
  showGroups,
  groupUnreadCounts,
  currentUser,
  userUnreadCounts,
  groups,
  selectedGroup,
  handleGroupClick,
  setShowGroups,
  searchTerm,
  admins,
  selectedUser,
  regularUsers,
  users,
  handleUserClick,
  setSearchTerm,
  messages,
}) => {
  const scrollRefUsers = useRef(null); // Reference to the users chat container
  const scrollRefGroups = useRef(null); // Reference to the groups chat container

  useEffect(() => {
    // Scroll to the bottom for groups only when new messages are added
    if (scrollRefGroups.current) {
      scrollRefGroups.current.scrollTop = scrollRefGroups.current.scrollHeight;
    }

    // Scroll to the bottom for users only when new messages are added
    if (scrollRefUsers.current) {
      scrollRefUsers.current.scrollTop = scrollRefUsers.current.scrollHeight;
    }
  }, [messages]); // Trigger scroll only when messages change

  // Handle group selection
  const handleGroupSelection = (group) => {
    handleGroupClick(group); // Call the parent handler
    if (scrollRefGroups.current) {
      // Keep scroll position when switching groups
      scrollRefGroups.current.scrollTop = scrollRefGroups.current.scrollHeight;
    }
  };
// Add the filtered list of users based on the searchTerm
const filteredAdmins = admins.filter((admin) =>
  admin.name.toLowerCase().includes(searchTerm.toLowerCase())
);

const filteredRegularUsers = regularUsers.filter((user) =>
  user.name.toLowerCase().includes(searchTerm.toLowerCase())
);

  // Handle user selection
  const handleUserSelection = (user) => {
    handleUserClick(user);
    if (scrollRefUsers.current) {
      // Keep scroll position when switching users
      scrollRefUsers.current.scrollTop = scrollRefUsers.current.scrollHeight;
    }
  };
  // Assuming messages have a field 'createdAt' and 'group' is derived from those messages
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedTime = `${hours % 12}:${
      minutes < 10 ? "0" + minutes : minutes
    } ${ampm}`;
    return formattedTime;
  };
  const sortedGroups = groups
    .map((group) => {
      const groupMessages = messages.filter(
        (message) => message.group === group
      );

      // If there are messages in the group, get the most recent one
      const lastMessageTimestamp =
        groupMessages.length > 0
          ? Math.max(
              ...groupMessages.map((msg) => new Date(msg.createdAt).getTime())
            )
          : 0; // If no messages, set timestamp to 0

      const unreadCount = groupUnreadCounts[group] || 0; // Unread count for the group

      return {
        name: group,
        unreadCount,
        lastMessageTimestamp, // Timestamp of the last message
      };
    })
    .sort((a, b) => {
      // First, sort by last message timestamp (most recent first)
      if (b.lastMessageTimestamp !== a.lastMessageTimestamp) {
        return b.lastMessageTimestamp - b.lastMessageTimestamp; // Most recent first
      }

      // If timestamps are equal, sort by unread message count
      return b.unreadCount - a.unreadCount; // Most unread messages first
    });

  // Sorting Admins by unread count and recency
  const sortedAdmins = admins
    .map((admin) => {
      // Get the last message timestamp for the admin (if available)
      const lastMessageTimestamp = messages
        .filter(
          (msg) => msg.sender === admin.name || msg.recipient === admin.name
        ) // Check messages related to this admin
        .map((msg) => new Date(msg.timestamp).getTime()) // Convert timestamp to get comparable value
        .sort((a, b) => b - a)[0]; // Get the most recent message timestamp, if available

      return {
        ...admin,
        unreadCount: userUnreadCounts[admin.name || admin.userId] || 0, // Get unread count
        lastMessageTimestamp, // Add the last message timestamp for sorting
      };
    })
    .sort((a, b) => {
      // First, sort by unread count (descending)
      if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount;

      // If unread counts are equal, sort by recency (timestamp)
      return (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0); // Sort by timestamp (most recent first)
    });

  // Sorting Regular Users by unread count and recency
  const sortedRegularUsers = regularUsers
    .map((user) => {
      // Get the last message timestamp for the regular user (if available)
      const lastMessageTimestamp = messages
        .filter(
          (msg) => msg.sender === user.name || msg.recipient === user.name
        ) // Check messages related to this user
        .map((msg) => new Date(msg.timestamp).getTime()) // Convert timestamp to get comparable value
        .sort((a, b) => b - a)[0]; // Get the most recent message timestamp, if available

      return {
        ...user,
        unreadCount: userUnreadCounts[user.name || user.userId] || 0, // Get unread count
        lastMessageTimestamp, // Add the last message timestamp for sorting
      };
    })
    .sort((a, b) => {
      // First, sort by unread count (descending)
      if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount;

      // If unread counts are equal, sort by recency (timestamp)
      return (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0); // Sort by timestamp (most recent first)
    });

  return (
<div className="w-full sm:w-1/3 md:w-1/4 
  bg-gradient-to-b from-gray-200 to-gray-100 
  p-4 sm:p-5 rounded-2xl shadow-lg border border-gray-300
  flex flex-col h-screen sm:h-full max-h-screen">

  {/* Sticky Title/Toggle container */}
  <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border border-slate-200 rounded-xl mb-3">
    <div className="grid grid-cols-2 gap-2 p-2">
      <button
        onClick={() => setShowGroups(true)}
        className={`w-full relative px-3 py-2 text-sm rounded-lg transition-transform transform hover:scale-105 duration-200
          ${showGroups ? "bg-white shadow-lg text-indigo-700" : "bg-gray-200 text-gray-700 hover:text-gray-900"}`}
      >
        Groups
        {Object.values(groupUnreadCounts).reduce((a, c) => a + c, 0) > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-md">
            {Object.values(groupUnreadCounts).reduce((a, c) => a + c, 0)}
          </span>
        )}
      </button>

      <button
        onClick={() => setShowGroups(false)}
        className={`w-full relative px-3 py-2 text-sm rounded-lg transition-transform transform hover:scale-105 duration-200
          ${!showGroups ? "bg-white shadow-lg text-indigo-700" : "bg-gray-200 text-gray-700 hover:text-gray-900"}`}
      >
        {currentUser.role === "user" ? "Personal Chat" : "Users"}
        {Object.values(userUnreadCounts).reduce((a, c) => a + c, 0) > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-md">
            {Object.values(userUnreadCounts).reduce((a, c) => a + c, 0)}
          </span>
        )}
      </button>
    </div>
  </div>


      {/* Groups/Users Section */}
      {showGroups ? (
        <div className="flex-1 overflow-auto mb-6">
          <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
            {currentUser.role === "user" ? "Your Groups" : "Groups"}
          </h3>
          {sortedGroups.length === 0 ? (
            <p className="text-center text-gray-400 italic">
              No chat group assigned.
            </p>
          ) : (
            <ul className="space-y-2">
              {sortedGroups.map((group) => (
                <li
                  key={group.name}
                  onClick={() => handleGroupSelection(group.name)}
                  className={`relative cursor-pointer p-3 rounded-lg flex justify-between items-center transition-all duration-200 border ${
                    selectedGroup === group.name
                      ? "bg-indigo-100 border-indigo-300"
                      : "hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex flex-row items-center gap-2">
                    <span className="text-indigo-600 flex gap-4 items-center font-medium text-sm hover:underline relative">
                      <FaUsers className="text-indigo-600 text-lg" />
                      {group.name}
                    </span>
                    {group.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs px-1 py-0 rounded-full">
                        {group.unreadCount}
                      </span>
                    )}
                  </div>
                  
                  {/* Display last message timestamp */}
                  {group.lastMessageTimestamp > 0 && (
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(group.lastMessageTimestamp)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="border-t border-gray-200 h-[70vh] overflow-y-auto">
          <h3 className="text-xl font-bold mb-3 text-center text-gray-700">
            {currentUser.role === "user" ? "Personal Chat" : "Users"}
          </h3>
          <div className="overflow-y-auto space-y-2 pr-1">
            <div className="relative px-2 mb-3 py-2">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user by name..."
                className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 focus:outline-none"
                >
                  <FontAwesomeIcon icon={faTimesCircle} />
                </button>
              )}
            </div>

            {filteredAdmins.length > 0 && (
  <>
    <h4 className="text-sm font-semibold text-gray-500 mb-2 px-2">
      Administrators
    </h4>
    {filteredAdmins.map((admin) => (
      <div
        key={admin._id || admin.userId}
        onClick={() => handleUserSelection(admin)}
        className={`cursor-pointer px-4 py-2 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-between border ${
          selectedUser?._id === admin._id ||
          selectedUser?.userId === admin.userId
            ? "bg-indigo-100 border-indigo-300"
            : "bg-white hover:bg-gray-100 border-gray-200"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
            {admin.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-sm font-medium text-gray-800 block">
              {admin.name}
            </span>
            {admin.position && (
              <span className="text-xs text-gray-500 block">
                {admin.position}
              </span>
            )}
          </div>
        </div>
        {userUnreadCounts[admin.name || admin.userId] > 0 && (
          <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            {userUnreadCounts[admin.name || admin.userId]}
          </span>
        )}
      </div>
    ))}
  </>
)}

{filteredRegularUsers.length > 0 && (
  <>
    <h4 className="text-sm font-semibold text-gray-500 mb-2 px-2 mt-4">
      Team Members
    </h4>
    {filteredRegularUsers.map((user) => (
      <div
        key={user._id || user.userId}
        onClick={() => handleUserSelection(user)}
        className={`cursor-pointer px-4 py-2 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-between border ${
          selectedUser?._id === user._id ||
          selectedUser?.userId === user.userId
            ? "bg-indigo-100 border-indigo-300"
            : "bg-white hover:bg-gray-100 border-gray-200"
        }`}
      >
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-sm font-medium text-gray-800 block">
              {user.name}
            </span>
            {user.position && (
              <span className="text-xs text-gray-500 block">
                {user.position}
              </span>
            )}
          </div>
        </div>
        {userUnreadCounts[user.name] > 0 && (
          <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            {userUnreadCounts[user.name]}
          </span>
        )}
      </div>
    ))}
  </>
)}

            {sortedRegularUsers.length > 0 && (
              <>
                <h4 className="text-sm font-semibold text-gray-500 mb-2 px-2 mt-4">
                  Team Members
                </h4>
                {sortedRegularUsers.map((user) => (
                  <div
                    key={user._id || user.userId}
                    onClick={() => handleUserSelection(user)}
                    className={`cursor-pointer px-4 py-2 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-between border ${
                      selectedUser?._id === user._id ||
                      selectedUser?.userId === user.userId
                        ? "bg-indigo-100 border-indigo-300"
                        : "bg-white hover:bg-gray-100 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-800 block">
                          {user.name}
                        </span>
                        {user.position && (
                          <span className="text-xs text-gray-500 block">
                            {user.position}
                          </span>
                        )}
                      </div>
                    </div>
                    {userUnreadCounts[user.name] > 0 && (
                      <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        {userUnreadCounts[user.name]}
                      </span>
                    )}
                  </div>
                ))}
              </>
            )}

            {users.length === 0 && (
              <p className="text-sm text-gray-400 text-center">
                No users found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;