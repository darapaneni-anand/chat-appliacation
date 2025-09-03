import React, { useEffect, useState, useContext } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";

export default function Sidebar({ onSelectChat, selectedChat }) {
  const [users, setUsers] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!user?._id) return;

        const res = await API.get("/users"); // backend endpoint: /api/users
        const filteredUsers = res.data.filter((u) => u._id !== user._id);
        setUsers(filteredUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, [user]);

  if (!users.length) return <p className="p-4 text-gray-500">Loading user info...</p>;

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 font-bold border-b">Chats</div>
      <div className="flex-1 overflow-y-auto">
        {users.map((u) => (
          <div
            key={u._id}
            onClick={() => onSelectChat(u)}  // ✅ Use onSelectChat here
            className={`cursor-pointer flex items-center space-x-3 p-3 hover:bg-gray-100 ${
              selectedChat?._id === u._id ? "bg-gray-200" : ""
            }`}
          >
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

            <div className="flex flex-col">
              <span className="font-semibold">{u.username}</span>
              <span className="text-xs text-gray-500">{u.email}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
