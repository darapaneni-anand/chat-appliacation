import React, { useEffect, useState } from "react";
import API from "../api";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ onSelectChat, selectedChat }) {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!user?._id) return;
    socket.emit("registerUser", user._id);
    socket.on("onlineUsers", (userIds) => setOnlineUsers(userIds));
    return () => socket.off("onlineUsers");
  }, [user?._id]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users");
        setUsers(res.data.filter((u) => u._id !== user._id));
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, [user?._id]);

  if (!users.length)
    return <p className="p-4 text-gray-500">Loading users...</p>;

  return (
    <div className="w-72 bg-white border-r border-gray-200 flex flex-col h-full shadow-lg">
      <div className="p-4 font-bold border-b text-xl text-gray-800 bg-gray-50">
        Chats
      </div>
      <div className="flex-1 overflow-y-auto">
        {users.map((u) => {
          const isOnline = onlineUsers.includes(u._id);
          return (
            <div
              key={u._id}
              onClick={() => onSelectChat(u)}
              className={`cursor-pointer flex items-center space-x-4 p-3 transition-all duration-200 rounded-lg mb-1 hover:bg-blue-50 ${
                selectedChat?._id === u._id ? "bg-blue-100" : ""
              }`}
            >
              <div className="relative">
                <img
                  src={
                    u.profilePhoto
                      ? u.profilePhoto.startsWith("http")
                        ? u.profilePhoto
                        : `http://localhost:5000${u.profilePhoto}`
                      : "/images/profile.png"
                  }
                  alt={u.username}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="font-semibold text-gray-800 truncate">
                  {u.username}
                </span>
                <span
                  className={`text-sm truncate ${
                    isOnline ? "text-green-500" : "text-gray-400"
                  }`}
                >
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
