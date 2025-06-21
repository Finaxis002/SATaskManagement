import React, { useRef, useState } from "react";
import { Smile, Paperclip, Send } from "lucide-react";

export default function SendBox({ chatId, onSend }) {
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  const sendMessage = async () => {
    const msg = value.trim();
    if (!msg) return;
    setValue("");
    // Call backend API to send message
    await fetch(`http://localhost:1100/api/whatsapp/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatId, message: msg }),
    });
    onSend?.(); // Optionally refetch messages in ChatWindow, if needed testing
    //comment 
  };

  // On Enter, send
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
   <div className="flex w-full items-center gap-2 pr-20 py-4 ">

      <div className="flex items-center gap-2 text-[#54656f] px-2">
        <button type="button" tabIndex={-1}><Smile size={26} /></button>
        <button type="button" tabIndex={-1}><Paperclip size={22} /></button>
      </div>
      <div className="flex-1 w-[70%] bg-white rounded-lg px-3 py-2 flex items-center">
        <input
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          className="w-full text-[15px] bg-transparent border-none outline-none"
        />
      </div>
      <button
        onClick={sendMessage}
        className="w-10 h-10 rounded-full bg-[#008069] flex items-center justify-center text-white ml-2"
      >
        <Send size={22} />
      </button>
    </div>
  );
}
