import React, { useEffect } from "react";
import { FaDownload, FaFile } from "react-icons/fa";

const ChatMessages = ({
  selectedUser,
  messages,
  selectedGroup,
  scrollRef,
  currentUser,
  downloadProgress,
  downloadImage,
  downloadPdf,
  handleFileDownload,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {/* {selectedGroup
            ? `Chat with ${selectedGroup}` // If a group is selected, show group name
            : `${selectedUser.name}`
            ? `Chat with ${selectedUser.name}` // If a user is selected, show user name
            : "Select a Group or User to Chat"}{" "} */}
        {/* Default message if none is selected */}

        {selectedUser
          ? `Chat with ${selectedUser.name || selectedUser.userId}` // If it's an admin, use `userId`
          : selectedGroup
          ? `Chat with ${selectedGroup}`
          : "Select a Group or User to Chat"}
      </h2>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white px-4 py-6 space-y-4 mb-4"
      >
        {Array.isArray(messages) && messages.length > 0 ? (
          <>
            {/* ✅ Read Messages */}
            {messages
              .filter((msg) => msg.read || msg.sender === currentUser.name)
              .map((msg, idx) => {
                const isCurrentUser = msg.sender === currentUser.name;

                // Support both single fileUrl (old messages) and multiple fileUrls (new)
                const filesArray =
                  msg.fileUrls &&
                  Array.isArray(msg.fileUrls) &&
                  msg.fileUrls.length > 0
                    ? msg.fileUrls
                    : msg.fileUrl
                    ? [msg.fileUrl]
                    : [];

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
                          isCurrentUser ? "text-gray-50" : "text-gray-500"
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* 📎 File Attachments (multiple) */}
                    {filesArray.length > 0 && (
                      <div className="my-2 flex flex-col gap-2">
                        {filesArray.map((fileUrl, fIdx) =>
                          fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                            <a
                              key={`img-${fIdx}`}
                              onClick={() => downloadImage(fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block relative"
                            >
                              <img
                                src={`https://taskbe.sharda.co.in${fileUrl}`}
                                alt="image"
                                className="rounded-lg w-full max-w-xs shadow-sm"
                              />
                              <div className="absolute top-2 right-2 bg-blue-500 text-white p-2 rounded-full">
                                <FaDownload size={9} />
                              </div>
                            </a>
                          ) : fileUrl.match(/\.pdf$/i) ? (
                            <a
                              key={`pdf-${fIdx}`}
                              onClick={() => downloadPdf(fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between gap-3 bg-white  text-gray-800 border border-gray-300 rounded-lg px-3 py-2 shadow-sm max-w-xs"
                            >
                              <div className="flex items-center gap-2">
                                <FaFile className="text-red-500 text-xl" />
                                <div>
                                  <p className="text-sm font-medium truncate">
                                    {fileUrl.split("/").pop()}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    PDF Document
                                  </p>
                                </div>
                              </div>
                              <div className="top-2 right-2 bg-blue-500 text-white p-2 rounded-full">
                                <FaDownload size={9} />
                              </div>
                              {downloadProgress !== null && (
                                <div className="fixed top-16 left-1/2 transform -translate-x-1/2 w-64 bg-gray-200 rounded-full h-3 flex items-center shadow z-50">
                                  <div
                                    className="bg-green-500 h-3 rounded-full"
                                    style={{ width: `${downloadProgress}%` }}
                                  ></div>
                                  <span className="absolute right-2 text-xs font-bold text-green-700">
                                    {downloadProgress}%
                                  </span>
                                </div>
                              )}
                            </a>
                          ) : (
                            <a
                              key={`file-${fIdx}`}
                              onClick={() => handleFileDownload(fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-white text-black border border-gray-300 rounded-lg px-3 py-2 shadow-sm max-w-xs text-sm"
                            >
                              <FaFile className="text-blue-500 text-lg" />
                              <span className="truncate">
                                {fileUrl.split("/").pop()}
                              </span>
                              <div className="top-2 right-2 bg-blue-500 text-white p-2 rounded-full">
                                <FaDownload size={9} />
                              </div>
                            </a>
                          )
                        )}
                      </div>
                    )}

                    {/* 💬 Text Message with Link Detection */}
                    {msg.text && (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                        {msg.text.split(" ").map((part, i) =>
                          part.match(/(https?:\/\/[^\s]+)/gi) ? (
                            <a
                              key={i}
                              href={part}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`underline break-all ${
                                isCurrentUser
                                  ? "text-blue-200"
                                  : "text-blue-600"
                              }`}
                            >
                              {part}{" "}
                            </a>
                          ) : (
                            part + " "
                          )
                        )}
                      </p>
                    )}
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
                // Repeat the same logic as above for unread messages
                const filesArray =
                  msg.fileUrls &&
                  Array.isArray(msg.fileUrls) &&
                  msg.fileUrls.length > 0
                    ? msg.fileUrls
                    : msg.fileUrl
                    ? [msg.fileUrl]
                    : [];

                return (
                  <div
                    key={`unread-${idx}`}
                    className="max-w-sm p-3 rounded-xl shadow-md border-2 border-gray-200 bg-gray-200 text-gray-800 mr-auto rounded-bl-none"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold">
                        {msg.sender}
                      </span>
                      <span className="text-[10px] text-gray-800">
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* 📎 File Attachments (multiple) */}
                    {filesArray.length > 0 && (
                      <div className="my-2 flex flex-col gap-2">
                        {filesArray.map((fileUrl, fIdx) =>
                          fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                            <a
                              key={`img-${fIdx}`}
                              onClick={() => downloadImage(fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block relative"
                            >
                              <img
                                src={`https://taskbe.sharda.co.in${fileUrl}`}
                                alt="image"
                                className="rounded-lg w-full max-w-xs shadow-sm"
                              />
                              <div className="absolute top-2 right-2 bg-blue-500 text-white p-2 rounded-full">
                                <FaDownload size={9} />
                              </div>
                            </a>
                          ) : fileUrl.match(/\.pdf$/i) ? (
                            <a
                              key={`pdf-${fIdx}`}
                              onClick={() => downloadPdf(fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-between gap-3 bg-white  text-gray-800 border border-gray-300 rounded-lg px-3 py-2 shadow-sm max-w-xs"
                            >
                              <div className="flex items-center gap-2">
                                <FaFile className="text-red-500 text-xl" />
                                <div>
                                  <p className="text-sm font-medium truncate">
                                    {fileUrl.split("/").pop()}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    PDF Document
                                  </p>
                                </div>
                              </div>
                              <div className="top-2 right-2 bg-blue-500 text-white p-2 rounded-full">
                                <FaDownload size={9} />
                              </div>
                              {downloadProgress !== null && (
                                <div className="fixed top-16 left-1/2 transform -translate-x-1/2 w-64 bg-gray-200 rounded-full h-3 flex items-center shadow z-50">
                                  <div
                                    className="bg-green-500 h-3 rounded-full"
                                    style={{ width: `${downloadProgress}%` }}
                                  ></div>
                                  <span className="absolute right-2 text-xs font-bold text-green-700">
                                    {downloadProgress}%
                                  </span>
                                </div>
                              )}
                            </a>
                          ) : (
                            <a
                              key={`file-${fIdx}`}
                              onClick={() => handleFileDownload(fileUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 bg-white text-black border border-gray-300 rounded-lg px-3 py-2 shadow-sm max-w-xs text-sm"
                            >
                              <FaFile className="text-blue-500 text-lg" />
                              <span className="truncate">
                                {fileUrl.split("/").pop()}
                              </span>
                              <div className="top-2 right-2 bg-blue-500 text-white p-2 rounded-full">
                                <FaDownload size={9} />
                              </div>
                            </a>
                          )
                        )}
                      </div>
                    )}

                    {/* 💬 Text Message with Link Detection */}
                    {msg.text && (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">
                        {msg.text.split(" ").map((part, i) =>
                          part.match(/(https?:\/\/[^\s]+)/gi) ? (
                            <a
                              key={i}
                              href={part}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline break-all"
                            >
                              {part}{" "}
                            </a>
                          ) : (
                            part + " "
                          )
                        )}
                      </p>
                    )}
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
    </div>
  );
};

export default ChatMessages;
