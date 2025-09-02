import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // your backend URL

function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // Listen for messages from server
  useEffect(() => {
    socket.on("chatMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Cleanup when unmounted
    return () => {
      socket.off("chatMessage");
    };
  }, []);

  // Send message to server
  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === "") return;

    socket.emit("chatMessage", message); // send to backend
    setMessage(""); // clear input
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-gray-100 shadow-lg">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className="p-2 bg-white rounded shadow-sm text-gray-800"
          >
            {msg}
          </div>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={sendMessage}
        className="flex p-2 border-t bg-white"
      >
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border rounded p-2 mr-2"
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
