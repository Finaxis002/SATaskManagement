// import { io } from "socket.io-client";

// const socket = io("http://localhost:5000", {
//   withCredentials: true,
// });

// export default socket;



// socketSetup.js or inside your component
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  withCredentials: true,
});

const userEmail = localStorage.getItem("userId"); // ✅ using your stored value

if (userEmail) {
  socket.emit("register", userEmail); // register this socket with email
}
export default socket;
