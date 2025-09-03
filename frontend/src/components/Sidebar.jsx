import React, { useEffect, useState, useContext } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // 👈 adjust for production

export default function Sidebar({ onSelectChat, selectedChat }) {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user?._id) return;

    // ✅ Tell backend this user is online
    socket.emit("registerUser", user._id);

    // ✅ Listen for online users update
    socket.on("onlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });

    return () => {
      socket.off("onlineUsers");
    };
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

  if (!users.length) return <p className="p-4 text-gray-500">Loading users...</p>;

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 font-bold border-b">Chats</div>
      <div className="flex-1 overflow-y-auto">
        {users.map((u) => {
          const isOnline = onlineUsers.includes(u._id);
          return (
            <div
              key={u._id}
              onClick={() => onSelectChat(u)}
              className={`cursor-pointer flex items-center space-x-3 p-3 hover:bg-gray-100 ${
                selectedChat?._id === u._id ? "bg-gray-200" : ""
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
                  className="w-10 h-10 rounded-full object-cover"
                />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold">{u.username}</span>
                <span className="text-xs text-gray-500">
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
