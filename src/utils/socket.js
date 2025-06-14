// socket.js
import { io } from "socket.io-client";
const socket = io("https://taskbe.sharda.co.in", {
  withCredentials: true,
});
export default socket;
