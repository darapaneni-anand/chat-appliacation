import { io } from "socket.io-client";

const socket = io("https://chat-application-2-3ne8.onrender.com", {
  withCredentials: true, // optional
});

export default socket;
