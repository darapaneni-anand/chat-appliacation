import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function RightSidebar({ chatUser, messages }) {
  const { user } = useContext(AuthContext);

  if (!chatUser || !user)
    return (
      <aside className="w-1/5 bg-white border-l border-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Select a chat to view details.</p>
      </aside>
    );

  return (
    <aside className="w-1/5 bg-white border-l border-gray-200 flex flex-col">
      {/* Profile */}
      <div className="p-4 border-b flex flex-col items-center">
        <img
          src={
            chatUser.profilePhoto
              ? chatUser.profilePhoto.startsWith("http")
                ? chatUser.profilePhoto
                : `http://localhost:5000${chatUser.profilePhoto}`
              : "/images/profile.png"
          }
          alt="Profile"
          className="w-20 h-20 rounded-full border object-cover"
        />
        <h2 className="mt-3 text-lg font-bold">{chatUser.username}</h2>
        <span className="text-sm text-green-500">Online</span>
      </div>

      {/* User Info */}
      <div className="p-4 border-b text-sm text-gray-700 space-y-2">
        <p><span className="font-semibold">Email:</span> {chatUser.email}</p>
      </div>

      {/* Shared Media */}
      <div className="p-4 flex-1 overflow-y-auto">
        <h3 className="font-semibold mb-2">Shared Media</h3>
        {messages
          .filter(
            (m) =>
              (m.sender === user._id && m.receiver === chatUser._id) ||
              (m.sender === chatUser._id && m.receiver === user._id)
          )
          .filter((m) => m.imageUrl)
          .map((m, i) => (
            <img
  key={`${m._id}-${i}`}
  src={m.imageUrl.startsWith("http") ? m.imageUrl : `http://localhost:5000${m.imageUrl}`}
  alt={`shared-${i}`}
  className="w-32 h-32 object-cover rounded-md mb-2"
/>

          ))}
      </div>
    </aside>
  );
}
