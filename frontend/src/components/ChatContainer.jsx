import React, { useState, useEffect, useRef, useContext } from "react";
import { io } from "socket.io-client";
import API from "../api";
import { AuthContext } from "../context/AuthContext";

const socket = io("http://localhost:5000");

export default function ChatContainer({ chatUser, messages, setMessages }) {
  const { user } = useContext(AuthContext); // ✅ use context
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const fileInputRef = useRef();
  const messagesEndRef = useRef();

  // Load messages
  useEffect(() => {
    setMessages([]);
    if (user?._id && chatUser?._id) {
      const fetchMessages = async () => {
        try {
          const res = await API.get(`/messages/${user._id}/${chatUser._id}`);
          setMessages(res.data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchMessages();
    }
  }, [user, chatUser, setMessages]);

  // Socket listener
  useEffect(() => {
    if (user?._id) socket.emit("registerUser", user._id);

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
  }, [user, chatUser, setMessages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const sendMessage = async () => {
  if (!input.trim() && !image) return;

  try {
    let res;

    if (image) {
      const formData = new FormData();
      formData.append("sender", user._id);
      formData.append("receiver", chatUser._id);
      formData.append("text", input);
      formData.append("image", image);

      res = await API.post("/messages/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      res = await API.post("/messages", {
        sender: user._id,
        receiver: chatUser._id,
        text: input,
      });
    }

    // only emit, don’t update state here
    socket.emit("sendMessage", res.data);

    setInput("");
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  } catch (err) {
    console.error(err);
  }
};

  if (!user?._id || !chatUser?._id)
    return <p className="text-gray-500 p-4">Select a chat to start messaging.</p>;

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold">{chatUser.username}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, i) => (
          <div key={`${msg._id}-${i}`} className={`flex ${msg.sender === user._id ? "justify-end" : "justify-start"}`}>
            <div>
              {msg.imageUrl && (
                <img
                  src={msg.imageUrl.startsWith("http") ? msg.imageUrl : `http://localhost:5000${msg.imageUrl}`}
                  alt="sent"
                  className="mb-2 max-w-xs rounded"
                />
              )}
              {msg.text && (
                <p
                  className={`px-4 py-2 rounded-lg ${
                    msg.sender === user._id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {msg.text}
                  <span className="block text-xs opacity-70">
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString()}
                  </span>
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input */}
      <div className="p-4 flex items-center space-x-2 border-t bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border px-3 py-2 rounded-md"
        />
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={(e) => setImage(e.target.files[0])} />
        {image && (
          <div className="flex items-center space-x-1">
            <img src={URL.createObjectURL(image)} alt="preview" className="w-16 h-16 object-cover rounded border" />
            <button onClick={() => setImage(null)} className="px-2 py-1 bg-red-500 text-white text-xs rounded">✖</button>
          </div>
        )}
        <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 bg-gray-200 rounded-md">📷</button>
        <button onClick={sendMessage} className="px-4 py-2 bg-blue-600 text-white rounded-md">Send</button>
      </div>
    </div>
  );
}
