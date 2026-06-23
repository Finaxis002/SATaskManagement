import React, { useState, useEffect, useRef } from "react";
import { User2, Users } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { FaUsers } from "react-icons/fa";
import axios from "axios";

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
  const [recentActivity, setRecentActivity] = useState({
    groups: {},
    users: {},
  });

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

  const getMessageTime = (msg) => {
    const rawTime = msg?.createdAt || msg?.updatedAt || msg?.timestamp;
    if (!rawTime) return 0;

    const parsed = new Date(rawTime).getTime();
    if (!Number.isNaN(parsed)) return parsed;

    const todayTime = new Date(`${new Date().toDateString()} ${rawTime}`).getTime();
    return Number.isNaN(todayTime) ? 0 : todayTime;
  };

  const getLastMessageTime = (chatMessages = []) =>
    chatMessages.reduce((latest, msg) => Math.max(latest, getMessageTime(msg)), 0);

  useEffect(() => {
    let cancelled = false;

    const fetchRecentActivity = async () => {
      try {
        const groupEntries = await Promise.all(
          groups.map(async (group) => {
            try {
              const res = await axios.get(
                `https://taskbe.sharda.co.in/api/messages/${encodeURIComponent(group)}`
              );
              return [group, getLastMessageTime(res.data?.messages || [])];
            } catch {
              return [group, 0];
            }
          })
        );

        const chatUsers = [...admins, ...regularUsers].filter(
          (user) => user.name && user.name !== currentUser.name
        );

        const userEntries = await Promise.all(
          chatUsers.map(async (user) => {
            try {
              const res = await axios.get(
                `https://taskbe.sharda.co.in/api/messages/user/${user.name}`
              );
              const directMessages = (res.data?.messages || []).filter((msg) => {
                const sender = (msg.sender || "").trim().toLowerCase();
                const recipient = (msg.recipient || "").trim().toLowerCase();
                const currentName = currentUser.name.trim().toLowerCase();
                const userName = user.name.trim().toLowerCase();

                return (
                  !msg.group &&
                  ((sender === currentName && recipient === userName) ||
                    (sender === userName && recipient === currentName))
                );
              });

              return [user.name || user.userId, getLastMessageTime(directMessages)];
            } catch {
              return [user.name || user.userId, 0];
            }
          })
        );

        if (!cancelled) {
          setRecentActivity({
            groups: Object.fromEntries(groupEntries),
            users: Object.fromEntries(userEntries),
          });
        }
      } catch (err) {
        console.error("Failed to fetch recent chat activity:", err.message);
      }
    };

    fetchRecentActivity();

    return () => {
      cancelled = true;
    };
  }, [groups, admins, regularUsers, currentUser.name]);

  const sortByRecentActivity = (a, b) => {
    const recentDiff = (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0);
    if (recentDiff !== 0) return recentDiff;
    return (b.unreadCount || 0) - (a.unreadCount || 0);
  };

  const sortedGroups = groups
    .map((group) => {
      const groupMessages = messages.filter(
        (message) => message.group === group
      );

      // If there are messages in the group, get the most recent one
      const lastMessageTimestamp = Math.max(
        recentActivity.groups[group] || 0,
        getLastMessageTime(groupMessages)
      );

      const unreadCount = groupUnreadCounts[group] || 0; // Unread count for the group

      return {
        name: group,
        unreadCount,
        lastMessageTimestamp, // Timestamp of the last message
      };
    })
    .sort(sortByRecentActivity);

  const buildSortedUsers = (userList) =>
    userList
      .filter((user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map((user) => {
        const userKey = user.name || user.userId;
        const openChatLastMessage = getLastMessageTime(
          messages.filter((msg) => msg.sender === user.name || msg.recipient === user.name)
        );
      return {
        ...user,
        unreadCount: userUnreadCounts[userKey] || 0,
        lastMessageTimestamp: Math.max(
          recentActivity.users[userKey] || 0,
          openChatLastMessage
        ),
      };
      })
      .sort(sortByRecentActivity);

  const sortedAdmins = buildSortedUsers(admins);
  const sortedRegularUsers = buildSortedUsers(regularUsers);

  return (
<div className="w-full md:w-1/4 min-w-0 
  bg-gray-100 md:bg-gradient-to-b md:from-gray-200 md:to-gray-100 
  p-3 sm:p-4 md:p-5 rounded-none sm:rounded-xl md:rounded-2xl shadow-none sm:shadow-lg border-0 sm:border sm:border-gray-300
  flex min-h-0 flex-col h-full max-h-full overflow-hidden">

  {/* Sticky Title/Toggle container */}
  <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border border-slate-200 rounded-xl mb-3">
    <div className="grid grid-cols-2 gap-2 p-1.5 sm:p-2">
      <button
        onClick={() => setShowGroups(true)}
        className={`w-full relative px-3 py-2 text-sm rounded-lg transition-colors duration-200
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
        className={`w-full relative px-3 py-2 text-sm rounded-lg transition-colors duration-200
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
        <div className="flex-1 min-h-0 overflow-y-auto pb-3">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 md:mb-4 text-center text-gray-800">
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
                  className={`relative cursor-pointer px-3 py-2.5 sm:p-3 rounded-lg flex justify-between items-center transition-colors duration-200 border ${
                    selectedGroup === group.name
                      ? "bg-indigo-100 border-indigo-300"
                      : "hover:bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex flex-row items-center gap-2">
                    <span className="text-indigo-600 flex gap-3 sm:gap-4 items-center font-medium text-sm hover:underline relative">
                      <FaUsers className="text-indigo-600 text-base sm:text-lg shrink-0" />
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
        <div className="border-t border-gray-200 flex-1 min-h-0 overflow-y-auto pb-3">
          <h3 className="text-lg sm:text-xl font-bold my-3 text-center text-gray-700">
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

            {sortedAdmins.length > 0 && (
  <>
    <h4 className="text-sm font-semibold text-gray-500 mb-2 px-2">
      Administrators
    </h4>
    {sortedAdmins.map((admin) => (
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
