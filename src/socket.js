

// socketSetup.js or inside your component
import { io } from "socket.io-client";


const socket = io("https://taskbe.sharda.co.in", {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});


// Register the user email if available
const userEmail = localStorage.getItem("userId"); // ✅ using your stored value

if (userEmail) {
  socket.emit("register", userEmail); // Register this socket with email
}

// Add the event listener for the 'client-reconnected' event
socket.on("client-reconnected", (data) => {
  console.log("WhatsApp client reconnected successfully.");
  
  // Example: Update the UI or show a message
  alert("WhatsApp client reconnected! Please refresh or rescan the QR if needed.");
});

export default socket;