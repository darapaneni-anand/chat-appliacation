import React, { useState, useEffect, useRef } from "react";
import API from "../api";
import socket from "../socket";
import { useAuth } from "../context/AuthContext";

export default function ChatContainer({ chatUser, messages, setMessages }) {
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const fileInputRef = useRef();
  const messagesEndRef = useRef();

  // Load messages on chatUser change
  useEffect(() => {
    setMessages([]);
    if (!user?._id || !chatUser?._id) return;

    const fetchMessages = async () => {
      try {
        const res = await API.get(`/messages/${user._id}/${chatUser._id}`);
        setMessages(Array.isArray(res.data) ? res.data : res.data.messages || []);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [user?._id, chatUser?._id]);

  // Socket listener
  useEffect(() => {
    if (!user?._id) return;

    socket.emit("registerUser", user._id);

    const handleReceive = (msg) => {
      if (
        (msg.sender === chatUser._id && msg.receiver === user._id) ||
        (msg.sender === user._id && msg.receiver === chatUser._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, [user?._id, chatUser?._id]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!input.trim() && !image) return;

    try {
      const formData = new FormData();
      formData.append("sender", user._id);
      formData.append("receiver", chatUser._id);
      formData.append("text", input);
      if (image) formData.append("image", image);

      const res = await API.post("/messages/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      socket.emit("sendMessage", res.data.data);
      setInput("");
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (!user?._id || !chatUser?._id) {
    return <p className="text-gray-500 p-4">Select a chat to start messaging.</p>;
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      {/* Header */}
      <div className="p-4 border-b bg-white shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800">{chatUser.username}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, i) => {
          const isSender = msg.sender === user._id;
          const imageUrl = msg.imageUrl || msg.image || "";
          const displayImage = imageUrl
            ? imageUrl.startsWith("http")
              ? imageUrl
              : `http://localhost:5000${imageUrl}`
            : null;

          return (
            <div key={msg._id || i} className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
              <div className="max-w-xs">
                {displayImage && (
                  <img
                    src={displayImage}
                    alt="sent"
                    className="mb-2 max-w-full rounded-lg shadow-sm"
                  />
                )}
                {msg.text && (
                  <p
                    className={`px-4 py-2 rounded-lg break-words ${
                      isSender ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {msg.text}
                    <span className="block text-xs opacity-70 text-right mt-1">
                      {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </p>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input area */}
      <div className="p-4 flex items-center space-x-2 border-t bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={(e) => setImage(e.target.files[0])}
        />
        {image && (
          <div className="flex items-center space-x-1">
            <img
              src={URL.createObjectURL(image)}
              alt="preview"
              className="w-16 h-16 object-cover rounded border"
            />
            <button
              onClick={() => setImage(null)}
              className="px-2 py-1 bg-red-500 text-white text-xs rounded"
            >
              ✖
            </button>
          </div>
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
        >
          📷
        </button>
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
