

// socketSetup.js or inside your component
import { io } from "socket.io-client";


const socket = io("https://sataskmanagementbackend.onrender.com", {
  withCredentials: true,
  transports: ["websocket"], // Ensures WebSocket transport

});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});


// Register the user email if available
const userEmail = localStorage.getItem("userId"); // ✅ using your stored value
const userRole = localStorage.getItem("role");
const userName = localStorage.getItem("name") || userEmail.split('@')[0];

// Log the role and email to ensure they are correctly fetched
console.log("Frontend role:", userRole);  // Debugging log
console.log("Frontend email:", userEmail);  // Debugging log

// if (userEmail && userRole ) {
//   socket.emit("register", userEmail, userRole );
//   console.log("socket registered ", userRole)
// }
if (userEmail && userName) {
  socket.emit("register", userEmail, userName, userRole);
  console.log("Registered socket:", { userEmail, userName, userRole });
}

export default socket;
