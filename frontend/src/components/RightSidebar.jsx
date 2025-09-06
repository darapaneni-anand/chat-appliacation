import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api";
import socket from "../socket";

export default function RightSidebar({ chatUserId, messages }) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [chatUser, setChatUser] = useState(null);

  useEffect(() => {
    if (!chatUserId) return;

    const fetchUser = async () => {
      try {
        const res = await API.get(`/users/${chatUserId}`);
        setChatUser(res.data.user);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };

    fetchUser();
  }, [chatUserId]);

  useEffect(() => {
    if (!user?._id) return;
    socket.emit("registerUser", user._id);
    socket.on("onlineUsers", setOnlineUsers);
    return () => socket.off("onlineUsers");
  }, [user?._id]);

  if (!chatUser) return null;

  const isOnline = onlineUsers.includes(chatUser._id);

  const formatLastSeen = (dateString) =>
    dateString ? new Date(dateString).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Unavailable";

  return (
    <aside className="w-72 bg-white shadow-lg rounded-l-2xl flex flex-col h-full">
      {/* Profile */}
      <div className="p-4 border-b flex flex-col items-center bg-gradient-to-b from-blue-50 to-white rounded-t-2xl">
        <img
          src={chatUser.profilePhoto?.startsWith("http") ? chatUser.profilePhoto : "/images/profile.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full border-2 border-blue-200 object-cover"
        />
        <h2 className="mt-3 text-lg font-bold text-gray-800">{chatUser.username}</h2>
        <span className={`text-sm ${isOnline ? "text-green-500" : "text-gray-500"}`}>
          {isOnline ? "Online" : `Last seen ${formatLastSeen(chatUser.lastSeen)}`}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 border-b text-sm text-gray-700 space-y-2">
        <p>
          <span className="font-semibold">Email:</span> {chatUser.email}
        </p>
      </div>

      {/* Shared Media */}
      <div className="p-4 flex-1 overflow-y-auto">
        <h3 className="font-semibold mb-2 text-gray-700">Shared Media</h3>
        {messages
          .filter((m) => (m.sender === user._id && m.receiver === chatUser._id) || (m.sender === chatUser._id && m.receiver === user._id))
          .filter((m) => m.imageUrl || m.image)
          .map((m, i) => {
            const imgSrc = m.imageUrl ? (m.imageUrl.startsWith("http") ? m.imageUrl : `http://localhost:5000${m.imageUrl}`) : m.image ? `http://localhost:5000${m.image}` : "";
            return <img key={`${m._id}-${i}`} src={imgSrc} alt={`shared-${i}`} className="w-32 h-32 object-cover rounded-md mb-2 shadow-sm" />;
          })}
      </div>
    </aside>
  );
}
