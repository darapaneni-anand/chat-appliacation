import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import API from "../api";

// Only create socket once
const socket = io("http://localhost:5000");

export default function ChatContainer({ chatUser, currentUser, messages, setMessages }) {
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const fileInputRef = useRef();

  // Load old messages from DB and clear when chat changes
  useEffect(() => {
    setMessages([]); // Clear messages when chat changes
    if (currentUser?._id && chatUser?._id) {
      const fetchMessages = async () => {
        try {
          const res = await API.get(`/messages/${currentUser._id}/${chatUser._id}`);
          setMessages(res.data);
        } catch (err) {
          console.error("Error fetching messages:", err);
        }
      };
      fetchMessages();
    }
  }, [currentUser, chatUser, setMessages]);

  // Register user + listen for new messages
  useEffect(() => {
    if (currentUser?._id && chatUser?._id) {
      socket.emit("registerUser", currentUser._id);

      const handleReceiveMessage = (msg) => {
        if (
          (msg.sender === chatUser._id && msg.receiver === currentUser._id)
        ) {
          setMessages((prev) => [...prev, msg]);
        } else if (
          msg.receiver === currentUser._id &&
          msg.sender !== chatUser._id
        ) {
          window.dispatchEvent(new CustomEvent("unread-message", { detail: msg.sender }));
        }
      };

      socket.on("receiveMessage", handleReceiveMessage);

      return () => {
        socket.off("receiveMessage", handleReceiveMessage);
      };
    }
  }, [currentUser, chatUser, setMessages]);

  // Send message (text or image)
  const sendMessage = async () => {
    if ((input.trim() || image) && currentUser?._id && chatUser?._id) {
      const newMsg = {
        sender: currentUser._id,
        receiver: chatUser._id,
        text: input,
        time: new Date().toLocaleTimeString(),
      };

      // If image is selected, upload it
      if (image) {
        const formData = new FormData();
        formData.append("sender", currentUser._id);
        formData.append("receiver", chatUser._id);
        formData.append("image", image);
        formData.append("text", input);

        try {
          const res = await API.post("/messages/image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          socket.emit("sendMessage", res.data);
          setMessages((prev) => [...prev, res.data]);
        } catch (err) {
          console.error("Error sending image message:", err);
        }
        setImage(null);
        setInput("");
        return;
      }

      try {
        await API.post("/messages", newMsg);
        socket.emit("sendMessage", newMsg);
        setMessages((prev) => [...prev, newMsg]);
        setInput("");
      } catch (err) {
        console.error("Error sending message:", err);
      }
    }
  };

  // Fallback UI if users are not loaded
  if (!currentUser?._id || !chatUser?._id) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center">
        <p className="text-gray-500">Select a chat to start messaging.</p>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <h2 className="font-bold">{chatUser.username}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === currentUser._id ? "justify-end" : "justify-start"
            }`}
          >
            <div>
              {msg.imageUrl && (
                <img
                  src={msg.imageUrl}
                  alt="sent"
                  className="mb-2 max-w-xs rounded"
                />
              )}
              <p
                className={`px-4 py-2 rounded-lg ${
                  msg.sender === currentUser._id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {msg.text}
                <span className="block text-xs opacity-70">
                  {new Date(msg.createdAt || Date.now()).toLocaleTimeString()}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 flex items-center border-t bg-white">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border px-3 py-2 rounded-md"
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={e => setImage(e.target.files[0])}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current.click()}
          className="ml-2 px-3 py-2 bg-gray-200 rounded-md"
        >
          📷
        </button>
        <button
          onClick={sendMessage}
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md"
        >
          Send
        </button>
      </div>
    </main>
  );
}