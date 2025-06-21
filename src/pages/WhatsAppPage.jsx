import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { QRCodeSVG } from "qrcode.react";
import ChatSidebar from "../Components/Whatsapp/ChatSidebar";
import ChatWindow from "../Components/Whatsapp/ChatWindow";
import SendBox from "../Components/Whatsapp/SendBox";
import { Search, MoreVertical, Smile, Paperclip, Send } from "lucide-react"; // <-- use Lucide for icons

const WhatsAppPage = () => {
  const [qr, setQr] = useState("");
  const [ready, setReady] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    const socket = io("http://localhost:1100");

    socket.on("qr", (data) => {
      console.log("Received QR:", data);
      setQr(data); // Set QR value for frontend
    });

    socket.on("ready", () => {
      setReady(true);
      setQr(""); // Clear QR code when ready
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // 1. On mount, check backend WhatsApp status
    fetch("http://localhost:1100/api/whatsapp/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.ready) setReady(true);
      });

    // 2. Then, open socket connection for live QR/ready events
    const s = io("http://localhost:1100", {
      transports: ["websocket", "polling"],
      reconnection: true,
    });

    s.on("qr", (data) => {
      setReady(false);
      setQr(data);
    });
    s.on("ready", () => {
      setReady(true);
      setQr(""); // clear QR code when ready
    });

    return () => {
      s.disconnect();
    };
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen w-full bg-[#f0f2f5] flex flex-col">
        {/* WhatsApp logo header */}
        <div className="flex items-center p-6">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp"
            className="h-8 mr-3"
          />
          <span className="text-[#25d366] text-2xl font-semibold">
            WhatsApp
          </span>
        </div>

        <div className="flex flex-1 justify-center items-center">
          {/* Card */}
          <div className="bg-white rounded-xl shadow-lg flex flex-col md:flex-row w-[90vw] max-w-3xl p-0 overflow-hidden border border-gray-200">
            {/* Right Section: QR and Steps */}
            <div className="flex-1 flex flex-col md:flex-row items-center p-8">
              {/* Instructions */}
              <div className="flex-1">
                <h1 className="text-3xl font-light text-gray-800 mb-4">
                  Log into WhatsApp Web
                </h1>
                <p className="text-gray-700 mb-6">
                  Message privately with friends and family using WhatsApp on
                  your browser.
                </p>
                <ol className="text-gray-800 space-y-2 mb-6">
                  <li>
                    <span className="font-bold">1.</span> Open WhatsApp on your
                    phone
                  </li>
                  <li>
                    <span className="font-bold">2.</span> Tap Menu{" "}
                    <span className="inline-block align-middle text-lg">⋮</span>{" "}
                    on Android, or Settings{" "}
                    <span role="img" aria-label="settings">
                      ⚙️
                    </span>{" "}
                    on iPhone
                  </li>
                  <li>
                    <span className="font-bold">3.</span> Tap Linked devices and
                    then Link a device
                  </li>
                  <li>
                    <span className="font-bold">4.</span> Point your phone at
                    this screen to scan the QR code
                  </li>
                </ol>
                <div className="space-x-4 flex items-center">
                  <a href="#" className="text-[#25d366] underline text-sm">
                    Need help getting started?
                  </a>
                  <a href="#" className="text-[#25d366] underline text-sm">
                    Log in with phone number
                  </a>
                </div>
              </div>
              {/* QR Code */}
              <div className="flex flex-col items-center justify-center md:ml-12 mt-8 md:mt-0">
                {qr ? (
                  <QRCodeSVG value={qr} size={220} />
                ) : (
                  <div className="w-[220px] h-[220px] flex items-center justify-center bg-gray-100 rounded-xl">
                    <span className="text-gray-400 text-lg">
                      Loading QR Code…
                    </span>
                  </div>
                )}
                <div className="flex items-center mt-4">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="accent-[#25d366] mr-2"
                  />
                  <span className="text-gray-600 text-sm">
                    Stay logged in on this browser
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log("ready ?", ready);

  // WhatsApp is ready, show chat UI
  return (
    <div className="flex h-screen w-screen bg-[#f0f2f5] font-[Segoe UI,Helvetica Neue,sans-serif]">
      {/* Sidebar */}
      <div className="h-full flex flex-col border-r border-[#e9edef] bg-white">
        <ChatSidebar onSelect={setSelectedChat} />
      </div>

      {/* Main chat area */}
      <div
        className="flex-1 flex flex-col bg-[#efeae2] relative"
        style={{
          backgroundImage: "url('whatsapp-bg-pattern.png')", // Use an asset or remove this line
          backgroundPosition: "center",
          backgroundSize: "412.5px 749.25px",
        }}
      >
        {selectedChat ? (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#fff] border-b border-[#e9edef] shadow-sm">
              <div className="flex items-center">
                <img
                  src={
                    selectedChat.profilePic ||
                    "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(selectedChat.name)
                  }
                  alt={selectedChat.name}
                  className="w-10 h-10 rounded-full object-cover mr-4"
                />
                <div>
                  <div className="font-medium text-[#222e35]">
                    {selectedChat.name}
                  </div>
                  <div className="text-xs text-[#667781]">Online</div>
                </div>
              </div>
              <div className="flex gap-5 text-[#54656f]">
                <Search size={22} />
                <MoreVertical size={22} />
              </div>
            </div>
            {/* Chat messages area */}
            <div
              className="flex-1 overflow-y-auto px-20 py-8"
              style={{
                backgroundImage: "url('whatsapp-bg-pattern.png')", // comment/remove if not needed
                backgroundSize: "cover",
              }}
            >
              <ChatWindow chatId={selectedChat.id} refreshFlag={refreshFlag} />
            </div>
            {/* Message input area */}
            <div className="flex mb-10 w-full items-center gap-2 px-4 py-2 ">
              <SendBox
                chatId={selectedChat.id}
                onSend={() => setRefreshFlag((f) => f + 1)}
              />
            </div>
          </>
        ) : (
          // Default "no chat selected" screen
          <div className="flex-1 flex flex-col items-center justify-center text-[#41525d]">
            <div className="w-[250px] h-[250px] bg-[#f0f2f5] rounded-full mb-8" />
            <h2 className="text-3xl font-light mb-4">WhatsApp Web</h2>
            <p className="max-w-lg text-center leading-relaxed mb-6">
              Send and receive messages without keeping your phone online.
              <br />
              Use WhatsApp on up to 4 linked devices and 1 phone at the same
              time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppPage;
