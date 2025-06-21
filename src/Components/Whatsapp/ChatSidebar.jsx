import React, { useEffect, useState } from "react";
import { Search, MoreVertical, Users, MessageCircle } from "lucide-react"; // or use SVG icons

export default function ChatSidebar({ onSelect }) {
  const [chats, setChats] = useState([]);
  const [whatsappReady, setWhatsappReady] = useState(false);
  const [search, setSearch] = useState("");
    const [error, setError] = useState(null); // Error state to handle failure messages

useEffect(() => {
  // Poll for WhatsApp ready status
  const interval = setInterval(() => {
    fetch("http://localhost:1100/api/whatsapp/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.ready) {
          setWhatsappReady(true);
           setError(null); // Clear any previous error if ready
          clearInterval(interval);
        } else {
          setWhatsappReady(false);
           setError("Unable to connect to WhatsApp. Retrying...");
        }
      })
      .catch(() => setWhatsappReady(false));
  }, 1500);
  return () => clearInterval(interval);
}, []);

useEffect(() => {
  if (!whatsappReady) return; // Only fetch chats when ready

  const fetchChats = async () => {
    try {
      const res = await fetch("http://localhost:1100/api/whatsapp/chats");
      if (!res.ok) {
        throw new Error("Failed to fetch chats. Server unavailable.");
      }
      const data = await res.json();
      console.log("Fetched chats:", data);  // Log data to debug
      if (Array.isArray(data)) {
        setChats(data);
      } else {
        setChats([]);
      }
    } catch (err) {
      setError(err.message); // Set error if something goes wrong
      setChats([]); // Optionally clear chats if there's an error
      console.error("Error in fetchChats:", err);  // Log error for debugging
    }
  };

  fetchChats();
}, [whatsappReady]);


  console.log("chats :", chats);

  return (
    <div className=" w-[380px] h-screen flex flex-col border-r border-[#e0e0e0]">
      <div className="flex items-center justify-between px-4 py-3  border-b border-[#e0e0e0]">
        <div className="font-bold text-xl text-[#075e54]">WhatsApp</div>
        <div className="flex space-x-4">
          <button className="hover:bg-[#e6e6e6] p-2 rounded-full">
            <Users size={20} />
          </button>
          <button className="hover:bg-[#e6e6e6] p-2 rounded-full">
            <MessageCircle size={20} />
          </button>
          <button className="hover:bg-[#e6e6e6] p-2 rounded-full">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="flex items-center bg-[#f6f5f4] rounded-full shadow-sm px-3 py-1">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-2 border-none outline-none bg-transparent w-full text-[15px] py-1"
          />
        </div>
      </div>
      {/* Tabs */}
      <div className="flex space-x-2 px-3 pb-2">
        <button className="px-3 py-1 text-xs rounded-full bg-[#d1e7dd] text-[#25d366] font-semibold">
          All
        </button>
        <button className="px-3 py-1 text-xs rounded-full text-gray-600 hover:bg-[#ececec]">
          Unread
        </button>
        <button className="px-3 py-1 text-xs rounded-full text-gray-600 hover:bg-[#ececec]">
          Favourites
        </button>
        <button className="px-3 py-1 text-xs rounded-full text-gray-600 hover:bg-[#ececec]">
          Groups
        </button>
      </div>
      {!whatsappReady ? (
        <div style={{ padding: 10, color: "#888" }}>Loading chats...</div>
      ) : Array.isArray(chats) && chats.length > 0 ? (
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#d1d7db] scrollbar-track-transparent">
          {chats
            .filter(
              (c) =>
                c.name.toLowerCase().includes(search.toLowerCase()) ||
                (c.lastMessage &&
                  c.lastMessage.toLowerCase().includes(search.toLowerCase()))
            )
            .map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelect(chat)}
                className={`flex items-center px-4 py-2 cursor-pointer hover:bg-[#e9edef] transition group  ${
                  chat.unreadCount ? "bg-[#fff]" : ""
                }`}
              >
                {/* Avatar */}
                <img
                  src={
                    chat.profilePic ||
                    "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(chat.name)
                  }
                  alt={chat.name}
                  className="w-10 h-10 rounded-full object-cover "
                />
                {/* Chat Info */}
                <div className="flex-1 ml-3 min-w-0">
                  <div className="flex justify-between items-center">
                    <span
                      className={`truncate text-base ${
                        chat.isGroup ? "font-bold" : "font-medium"
                      } text-gray-900 font-normal text-[14px]`}
                    >
                      {chat.name}
                    </span>
                    {chat.time && (
                      <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                        {chat.time}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 truncate">
                      {chat.lastMessage || ""}
                    </span>
                    {chat.unreadCount > 0 && (
                      <span className="ml-2 bg-[#25d366] text-white text-xs rounded-full px-2 py-0.5 font-bold">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div style={{ padding: 10, color: "#888" }}>No chats found.</div>
      )}
    </div>
  );
}
