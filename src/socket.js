

// socketSetup.js or inside your component
import { io } from "socket.io-client";


const socket = io("https://taskbe.sharda.co.in", {
  withCredentials: true,
  transports: ["websocket"], // Ensures WebSocket transport
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});


// Register the user email if available
const userEmail = localStorage.getItem("userId"); // ✅ using your stored value

if (userEmail) {
  socket.emit("register", userEmail); // Register this socket with email
}

export default socket;