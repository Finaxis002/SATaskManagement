import React, { useEffect, useRef, useState } from "react";
import { MoreVertical, CornerUpRight, Download } from "lucide-react";
import ForwardMessageModal from "./ForwardMessageModal";

export default function ChatWindow({ chatId, refreshFlag }) {
  const [messages, setMessages] = useState([]);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [messageToForward, setMessageToForward] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [selectedChats, setSelectedChats] = useState([]);
  const [search, setSearch] = useState("");
  const [error , setError] = useState("");

  const listRef = useRef(null);

  async function isWhatsAppReady() {
  try {
    const res = await fetch("http://localhost:1100/api/whatsapp/status");
    const data = await res.json();
    return !!data.ready;
  } catch (e) {
    return false;
  }
}

useEffect(() => {
  if (!chatId) return setMessages([]);
  // Only fetch if WhatsApp is ready
  isWhatsAppReady().then((ready) => {
    if (!ready) {
      setMessages([]); // Optionally show "Connecting..." etc
      return;
    }
    fetch(`http://localhost:1100/api/whatsapp/messages/${chatId}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMessages(data);
        else setMessages([]);
      })
      .catch(() => setMessages([]));
  });
}, [chatId, refreshFlag]);


  // On chat switch: always scroll to bottom after messages load
  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [chatId, messages.length]);

  const handleForward = (msg) => {
    setMessageToForward(msg);
    setForwardModalOpen(true);
    // Fetch chat list for modal
    fetch("http://localhost:1100/api/whatsapp/chats")
      .then((res) => res.json())
      .then((data) => setChatList(Array.isArray(data) ? data : []));
  };

  return (
    <div className="flex  flex-col flex-1 min-h-0 bg-[#efeae2] bg-[url('/whatsapp-bg-pattern.png')] bg-repeat bg-cover">
      <div
        ref={listRef}
        className="flex-1 overflow-x-hidden overflow-y-auto flex flex-col gap-1  py-4"
        style={{ minHeight: 0 }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`group flex ${
              msg.fromMe ? "justify-end" : "justify-start"
            }`}
          >
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow hover:bg-[#f0f0f0] transition cursor-pointer">
              <button onClick={() => handleForward(msg)} title="Forward">
                <CornerUpRight size={12} />
              </button>
            </div>

            <div
              className={`
                relative px-2 py-2 shadow-sm rounded-lg max-w-[80%] min-w-[60px] mb-[2px] flex flex-col
                ${
                  msg.fromMe
                    ? "bg-[#d9fdd3] rounded-br-none"
                    : "bg-white rounded-bl-none"
                }
              `}
              style={{
                wordBreak: "break-word",
                border: "1px solid #ece5dd",
              }}
            >
              {/* Show sender for group/incoming */}
              {msg.author && !msg.fromMe && (
                <div className="text-[12px] font-semibold text-[#25d366] mb-1">
                  {msg.author}
                </div>
              )}
              <div className="text-[14px] text-[#222e35]">
                {renderBody(msg)}
              </div>
              <div className="flex justify-end">
                <span className="text-[11px] text-gray-500 mt-1 ml-2">
                  {msg.time || ""}
                </span>
              </div>
              {/* Tail */}
              <span
                className={`absolute -bottom-1 ${
                  msg.fromMe
                    ? "-right-2 border-l-[12px] border-l-[#d9fdd3] border-b-[10px] border-b-transparent"
                    : "-left-2 border-r-[12px] border-r-white border-b-[10px] border-b-transparent"
                } w-0 h-0`}
                style={{
                  borderLeftColor: msg.fromMe ? "#d9fdd3" : undefined,
                  borderRightColor: !msg.fromMe ? "#fff" : undefined,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <ForwardMessageModal
        open={forwardModalOpen}
        onClose={() => setForwardModalOpen(false)}
        onForward={(chatIds, message) => {
          // Make your API call to forward the message to chatIds here!
          // For example:
          fetch("http://localhost:1100/api/whatsapp/forward", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chatIds, message }),
          });
        }}
        message={messageToForward}
      />
    </div>
  );
}

// Helper: Render links in messages
function renderBody(msg) {
  // Show image
  if (
    msg.media &&
    msg.media.mimetype &&
    msg.media.mimetype.startsWith("image/")
  ) {
    return (
      <img
        src={`data:${msg.media.mimetype};base64,${msg.media.data}`}
        alt={msg.media.filename || "image"}
        style={{ maxWidth: 220, borderRadius: 4 }}
      />
    );
  }

  // Show video
  if (
    msg.media &&
    msg.media.mimetype &&
    msg.media.mimetype.startsWith("video/")
  ) {
    return (
      <video controls style={{ maxWidth: 300, borderRadius: 4 }}>
        <source src={`data:${msg.media.mimetype};base64,${msg.media.data}`} />
        Your browser does not support the video tag.
      </video>
    );
  }

  // Show documents and other files (downloadable)
  if (
    msg.media &&
    msg.media.mimetype &&
    msg.media.mimetype.startsWith("application/")
  ) {
    return (
      <a
        href={`data:${msg.media.mimetype};base64,${msg.media.data}`}
        download={msg.media.filename || "document"}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#34b7f1] underline break-all"
      >
        {msg.media.filename || "Download file"}
      </a>
    );
  }

  // Show audio (optional)
  if (
    msg.media &&
    msg.media.mimetype &&
    msg.media.mimetype.startsWith("audio/")
  ) {
    return (
      <audio controls>
        <source src={`data:${msg.media.mimetype};base64,${msg.media.data}`} />
        Your browser does not support the audio element.
      </audio>
    );
  }

  // Show text with clickable links
  if (msg.body) {
    const urlRegex = /((https?:\/\/[^\s]+))/g;
    const parts = msg.body.split(urlRegex);
    return parts.map((part, i) =>
      urlRegex.test(part) ? (
        <a
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#34b7f1] underline break-all"
          key={i}
        >
          {part}
        </a>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  }

  return null;
}
