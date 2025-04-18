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
  const [selectedGroup, setSelectedGroup] = useState("Marketing"); // Default selected group
  const [groups, setGroups] = useState([
    "Marketing",
    "Sales",
    "Operations",
    "IT/Software",
    "HR",
    "Administrator",
  ]);

  const currentUser = {
    name: localStorage.getItem("name") || "User",
  };

  const scrollRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Fetch messages when group is changed
  useEffect(() => {
    socket.on("receiveGroupMessage", (msg) => {
      if (msg.group === selectedGroup) {  // Only append messages for the selected group
        console.log("📨 Real-time message received:", msg);
        setMessages((prev) => {
          if (Array.isArray(prev)) {
            return [...prev, msg];  // Append to the array if prev is valid
          }
          return [msg];  // Initialize messages with the new message if prev is invalid
        });
      }
    });
  
    return () => {
      socket.off("receiveGroupMessage");
    };
  }, [selectedGroup]); // Only listen for messages of the selected group
  
  



  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ✅ Mark messages as read
  useEffect(() => {
    const markMessagesAsRead = async () => {
      const name = localStorage.getItem("name");
      const role = localStorage.getItem("role");

      try {
        const res = await axios.put(
          "https://sataskmanagementbackend.onrender.com/api/mark-read",
          {
            name,
            role,
          }
        );
        console.log("✅ Messages marked as read:", res.data);

        // 🔥 Emit to reset inbox count in real time
        socket.emit("inboxRead", { name, role });
        console.log("📢 inboxRead event emitted for:", name, role);
      } catch (err) {
        console.error("❌ Failed to mark messages as read:", err.message);
      }
    };

    markMessagesAsRead();
  }, []);

  const sendMessage = async () => {
    if (!messageText.trim()) return;
  
    const newMessage = {
      sender: currentUser.name,
      text: messageText,
      group: selectedGroup,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: false,  // Mark message as unread initially
    };
  
    console.log("Sending message:", newMessage);  // Log the message data
  
    try {
      const res = await axios.post(
        `https://sataskmanagementbackend.onrender.com/api/messages/${selectedGroup}`,
        newMessage
      );
      console.log("✅ Message saved to DB:", res.data);
  
      socket.emit("sendMessage", res.data);  // Emit message data to the group
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

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const encodedGroup = encodeURIComponent(selectedGroup); // Encoding the group name
        const res = await axios.get(
          `https://sataskmanagementbackend.onrender.com/api/messages/${encodedGroup}`
        );
        setMessages(res.data);
        console.log("📩 Messages fetched:", res.data.length);
      } catch (err) {
        console.error("❌ Error fetching messages:", err.message);
      }
    };

    fetchMessages();
  }, [selectedGroup]);

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      console.log("📨 Real-time message received:", msg);
      setMessages((prev) => {
        if (Array.isArray(prev)) {
          return [...prev, msg]; // Append to the array if prev is valid
        }
        return [msg]; // Return an array with the new message if prev is not an array
      });
    });
  
    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  return (
    <div className="w-full max-h-screen p-4 flex bg-gray-100">
      {/* Left column for groups */}
      <div className="w-1/4 bg-white p-4 rounded-md shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-center">Groups</h3>
        <ul className="space-y-2">
          {groups.map((group) => (
            <li
              key={group}
              onClick={() => handleGroupClick(group)}
              className={`cursor-pointer p-2 rounded-md hover:bg-indigo-100 ${
                selectedGroup === group ? "bg-indigo-200" : ""
              }`}
            >
              {group}
            </li>
          ))}
        </ul>
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
      ;
    </div>
  );
};

export default Inbox;
