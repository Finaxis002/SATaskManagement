import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../redux/userSlice";
import { FaTrashAlt, FaUsers } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faTimesCircle } from "@fortawesome/free-solid-svg-icons";

// Assume socket.io client setup
const socket = io("https://taskbe.sharda.co.in", {
  withCredentials: true,
});

const Inbox = () => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [groups, setGroups] = useState([]);
  const [groupUnreadCounts, setGroupUnreadCounts] = useState({});
  const [showGroups, setShowGroups] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null); // For personal chat
  const [users, setUsers] = useState([]); // ✅ Must be an array
  const [userUnreadCounts, setUserUnreadCounts] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messageInputRef = useRef(null); // Add a ref for the input field
  const [admins, setAdmins] = useState([]);
  const [regularUsers, setRegularUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const currentUser = {
    name: localStorage.getItem("name") || "User",
    department: localStorage.getItem("department"),
    role: localStorage.getItem("role"),
  };

  // Add this function to handle emoji selection
  const onEmojiClick = (emojiObject) => {
    const cursorPosition = messageInputRef.current.selectionStart;
    const textBeforeCursor = messageText.substring(0, cursorPosition);
    const textAfterCursor = messageText.substring(cursorPosition);

    setMessageText(textBeforeCursor + emojiObject.emoji + textAfterCursor);
    setShowEmojiPicker(false);

    // Focus back on input and set cursor position after emoji
    setTimeout(() => {
      messageInputRef.current.focus();
      messageInputRef.current.selectionEnd =
        cursorPosition + emojiObject.emoji.length;
    }, 0);
  };

  // Fetch groups when the component is mounted or updated
  useEffect(() => {
    const fetchUserDepartments = async () => {
      try {
        if (currentUser.role === "admin") {
          const res = await axios.get(
            "https://taskbe.sharda.co.in/api/departments"
          );
          setGroups(res.data.map((dept) => dept.name));
        } else {
          // Fetch all employees and find the current user
          const res = await axios.get(
            "https://taskbe.sharda.co.in/api/employees"
          );
          const currentEmployee = res.data.find(
            (emp) => emp.name === currentUser.name
          );
          if (currentEmployee && currentEmployee.department) {
            setGroups(currentEmployee.department);
            setSelectedGroup(currentEmployee.department[0]);
          }
        }
      } catch (err) {
        console.error("❌ Error fetching departments:", err.message);
        // Fallback
        if (currentUser.department) {
          setGroups([currentUser.department]);
          setSelectedGroup(currentUser.department);
        }
      }
    };

    fetchUserDepartments();
  }, [currentUser.role, currentUser.name]);

  const scrollRef = useRef(null); // Your existing scrollRef

  // useEffect to auto-scroll whenever messages are updated
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await axios.get(
          "https://taskbe.sharda.co.in/api/employees"
        );
        console.log("Fetched users:", res.data);

        // Separate admins and regular users
        const adminUsers = res.data.filter((user) => user.role === "admin");
        const nonAdminUsers = res.data.filter((user) => user.role !== "admin");

        setUsers(res.data);
        setAdmins(adminUsers);
        setRegularUsers(nonAdminUsers);
      } catch (err) {
        console.error("❌ Failed to fetch users:", err.message);
        setUsers([]);
        setAdmins([]);
        setRegularUsers([]);
      }
    };

    fetchAllUsers();
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (selectedUser && selectedUser.name) {
          const res = await axios.get(
            `https://taskbe.sharda.co.in/api/messages/user/${selectedUser.name}`
          );

          const filteredMessages = res.data.messages.filter((msg) => {
            const trimmedSender = msg.sender
              ? msg.sender.trim().toLowerCase()
              : "";
            const trimmedRecipient = msg.recipient
              ? msg.recipient.trim().toLowerCase()
              : "";
            const trimmedLoggedInUser = currentUser.name.trim().toLowerCase();

            const isPersonalMessage =
              trimmedSender === trimmedLoggedInUser ||
              trimmedRecipient === trimmedLoggedInUser;

            return (
              isPersonalMessage && (msg.group === undefined || msg.group === "")
            );
          });

          const sortedMessages = [...filteredMessages].sort((a, b) => {
            const timeA = new Date(`1970/01/01 ${a.timestamp}`);
            const timeB = new Date(`1970/01/01 ${b.timestamp}`);
            return timeA - timeB; // oldest to newest
          });
          setMessages(sortedMessages);
        } else if (selectedGroup) {
          const encodedGroup = encodeURIComponent(selectedGroup);
          const res = await axios.get(
            `https://taskbe.sharda.co.in/api/messages/${encodedGroup}`
          );
          setMessages(res.data.messages.reverse()); // No reverse here
        }
      } catch (err) {
        console.error("❌ Error fetching messages:", err.message);
      }
    };

    fetchMessages();
  }, [selectedUser, selectedGroup, currentUser.name]); // Ensure it triggers when the selected user or group changes

  const sendMessage = async () => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage) return;

    const newMessage = {
      sender: currentUser.name,
      text: trimmedMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false,
      ...(selectedUser && { recipient: selectedUser.name }),
      ...(selectedGroup && { group: selectedGroup }),
      isDirectMessage: !!selectedUser,
    };

    try {
      let res;
      if (selectedUser) {
        res = await axios.post(
          `https://taskbe.sharda.co.in/api/messages/user/${selectedUser.name}`,
          newMessage
        );
        socket.emit("sendDirectMessage", {
          message: res.data,
          recipient: selectedUser.name,
        });
      } else if (selectedGroup) {
        res = await axios.post(
          `https://taskbe.sharda.co.in/api/messages/${encodeURIComponent(
            selectedGroup
          )}`,
          newMessage
        );
        socket.emit("sendMessage", res.data);
      }

      // Push the message to chat and clear input
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("❌ Failed to send message:", err.message);
    } finally {
      // Always clear the input
      setMessageText("");

      // Optional: Refocus
      setTimeout(() => {
        messageInputRef.current?.focus();
      }, 0);
    }
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setMessageText(value);
  };

  const markMessagesAsRead = async (identifier) => {
    try {
      // Optimistically update the UI first
      if (selectedGroup) {
        setGroupUnreadCounts((prev) => ({ ...prev, [selectedGroup]: 0 }));
      } else if (selectedUser) {
        setUserUnreadCounts((prev) => ({ ...prev, [selectedUser.name]: 0 }));
      }

      // Then make the API call
      const res = await axios.put(
        "https://taskbe.sharda.co.in/api/mark-read",
        {
          identifier,
        }
      );

      // Emit socket event after successful API call
      socket.emit("markRead", { identifier });
    } catch (err) {
      console.error("❌ Failed to mark messages as read:", err.message);
      // Revert the optimistic update if failed
      if (selectedGroup) {
        setGroupUnreadCounts((prev) => ({
          ...prev,
          [selectedGroup]: prev[selectedGroup],
        }));
      } else if (selectedUser) {
        setUserUnreadCounts((prev) => ({
          ...prev,
          [selectedUser.name]: prev[selectedUser.name],
        }));
      }
    }
  };

  useEffect(() => {
    socket.on("markRead", (data) => {
      console.log("Message marked as read:", data.identifier);

      // If it's a group message
      if (selectedGroup && data.identifier === selectedGroup) {
        setGroupUnreadCounts((prevCounts) => {
          const updatedCounts = { ...prevCounts };
          updatedCounts[selectedGroup] = 0; // Reset unread count for the group
          return updatedCounts;
        });
      }

      // If it's a user message
      if (selectedUser && data.identifier === selectedUser.name) {
        setUserUnreadCounts((prevCounts) => {
          const updatedCounts = { ...prevCounts };
          updatedCounts[selectedUser.name] = 0; // Reset unread count for the user
          return updatedCounts;
        });
      }
    });

    return () => {
      socket.off("markRead");
    };
  }, [selectedGroup, selectedUser]);

  // When selecting a group
  const handleGroupClick = (group) => {
    setSelectedGroup(group);
    setSelectedUser(null); // Clear selected user when switching to a group

    // Mark messages as read for this group
    markMessagesAsRead(group);
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setSelectedGroup(null);

    // Mark messages as read immediately when clicking the chat
    await markMessagesAsRead(user.name);

    // Force update the unread counts
    setUserUnreadCounts((prev) => ({
      ...prev,
      [user.name]: 0, // Immediately set to 0
    }));
  };



  useEffect(() => {
    const handleReceiveMessage = (msg) => {
      console.log("📨 Real-time message received:", msg);

      // For Group Messages
      if (msg.group) {
        // Only process if this is the currently selected group
        if (selectedGroup === msg.group) {
          setMessages((prev) => [...prev, msg]);
        }

        // Update unread counts if needed
        if (groups.includes(msg.group)) {
          setGroupUnreadCounts((prev) => {
            // If the currently selected group is not this group, increment the badge
            if (selectedGroup !== msg.group) {
              return {
                ...prev,
                [msg.group]: (prev[msg.group] || 0) + 1,
              };
            } else {
              // Still show message in chat (handled above), but don’t increment unread
              return prev;
            }
          });
        }
      }
      // For Direct Messages
      else if (
        msg.recipient === currentUser.name &&
        msg.sender !== currentUser.name
      ) {
        if (selectedUser && selectedUser.name === msg.sender) {
          setMessages((prev) => [...prev, msg]);
        }
        setUserUnreadCounts((prev) => ({
          ...prev,
          [msg.sender]: (prev[msg.sender] || 0) + 1,
        }));
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    return () => socket.off("receiveMessage", handleReceiveMessage);
  }, [selectedGroup, selectedUser, currentUser.name, groups]);

  useEffect(() => {
    const fetchGroupUnreadCounts = async () => {
      try {
        const name = localStorage.getItem("name");

        const res = await axios.get(
          "https://taskbe.sharda.co.in/api/group-unread-counts",
          {
            params: { name },
          }
        );

        setGroupUnreadCounts(res.data.groupUnreadCounts || {});
        console.log("📊 Group Unread Counts:", res.data.groupUnreadCounts);
      } catch (err) {
        console.error("❌ Failed to fetch group unread counts:", err.message);
      }
    };

    fetchGroupUnreadCounts();

    socket.on("inboxCountUpdated", fetchGroupUnreadCounts); // Update live
    return () => {
      socket.off("inboxCountUpdated", fetchGroupUnreadCounts);
    };
  }, []);

  useEffect(() => {
    const fetchUserUnreadCounts = async () => {
      try {
        const name = localStorage.getItem("name");
        const res = await axios.get(
          "https://taskbe.sharda.co.in/api/user-unread-counts",
          {
            params: {
              name,
              onlyDirectMessages: true, // Add this parameter
            },
          }
        );
        setUserUnreadCounts(res.data.userUnreadCounts || {});
      } catch (err) {
        console.error("❌ Failed to fetch user unread counts:", err.message);
      }
    };
    fetchUserUnreadCounts();
    socket.on("inboxCountUpdated", fetchUserUnreadCounts);

    return () => {
      socket.off("inboxCountUpdated", fetchUserUnreadCounts);
    };
  }, []);

  useEffect(() => {
    console.log("Selected Group:", selectedGroup);
    console.log("Selected User:", selectedUser);
  }, [selectedGroup, selectedUser]);

  socket.on("receiveMessage", (msg) => {
    // Always fetch fresh count after any group message
    if (msg.group && groups.includes(msg.group)) {
      axios
        .get("/api/group-unread-counts", {
          params: { name: currentUser.name },
        })
        .then((res) => {
          setGroupUnreadCounts(res.data.groupUnreadCounts || {});
        })
        .catch((err) => {
          console.error(
            "❌ Failed to refetch group unread counts:",
            err.message
          );
        });
    }
  });

  return (
    <div className="w-full max-h-screen p-4 flex bg-gray-100">
      {/* Left column for groups */}
      <div className="w-1/4 bg-white p-5 rounded-xl shadow-lg border border-gray-200 flex flex-col h-full">
        {/* Toggle Buttons for Groups and Users/Personal Chat */}
        <div className="flex gap-4 mb-4 relative">
          {/* Groups Button */}
          <button
            onClick={() => setShowGroups(true)}
            className={`relative px-4 py-2 text-sm rounded-lg ${
              showGroups ? "bg-indigo-100" : "bg-gray-200"
            }`}
          >
            Groups
            {Object.values(groupUnreadCounts).reduce(
              (acc, count) => acc + count,
              0
            ) > 0 && (
              <span className="absolute top-[-6px] right-[-10px] bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow">
                {Object.values(groupUnreadCounts).reduce(
                  (acc, count) => acc + count,
                  0
                )}
              </span>
            )}
          </button>

          {/* Personal Chat/Users Button */}
          <button
            onClick={() => setShowGroups(false)}
            className={`relative px-4 py-2 text-sm rounded-lg ${
              !showGroups ? "bg-indigo-100" : "bg-gray-200"
            }`}
          >
            {currentUser.role === "user" ? "Personal Chat" : "Users"}
            {Object.values(userUnreadCounts).reduce(
              (acc, count) => acc + count,
              0
            ) > 0 && (
              <span className="absolute top-[-6px] right-[-10px] bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow">
                {Object.values(userUnreadCounts).reduce(
                  (acc, count) => acc + count,
                  0
                )}
              </span>
            )}
          </button>
        </div>

        {/* Groups/Users Section */}
        {showGroups ? (
          <div className="flex-1 overflow-auto mb-6">
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
              {currentUser.role === "user" ? "Your Groups" : "Groups"}
            </h3>
            {groups.length === 0 ? (
              <p className="text-center text-gray-400 italic">
                No chat group assigned.
              </p>
            ) : (
              <ul className="space-y-2">
                {groups.map((group) => (
                  <li
                    key={group}
                    onClick={() => handleGroupClick(group)}
                    className={`relative cursor-pointer p-3 rounded-lg flex justify-between items-center transition-all duration-200 border ${
                      selectedGroup === group
                        ? "bg-indigo-100 border-indigo-300"
                        : "hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex flex-row items-center gap-2">
                      <span className="text-indigo-600 flex gap-4 items-center font-medium text-sm hover:underline relative">
                        <FaUsers className="text-indigo-600 text-lg" />
                        {group}
                      </span>
                      {groupUnreadCounts[group] > 0 && (
                        <span className="bg-red-500 text-white text-xs px-1 py-0 rounded-full">
                          {groupUnreadCounts[group]}
                        </span>
                      )}
                    </div>
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
                {/* Search Icon */}
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"
                />

                {/* Input Field */}
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search user by name..."
                  className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />

                {/* Clear Button */}
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 focus:outline-none"
                  >
                    <FontAwesomeIcon icon={faTimesCircle} />
                  </button>
                )}
              </div>

              {/* Admins Section */}
              {users.filter((u) => u.role === "admin").length > 0 && (
                <>
                  <h4 className="text-sm font-semibold text-gray-500 mb-2 px-2">
                    Administrators
                  </h4>
                  {users
                    .filter(
                      (user) =>
                        user.role === "admin" &&
                        user.name !== currentUser.name &&
                        user.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) // 👈 add search filter
                    )

                    .map((admin) => (
                      <div
                        key={admin._id}
                        onClick={() => handleUserClick(admin)}
                        className={`cursor-pointer px-4 py-2 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-between border ${
                          selectedUser?._id === admin._id
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
                        {userUnreadCounts[admin.name] > 0 && (
                          <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                            {userUnreadCounts[admin.name]}
                          </span>
                        )}
                      </div>
                    ))}
                </>
              )}

              {/* Regular Users Section */}
              {users.filter((u) => u.role !== "admin").length > 0 && (
                <>
                  <h4 className="text-sm font-semibold text-gray-500 mb-2 px-2 mt-4">
                    {currentUser.role === "user"
                      ? "Colleagues"
                      : "Team Members"}
                  </h4>
                  {users
                    .filter(
                      (user) =>
                        user.role !== "admin" &&
                        user.name !== currentUser.name &&
                        user.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) // 👈 add search filter
                    )

                    .map((user) => (
                      <div
                        key={user._id}
                        onClick={() => handleUserClick(user)}
                        className={`cursor-pointer px-4 py-2 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-between border ${
                          selectedUser?._id === user._id
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
                            {user.department && (
                              <span className="text-xs text-gray-500 block">
                                {Array.isArray(user.department)
                                  ? user.department.join(", ")
                                  : user.department}
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

      {/* Right column for chat messages */}
      <div className="w-3/4 pl-4 flex flex-col">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {/* {selectedGroup
            ? `Chat with ${selectedGroup}` // If a group is selected, show group name
            : `${selectedUser.name}`
            ? `Chat with ${selectedUser.name}` // If a user is selected, show user name
            : "Select a Group or User to Chat"}{" "} */}
          {/* Default message if none is selected */}

          {
            selectedUser
              ? `Chat with ${selectedUser.name}` // If group is selected, show group name
              : selectedGroup
              ? `Chat with ${selectedGroup}` // If user is selected, show user name
              : "Select a Group or User to Chat" // If neither is selected, show default message
          }
        </h2>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white px-4 py-6 space-y-4 mb-4"
        >
          {/* Check if messages is an array and has messages */}
          {Array.isArray(messages) && messages.length > 0 ? (
            <>
              {/* ✅ Read Messages */}
              {messages
                .filter((msg) => msg.read || msg.sender === currentUser.name)
                .map((msg, idx) => {
                  const isCurrentUser = msg.sender === currentUser.name;
                  return (
                    <div
                      key={`read-${idx}`}
                      className={`max-w-sm p-3 rounded-xl shadow-md ${
                        isCurrentUser
                          ? "bg-indigo-500 text-white ml-auto rounded-br-none"
                          : "bg-gray-200 text-gray-800 mr-auto rounded-bl-none"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold">
                          {msg.sender}
                        </span>
                        <span
                          className={`text-[10px] ${
                            msg.sender === currentUser.name
                              ? "text-gray-50" // Light color for sent messages (on dark background)
                              : "text-gray-500" // Darker color for received messages (on light background)
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {msg.text}
                      </p>
                    </div>
                  );
                })}

              {/* ✅ Header for unread messages */}
              {messages.some(
                (msg) => !msg.read && msg.sender !== currentUser.name
              ) && (
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-3 py-1 text-xs font-semibold tracking-wide text-white bg-green-500 rounded-lg shadow-md">
                      New Messages
                    </span>
                  </div>
                </div>
              )}

              {/* ✅ Unread Messages */}
              {messages
                .filter((msg) => !msg.read && msg.sender !== currentUser.name)
                .map((msg, idx) => {
                  const isCurrentUser = msg.sender === currentUser.name;
                  return (
                    <div className="max-w-sm p-3 rounded-xl shadow-md border-2 border-gray-200 bg-gray-200 text-gray-800 mr-auto rounded-bl-none">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold">
                          {msg.sender}
                        </span>
                        <span className="text-[10px] text-gray-800">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {msg.text}
                      </p>
                    </div>
                  );
                })}
            </>
          ) : (
            <div className="text-center text-gray-500">
              No messages available.
            </div>
          )}
        </div>

        {/* Input field and Send button (Fixed at the bottom) */}
        <div className="relative bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-200 mt-auto">
          <div className="flex items-center">
            {/* Emoji Picker Button */}
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inbox;
