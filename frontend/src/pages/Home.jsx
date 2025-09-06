import React, { useState } from "react";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null); // stores selected user object
  const [messages, setMessages] = useState([]);

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar with user list */}
      <Sidebar
        onSelectChat={(user) => setSelectedChat(user)}
        selectedChat={selectedChat}
      />

      {/* Main chat area */}
      {selectedChat ? (
        <>
          <ChatContainer
            chatUser={selectedChat}
            messages={messages}
            setMessages={setMessages}
          />
          <RightSidebar
            chatUserId={selectedChat._id} // only passing userId now
            messages={messages}
          />
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 text-lg">
            👋 Welcome {user.username}, select a chat
          </p>
        </div>
      )}
    </div>
  );
}
