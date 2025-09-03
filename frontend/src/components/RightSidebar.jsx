import React from "react";

export default function RightSidebar({ chatUser }) {
  // Example shared images (later can be fetched from DB)
  const sharedImages = [
    "https://via.placeholder.com/150/60A5FA/FFFFFF?text=Img1",
    "https://via.placeholder.com/150/FBBF24/FFFFFF?text=Img2",
    "https://via.placeholder.com/150/34D399/FFFFFF?text=Img3",
  ];

  if (!chatUser) {
    return (
      <aside className="w-1/5 bg-white border-l border-gray-200 flex flex-col items-center justify-center">
        <p className="text-gray-500">Select a chat to view details.</p>
      </aside>
    );
  }

  return (
    <aside className="w-1/5 bg-white border-l border-gray-200 flex flex-col">
      {/* Profile Section */}
      <div className="p-4 border-b flex flex-col items-center">
        <img
          src="https://via.placeholder.com/80"
          alt="Profile"
          className="w-20 h-20 rounded-full border"
        />
        <h2 className="mt-3 text-lg font-bold text-gray-800">{chatUser.username}</h2>
        <span className="text-sm text-green-500">Online</span>
      </div>

      {/* User Info */}
      <div className="p-4 border-b space-y-2 text-sm text-gray-700">
        <p>
          <span className="font-semibold">Email:</span> {chatUser.email || `${chatUser.username.toLowerCase()}@example.com`}
        </p>
        <p>
          <span className="font-semibold">Phone:</span> +91 9876543210
        </p>
      </div>

      {/* Shared Images */}
      <div className="p-4 flex-1 overflow-y-auto">
        <h3 className="font-semibold text-gray-800 mb-2">Shared Media</h3>
        <div className="grid grid-cols-2 gap-2">
          {sharedImages.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`shared-${index}`}
              className="w-full h-24 object-cover rounded-md"
            />
          ))}
        </div>
      </div>
    </aside>
  );
}