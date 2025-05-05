import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../redux/userSlice";

// Assume socket.io client setup
const socket = io("https://sataskmanagementbackend.onrender.com", {
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

  const currentUser = {
    name: localStorage.getItem("name") || "User",
    department: localStorage.getItem("department"),
    role: localStorage.getItem("role"),
  };

  // Fetch groups when the component is mounted or updated
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(
          "https://sataskmanagementbackend.onrender.com/api/departments"
        );
        const departmentNames = res.data.map((dept) => dept.name);

        if (currentUser.role === "admin") {
          setGroups(departmentNames); // Admin sees all fetched departments
        } else if (currentUser.department) {
          setGroups([currentUser.department]); // User sees only their department
          setSelectedGroup(currentUser.department); // Auto-select it
        }
      } catch (err) {
        console.error("❌ Error fetching departments:", err.message);
      }
    };

    fetchDepartments();
  }, [currentUser.role, currentUser.department]);

  const scrollRef = useRef(null); // Your existing scrollRef

  // useEffect to auto-scroll whenever messages are updated
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]); // This will run whenever messages change

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const res = await axios.get(
          "https://sataskmanagementbackend.onrender.com/api/employees"
        );
        console.log("Fetched users:", res.data); // Inspect the response structure
        setUsers(res.data); // Set the entire user objects
      } catch (err) {
        console.error("❌ Failed to fetch users:", err.message);
        setUsers([]); // Fallback to an empty array
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
            `https://sataskmanagementbackend.onrender.com/api/messages/user/${selectedUser.name}`
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
            `https://sataskmanagementbackend.onrender.com/api/messages/${encodedGroup}`
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
    if (!messageText.trim()) return;

    const newMessage = {
      sender: currentUser.name,
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false, // Mark message as unread initially
    };

    try {
      let res;

      if (selectedUser) {
        // If a user is selected, send the message to that user
        res = await axios.post(
          `https://sataskmanagementbackend.onrender.com/api/messages/user/${selectedUser.name}`,
          newMessage
        );
        console.log("✅ Message sent to user:", res.data);
      } else if (selectedGroup) {
        // If a group is selected, send the message to the group
        res = await axios.post(
          `https://sataskmanagementbackend.onrender.com/api/messages/${encodeURIComponent(
            selectedGroup
          )}`,
          newMessage
        );
        console.log("✅ Message sent to group:", res.data);
      }

      // Emit the message to the socket for real-time updates
      socket.emit("sendMessage", res.data);
      console.log("📤 Message sent via socket:", res.data);

      // Optimistically update the messages state with the new message at the bottom
      setMessages((prevMessages) => [...prevMessages, res.data]); // Append new message to the bottom

      setMessageText(""); // Clear the input after sending
    } catch (err) {
      console.error("❌ Failed to send message:", err.message);
    }
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setMessageText(value);
  };

  const markMessagesAsRead = async (identifier) => {
    try {
      // Call the API to mark messages as read for this group or user
      const res = await axios.put(
        "https://sataskmanagementbackend.onrender.com/api/mark-read",
        {
          identifier,
        }
      );
      console.log(`Marked messages as read for ${identifier}:`, res.data);

      // Emit a socket event to mark messages as read
      socket.emit("markRead", { identifier });

      // Update the unread count locally for real-time update
      if (selectedGroup) {
        setGroupUnreadCounts((prevCounts) => {
          const updatedCounts = { ...prevCounts };
          updatedCounts[selectedGroup] = 0; // Reset unread count for the group
          return updatedCounts;
        });
      } else if (selectedUser) {
        setUserUnreadCounts((prevCounts) => {
          const updatedCounts = { ...prevCounts };
          updatedCounts[selectedUser.name] = 0; // Reset unread count for the user
          return updatedCounts;
        });
      }
    } catch (err) {
      console.error("❌ Failed to mark messages as read:", err.message);
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

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setSelectedGroup(null); // Clear selected group when switching to a user

    // Mark messages as read for this user
    markMessagesAsRead(user.name);
  };

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      console.log("📨 Real-time message received:", msg);

      // For Groups:
      if (
        msg.group &&
        typeof msg.group === "string" &&
        msg.group.trim() !== ""
      ) {
        if (!selectedGroup || msg.group !== selectedGroup) {
          setGroupUnreadCounts((prevCounts) => {
            const updatedCounts = { ...prevCounts };
            updatedCounts[msg.group] = (updatedCounts[msg.group] || 0) + 1;
            return updatedCounts;
          });
        }
      }

      // For Personal Messages:
      if (
        msg.recipient === currentUser.name &&
        msg.sender !== currentUser.name
      ) {
        setUserUnreadCounts((prevCounts) => {
          const updatedCounts = { ...prevCounts };
          updatedCounts[msg.sender] = (updatedCounts[msg.sender] || 0) + 1;
          return updatedCounts;
        });
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [selectedGroup, currentUser.name]);

  //fetch group unread badge
  useEffect(() => {
    const fetchGroupUnreadCounts = async () => {
      try {
        const name = localStorage.getItem("name");

        const res = await axios.get(
          "https://sataskmanagementbackend.onrender.com/api/group-unread-counts",
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
    console.log("Selected Group:", selectedGroup);
    console.log("Selected User:", selectedUser);
  }, [selectedGroup, selectedUser]);

  socket.on("receiveMessage", (msg) => {
    console.log("📨 received:", msg);

    if (msg.group && msg.group.trim() !== "") {
      console.log("📌 Group message for:", msg.group);
    } else {
      console.log("📬 Personal message from:", msg.sender);
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

        {/* Groups Section */}
        {showGroups ? (
  <div className="flex-1 overflow-auto mb-6">
    <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
      {currentUser.role === "user" ? "Your Groups" : "Groups"}
    </h3>
    {groups.length === 0 ? (
      <p className="text-center text-gray-400 italic">No chat group assigned.</p>
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
              <span className="text-indigo-600 font-medium text-sm hover:underline relative">
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
  <div className="border-t border-gray-200 pt-4">
    <h3 className="text-xl font-bold mb-3 text-center text-gray-700">
      {currentUser.role === "user" ? "Personal Chat" : "Users"}
    </h3>
    <div className="overflow-y-auto space-y-2 pr-1">
      {currentUser.role === "user" ? (
        // User view - show only admin
        <div
          onClick={() => {
            const admin = { name: "Admin", id: "admin" };
            setSelectedUser(admin);
          }}
          className={`cursor-pointer px-3 py-2 rounded-md bg-white hover:bg-gray-100 text-sm text-gray-700 transition-all duration-200 ${
            selectedUser?.id === "admin" ? "bg-indigo-100" : ""
          }`}
        >
          <div className="flex justify-between items-center">
            <span>Admin</span>
            {/* Use the same identifier (admin.id) as used in state */}
            {userUnreadCounts["admin"] > 0 && (
              <span className="bg-red-500 text-white text-xs px-1 py-0 rounded-full">
                {userUnreadCounts["admin"]}
              </span>
            )}
          </div>
        </div>
      ) : users.length > 0 ? (
        users.map((user) => (
          <div
            key={user.id}
            onClick={() => handleUserClick(user)}
            className={`cursor-pointer px-3 py-2 rounded-md bg-white hover:bg-gray-100 text-sm text-gray-700 transition-all duration-200 ${
              selectedUser?.id === user.id ? "bg-indigo-100" : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{user.name}</span>
              {/* Ensure we're using the same key as stored in userUnreadCounts */}
              {(userUnreadCounts[user.id] || userUnreadCounts[user.name]) > 0 && (
                <span className="bg-red-500 text-white text-xs px-1 py-0 rounded-full">
                  {/* Check both possible identifiers */}
                  {userUnreadCounts[user.id] || userUnreadCounts[user.name]}
                </span>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-sm text-gray-400 text-center">No users found.</p>
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
            <input
              type="text"
              value={messageText}
              onChange={handleChange}
              onKeyDown={handleKeyPress}
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
