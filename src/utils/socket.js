// socket.js
import { io } from "socket.io-client";
const socket = io("https://sataskmanagementbackend.onrender.com", {
  withCredentials: true,
});
export default socket;
