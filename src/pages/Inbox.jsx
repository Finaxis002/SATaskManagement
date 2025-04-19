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
  const [groupMembers, setGroupMembers] = useState({});

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState("");

  const allGroups = [
    "Marketing",
    "Sales",
    "Operations",
    "IT/Software",
    "HR",
    "Administrator",
  ];

  const currentUser = {
    name: localStorage.getItem("name") || "User",
    department: localStorage.getItem("department"),
    role: localStorage.getItem("role"),
  };

  useEffect(() => {
    if (currentUser.role === "admin") {
      setGroups(allGroups); // Admin sees all groups
    } else if (currentUser.department) {
      setGroups([currentUser.department]); // Regular user sees only their department
      setSelectedGroup(currentUser.department); // Auto-set group for users
    }
  }, [currentUser.role, currentUser.department]);

  const scrollRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    const fetchGroupMembers = async () => {
      try {
        const res = await axios.get(
          "https://sataskmanagementbackend.onrender.com/api/group-members"
        );
        setGroupMembers(res.data.groupMembers || {});
        console.log("👥 Group Members:", res.data.groupMembers);
      } catch (err) {
        console.error("❌ Failed to fetch group members", err.message);
      }
    };

    fetchGroupMembers();
  }, []);

  // Fetch messages when group is changed
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const encodedGroup = encodeURIComponent(selectedGroup);
        const res = await axios.get(
          `https://sataskmanagementbackend.onrender.com/api/messages/${encodedGroup}`
        );
        setMessages(res.data.messages.reverse()); // ✅ Fix here
        console.log("📩 Messages fetched:", res.data.length);
        console.log("🧠 Selected Group:", selectedGroup);
        console.log("🧑‍💼 Current User Department:", currentUser.department);
      } catch (err) {
        console.error("❌ Error fetching messages:", err.message);
      }
    };

    fetchMessages(); // Call fetch on initial render and every time selectedGroup changes
  }, [selectedGroup]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ✅ Mark messages as read
  useEffect(() => {
    const markGroupMessagesAsRead = async () => {
      const name = localStorage.getItem("name");

      try {
        const res = await axios.put(
          "https://sataskmanagementbackend.onrender.com/api/mark-read-group",
          {
            name,
            group: selectedGroup,
          }
        );
        console.log(
          `✅ Marked ${res.data.updated} messages as read in ${selectedGroup}`
        );

        socket.emit("inboxRead", { name }); // Trigger real-time badge update
      } catch (err) {
        console.error("❌ Failed to mark group messages as read:", err.message);
      }
    };

    markGroupMessagesAsRead();
  }, [selectedGroup]); // ✅ Triggered on group switch

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    const newMessage = {
      sender: currentUser.name,
      text: messageText,
      group: selectedGroup,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false, // Mark message as unread initially
    };

    console.log("Sending message:", newMessage); // Log the message data

    try {
      const res = await axios.post(
        `https://sataskmanagementbackend.onrender.com/api/messages/${encodeURIComponent(
          selectedGroup
        )}`,
        newMessage
      );

      console.log("✅ Message saved to DB:", res.data);

      socket.emit("sendMessage", res.data); // Emit message data to the group
      console.log("📤 Message sent via socket:", res.data);

      setMessageText(""); // Clear input after sending
    } catch (err) {
      console.error("❌ Failed to send message:", err.message);
    }
  };

  const handleChange = (e) => {
    const { value } = e.target;
    setMessageText(value);
  };

  const handleGroupClick = (group) => {
    setSelectedGroup(group); // Updates the selected group
  };

  const handleShowMembers = (group) => {
    setSelectedGroupForMembers(group);
    setShowMemberModal(true);
  };

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      console.log("📨 Real-time message received:", msg);
      // ✅ Only update messages if it belongs to the selected group
      if (msg.group === selectedGroup) {
        setMessages((prev) => {
          if (Array.isArray(prev)) {
            return [...prev, msg];
          }
          return [msg];
        });
      } else {
        console.log("❌ Ignored message from other group:", msg.group);
      }
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [selectedGroup]);

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

  return (
    <div className="w-full max-h-screen p-4 flex bg-gray-100">
      {/* Left column for groups */}
      <div className="w-1/4 bg-white p-5 rounded-xl shadow-lg border border-gray-200">
        <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Groups
        </h3>

        {groups.length === 0 ? (
          <p className="text-center text-gray-400 italic">
            No chat group assigned.
          </p>
        ) : (
          <ul className="space-y-1">
            {groups.map((group) => (
              <li
                key={group}
                onClick={() => handleGroupClick(group)}
                className={`relative group cursor-pointer p-3 rounded-lg flex justify-between items-center transition-all duration-200 border ${
                  selectedGroup === group
                    ? "bg-indigo-100 border-indigo-300"
                    : "hover:bg-gray-50 border-gray-200"
                }`}
              >
                {/* Group Info */}
                <div className="flex flex-col gap-0.5">
                  <span
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering chat switch
                      handleShowMembers(group);
                    }}
                    className="text-indigo-600 font-semibold text-sm hover:underline relative"
                  >
                    {group}

                    {/* 👇 Inline Popup Panel */}
                    {showMemberModal && selectedGroupForMembers === group && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 shadow-lg rounded-md z-50 p-3">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">
                          Members
                        </h4>
                        <ul className="max-h-40 overflow-y-auto space-y-1 text-sm text-gray-600">
                          {(groupMembers[group] || []).map((member, idx) => (
                            <li
                              key={idx}
                              className="border-b pb-1 last:border-0"
                            >
                              {member}
                            </li>
                          ))}
                        </ul>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMemberModal(false);
                          }}
                          className="w-full mt-2 text-xs text-indigo-600 hover:underline"
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </span>

                  <span className="text-xs text-gray-500">
                    {groupMembers[group]?.length || 0} member
                    {groupMembers[group]?.length > 1 ? "s" : ""}
                  </span>
                </div>

                {/* Badge */}
                {groupUnreadCounts[group] > 0 && group !== selectedGroup && (
                  <span className="ml-2 bg-red-500 text-white text-[11px] px-2 py-0.5 rounded-full shadow-sm">
                    {groupUnreadCounts[group]}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right column for chat messages */}
      <div className="w-3/4 pl-4 flex flex-col">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {selectedGroup} Chat
        </h2>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white px-4 py-6 space-y-4 mb-4"
        >
          {/* Check if messages is an array and has messages */}
          {Array.isArray(messages) && messages.length > 0 ? (
            messages.map((msg, idx) => {
              const isCurrentUser = msg.sender === currentUser.name;
              return (
                <div
                  key={idx}
                  className={`max-w-sm p-3 rounded-xl shadow-md ${
                    isCurrentUser
                      ? "bg-indigo-500 text-white ml-auto rounded-br-none"
                      : "bg-gray-200 text-gray-800 mr-auto rounded-bl-none"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-semibold ${
                        isCurrentUser ? "text-indigo-100" : "text-gray-600"
                      }`}
                    >
                      {msg.sender}
                    </span>
                    <span
                      className={`text-[10px] ${
                        isCurrentUser ? "text-indigo-200" : "text-gray-500"
                      }`}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {msg.text}
                  </p>

                  {/* Read/Unread Badge */}
                  {msg.read ? (
                    <span className="text-xs text-green-500">Read</span>
                  ) : (
                    <span className="text-xs text-red-500">Unread</span>
                  )}
                </div>
              );
            })
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
