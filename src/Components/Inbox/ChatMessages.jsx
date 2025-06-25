import React, { useEffect, useRef, useState } from "react";
import { FaDownload, FaFile, FaShare, FaTimes } from "react-icons/fa";
import axios from "axios";
import ForwardFileModal from "./ForwardFileModal";

const ChatMessages = ({
  selectedUser,
  messages,
  selectedGroup,
  scrollRef,
  currentUser,
  downloadProgress,
  downloadImage,
  downloadPdf,
  users,
  groups,
}) => {
  const [forwardingFile, setForwardingFile] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardRecipients, setForwardRecipients] = useState([]);

  const [availableRecipients, setAvailableRecipients] = useState([]);
  const messageEndRef = useRef(null); // Reference for scroll position
  useEffect(() => {
    // Scroll to the bottom when the messages array changes (new message received)
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // Trigger the effect when messages change

  const handleFileDownload = (fileUrl) => {
    const fileName = fileUrl.split("/").pop(); // Extract file name
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName; // Set the file name for download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const isFileTypeSupported = (fileUrl) => {
    const supportedExtensions = ["js", "html", "css", "tsx", "jsx"];
    const fileExtension = fileUrl.split(".").pop()?.toLowerCase();
    return supportedExtensions.includes(fileExtension);
  };

  // Function to handle file forwarding
  const handleForwardFile = (fileUrl) => {
    setForwardingFile(fileUrl);
    setShowForwardModal(true);

    // Generate list of available recipients (users and groups)
    const recipients = [
      ...users.map((user) => ({
        type: "user",
        id: user.name || user.userId,
        name: user.name,
        position: user.position,
      })),
      ...groups.map((group) => ({ type: "group", id: group, name: group })),
    ];

    setAvailableRecipients(recipients);
  };

  const forwardFile = async () => {
    if (!forwardingFile || forwardRecipients.length === 0) return;

    try {
      for (let recipientId of forwardRecipients) {
        const recipient = availableRecipients.find((r) => r.id === recipientId);

        const newMessage = {
          sender: currentUser.name,
          text: `Forwarded file: ${forwardingFile.split("/").pop()}`,
          fileUrls: [forwardingFile],
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          readBy: [currentUser.name],
          ...(recipient.type === "user" && {
            recipient: recipient.id,
          }),
          ...(recipient.type === "group" && {
            group: recipient.id,
          }),
        };

        if (recipient.type === "user") {
          await axios.post(
            `https://taskbe.sharda.co.in/api/messages/user/${recipient.id}`,
            newMessage
          );
        } else {
          await axios.post(
            `https://taskbe.sharda.co.in/api/messages/${encodeURIComponent(
              recipient.id
            )}`,
            newMessage
          );
        }
      }

      // Close modal and reset state
      setShowForwardModal(false);
      setForwardingFile(null);
      setForwardRecipients([]);
    } catch (err) {
      console.error("Error forwarding file:", err);
    }
  };

  const renderFileWithActions = (fileUrl, isCurrentUser) => {
    if (fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i)) {
      return (
    <div className="flex items-end gap-2">
  <a
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
  </a>
  <div className="flex flex-col gap-2">
    <div
      className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600 cursor-pointer"
      onClick={() => handleForwardFile(fileUrl)}
      title="Forward"
    >
      <FaShare size={14} />
    </div>
    <div
      className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 cursor-pointer"
      onClick={() => downloadImage(fileUrl)}
      title="Download"
    >
      <FaDownload size={14} />
    </div>
  </div>
</div>

      );
    } else if (fileUrl.match(/\.pdf$/i)) {
      return (
        <div className="flex items-center justify-between gap-3 bg-white text-gray-800 border border-gray-300 rounded-lg px-3 py-2 shadow-sm max-w-xs">
          <div className="flex items-center gap-2">
            <FaFile className="text-red-500 text-xl" />
            <div>
              <p className="text-sm font-medium truncate">
                {fileUrl.split("/").pop()}
              </p>
              <p className="text-xs text-gray-500">PDF Document</p>
            </div>
          </div>
          <div className="flex gap-1">
            <div
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 cursor-pointer"
              onClick={() => handleForwardFile(fileUrl)}
            >
              <FaShare size={9} />
            </div>
            <div
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 cursor-pointer"
              onClick={() => downloadPdf(fileUrl)}
            >
              <FaDownload size={9} />
            </div>
          </div>
        </div>
      );
    } else if (isFileTypeSupported(fileUrl)) {
      return (
        <div className="flex items-center gap-2 bg-white text-black border border-gray-300 rounded-lg px-3 py-2 shadow-sm max-w-xs text-sm">
          <FaFile className="text-blue-500 text-lg" />
          <span className="truncate">{fileUrl.split("/").pop()}</span>
          <div className="flex gap-1 ml-auto">
            <div
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 cursor-pointer"
              onClick={() => handleForwardFile(fileUrl)}
            >
              <FaShare size={9} />
            </div>
            <div
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 cursor-pointer"
              onClick={() => handleFileDownload(fileUrl)}
            >
              <FaDownload size={9} />
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-gray-50">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {selectedUser
          ? `Chat with ${selectedUser.name || selectedUser.userId}`
          : selectedGroup
          ? `Chat with ${selectedGroup}`
          : "Select a Group or User to Chat"}
      </h2>

      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white px-4 py-6 space-y-4 mb-4">
        {Array.isArray(messages) && messages.length > 0 ? (
          <>
            {/* ✅ Read Messages */}
            {messages
              .filter(
                (msg) =>
                  msg.readBy?.includes(currentUser.name) ||
                  msg.sender === currentUser.name
              )
              .map((msg, idx) => {
                const isCurrentUser = msg.sender === currentUser.name;
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

                    {/* 📎 File Attachments */}
                    {filesArray.length > 0 && (
                      <div className="my-2 flex flex-col gap-2">
                        {filesArray.map((fileUrl, fIdx) => (
                          <div key={`file-${fIdx}`}>
                            {renderFileWithActions(fileUrl, isCurrentUser)}
                          </div>
                        ))}
                      </div>
                    )}

                    {showForwardModal && (
                      <ForwardFileModal
                        showForwardModal={showForwardModal}
                        setShowForwardModal={setShowForwardModal}
                        forwardRecipients={forwardRecipients}
                        setForwardRecipients={setForwardRecipients}
                        availableRecipients={availableRecipients}
                        forwardFile={forwardFile}
                      />
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
              (msg) =>
                !msg.readBy?.includes(currentUser.name) &&
                msg.sender !== currentUser.name
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
              .filter(
                (msg) =>
                  !msg.readBy?.includes(currentUser.name) &&
                  msg.sender !== currentUser.name
              )
              .map((msg, idx) => {
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

                    {/* 📎 File Attachments */}
                    {filesArray.length > 0 && (
                      <div className="my-2 flex flex-col gap-2">
                        {filesArray.map((fileUrl, fIdx) => {
                          if (fileUrl.match(/\.(jpeg|jpg|png|gif|webp)$/i)) {
                            return (
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
                            );
                          } else if (fileUrl.match(/\.pdf$/i)) {
                            return (
                              <a
                                key={`pdf-${fIdx}`}
                                onClick={() => downloadPdf(fileUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between gap-3 bg-white text-gray-800 border border-gray-300 rounded-lg px-3 py-2 shadow-sm max-w-xs"
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
                              </a>
                            );
                          } else if (isFileTypeSupported(fileUrl)) {
                            return (
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
                            );
                          }
                        })}
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
        {/* Scroll to Bottom Indicator */}
        <div ref={messageEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;
