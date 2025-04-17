import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";



const socketUrl = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000'  // Local development URL
  : 'https://sa-task-management-backend.vercel.app'; // Production URL

const socket = io(socketUrl); // This will dynamically connect to the correct backend

const Inbox = () => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  const currentUser = {
    name: localStorage.getItem("name") || "User",
  };

  const scrollRef = useRef(null);

  // 🔄 Auto-scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await axios.get("https://sa-task-management-backend.vercel.app/api/messages");
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
        const res = await axios.put("https://sa-task-management-backend.vercel.app/api/mark-read", {
          name,
          role,
        });
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
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    try {
      // ✅ Save to MongoDB
      const res = await axios.post(
        "https://sa-task-management-backend.vercel.app/api/messages",
        newMessage
      );
      console.log("✅ Message saved to DB:", res.data);

      // ✅ Emit via socket
      socket.emit("sendMessage", res.data);
      console.log("📤 Message sent via socket:", res.data);

      setMessageText("");
    } catch (err) {
      console.error("❌ Failed to send message:", err.message);
    }
  };

  useEffect(() => {
    const name = localStorage.getItem("name");
    if (name) {
      socket.emit("register", name);
    }
  }, []);

  useEffect(() => {
    const markMessagesAsRead = async () => {
      try {
        await axios.put("https://sa-task-management-backend.vercel.app/api/mark-read");
        console.log("✅ All messages marked as read");

        // 🔥 Emit to update count in real time
        socket.emit("inboxRead");
      } catch (err) {
        console.error("❌ Failed to mark messages as read:", err.message);
      }
    };

    markMessagesAsRead();
  }, []);



  return (
    <div className="w-full max-h-screen p-4 flex flex-col bg-gray-100 overflow-hidden">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Chat Room</h2>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white px-4 py-6 space-y-4"
      >
        {messages.map((msg, idx) => {
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
            </div>
          );
        })}
      </div>

      <div className="relative mt-4 flex items-center bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-200">

       

        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
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
  );
};

export default Inbox;
