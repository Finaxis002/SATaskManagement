

// socketSetup.js or inside your component
import { io } from "socket.io-client";


const socket = io("https://sataskmanagementbackend.onrender.com" ,{
  withCredentials: true,
});

// Register the user email if available
const userEmail = localStorage.getItem("userId"); // ✅ using your stored value

if (userEmail) {
  socket.emit("register", userEmail); // Register this socket with email
}

export default socket;
