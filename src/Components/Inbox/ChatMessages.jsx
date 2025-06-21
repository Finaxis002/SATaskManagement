import React, { useEffect } from "react";

const ChatMessages = ({ messages, currentUser, scrollRef }) => {
  useEffect(() => {
    scrollRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      {messages.map((msg, idx) => {
        const isCurrentUser = msg.sender === currentUser.name;

        return (
          <div
            key={idx}
            className={`flex flex-col items-${
              isCurrentUser ? "end" : "start"
            } mb-3`}
          >
            {!isCurrentUser && (
              <div className="text-sm font-semibold text-gray-600 mb-1">
                {msg.sender}
              </div>
            )}

            <div
              className={`max-w-xs break-words rounded-lg px-4 py-2 text-sm shadow ${
                isCurrentUser
                  ? "bg-blue-500 text-white"
                  : "bg-white border border-gray-300 text-gray-800"
              }`}
            >
              {msg.fileUrl && (
                <div className="mb-2">
                  {msg.fileUrl.endsWith(".jpg") ||
                  msg.fileUrl.endsWith(".png") ||
                  msg.fileUrl.endsWith(".jpeg") ? (
                    <img
                      src={msg.fileUrl}
                      alt="attachment"
                      className="rounded-md w-48 mb-2"
                    />
                  ) : (
                    <a
                      href={msg.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-200 underline block truncate w-48"
                    >
                      📎 {msg.fileUrl.split("/").pop()}
                    </a>
                  )}
                </div>
              )}
              <div>{msg.text}</div>
              <div className="text-right text-[10px] text-gray-200 mt-1">
                {msg.timestamp}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={scrollRef} />
    </div>
  );
};

export default ChatMessages;
