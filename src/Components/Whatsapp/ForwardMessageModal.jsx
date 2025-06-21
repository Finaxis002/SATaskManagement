//ForwardMessageModal.jsx

import React, { useEffect, useState } from "react";
import { X, Search } from "lucide-react";

export default function ForwardMessageModal({
  open,
  onClose,
  onForward,
  message,
}) {
  const [whatsappReady, setWhatsappReady] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedChats, setSelectedChats] = useState([]);
  const [search, setSearch] = useState("");

 useEffect(() => {
   // Poll for WhatsApp ready status
   const interval = setInterval(() => {
     fetch("http://localhost:1100/api/whatsapp/status")
       .then((res) => res.json())
       .then((data) => {
         if (data.ready) {
           setWhatsappReady(true);
           clearInterval(interval);
         } else {
           setWhatsappReady(false);
         }
       })
       .catch(() => setWhatsappReady(false));
   }, 1500);
   return () => clearInterval(interval);
 }, []);
 
 useEffect(() => {
   if (!whatsappReady) return; // <--- Only fetch chats when ready
   fetch("http://localhost:1100/api/whatsapp/chats")
     .then((res) => res.json())
     .then((data) => {
       if (Array.isArray(data)) setChats(data);
       else setChats([]);
     })
     .catch(() => setChats([]));
 }, [whatsappReady]);
 

  // Filter chats based on search
  const filteredChats = search
    ? chats.filter(
        (chat) =>
          chat.name?.toLowerCase().includes(search.toLowerCase()) ||
          chat.id?._serialized?.includes(search)
      )
    : chats;

  // Select or unselect chat
  const toggleSelect = (chatId) => {
    setSelectedChats((prev) =>
      prev.includes(chatId)
        ? prev.filter((id) => id !== chatId)
        : [...prev, chatId]
    );
  };

  // Forward action
  const handleForward = () => {
    onForward(selectedChats, message);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center"
      style={{ backdropFilter: "blur(1.5px)" }}
    >
      <div
        className="bg-white w-full max-w-md rounded-xl shadow-lg relative flex flex-col"
        style={{ maxHeight: 540 }}
      >
        {/* Header */}
        <div className="flex items-center px-4 py-2 border-b gap-2">
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
            <X size={22} />
          </button>
          <span className="font-bold text-lg">Forward message to</span>
        </div>
        {/* Search */}
        <div className="px-4 py-2 flex items-center border-b gap-2">
          <Search size={18} className="text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border-none outline-none bg-transparent text-base"
            placeholder="Search chats"
            autoFocus
          />
        </div>
        {/* Chat list */}
        <div className="overflow-y-auto flex-1 py-2 px-2">
          {!whatsappReady && (
            <div className="text-gray-400 text-center py-8">
              Connecting to WhatsApp...
            </div>
          )}
          {whatsappReady && filteredChats.length === 0 && (
            <div className="text-gray-400 text-center py-8">
              No chats found.
            </div>
          )}
          {whatsappReady &&
            filteredChats.map((chat) => (
              <div
                key={chat.id._serialized}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100 transition ${
                  selectedChats.includes(chat.id._serialized)
                    ? "bg-indigo-100"
                    : ""
                }`}
                onClick={() => toggleSelect(chat.id._serialized)}
              >
                <input
                  type="checkbox"
                  checked={selectedChats.includes(chat.id._serialized)}
                  onChange={() => toggleSelect(chat.id._serialized)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <div className="font-medium">
                    {chat.name || chat.pushname || chat.id.user}
                  </div>
                  {chat.isGroup && (
                    <div className="text-xs text-gray-500">Group</div>
                  )}
                </div>
              </div>
            ))}
        </div>
        {/* Actions */}
        <div className="p-3 flex justify-end border-t">
          <button
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold disabled:bg-gray-300 transition"
            disabled={selectedChats.length === 0}
            onClick={handleForward}
          >
            Forward
          </button>
        </div>
      </div>
    </div>
  );
}
