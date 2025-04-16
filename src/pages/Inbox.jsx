import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:5000"); // Adjust if deployed

const Inbox = () => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const currentUser = {
    name: localStorage.getItem("name") || "User",
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await axios.get("http://localhost:5000/api/messages");
      setMessages(res.data);
      console.log("📩 Messages fetched:", res.data.length);
    };
    fetchMessages();

    // ✅ Listen for real-time messages
    socket.on("receiveMessage", (msg) => {
      console.log("📨 Real-time message received:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);


   // ✅ Mark messages as read
   useEffect(() => {
    const markMessagesAsRead = async () => {
      const name = localStorage.getItem("name");
      const role = localStorage.getItem("role");

      try {
        const res = await axios.put("http://localhost:5000/api/mark-read", { name, role });
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

  const sendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage = {
      sender: currentUser.name,
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    socket.emit("sendMessage", newMessage);
    console.log("📤 Message sent:", newMessage);
    setMessageText("");
  };


  return (
    <div className="w-full max-h-screen p-4 flex flex-col bg-gray-100 overflow-hidden">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Chat Room</h2>

      <div className="flex-1 overflow-y-auto bg-white rounded-md p-4 shadow-inner space-y-3">
        {messages.map((msg, idx) => {
          const isCurrentUser = msg.sender === currentUser.name;
          return (
            <div
              key={idx}
              className={`p-3 rounded-lg max-w-xs ${
                isCurrentUser
                  ? "bg-indigo-100 self-end text-right ml-auto"
                  : "bg-gray-200 self-start text-left mr-auto"
              }`}
            >
              <p className="text-sm font-semibold text-gray-800">{msg.sender}</p>
              <p className="mt-1">{msg.text}</p>
              <p className="text-xs text-gray-500 mt-1">{msg.timestamp}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-2 bg-white p-2 rounded shadow-md">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-300 rounded-md"
        />
        <button
          onClick={sendMessage}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Inbox;
