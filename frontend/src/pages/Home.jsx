import React, { useContext, useState, useEffect } from "react";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import Sidebar from "../components/Sidebar";
import { AuthContext } from "../context/AuthContext";

export default function Home() {
  const { user, setUser } = useContext(AuthContext); // Add setUser to update profile
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unread, setUnread] = useState({});

  // Track unread messages
  useEffect(() => {
    const handler = (e) => {
      setUnread((prev) => ({
        ...prev,
        [e.detail]: (prev[e.detail] || 0) + 1,
      }));
    };
    window.addEventListener("unread-message", handler);
    return () => window.removeEventListener("unread-message", handler);
  }, []);

  // Reset unread count when opening a chat
  useEffect(() => {
    if (selectedChat) {
      setUnread((prev) => ({ ...prev, [selectedChat._id]: 0 }));
    }
  }, [selectedChat]);

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <Sidebar onSelectChat={(u) => setSelectedChat(u)} unread={unread} />

      {/* Chat area */}
      {selectedChat ? (
        <>
          <ChatContainer
            chatUser={selectedChat}
            currentUser={user}
            messages={messages}
            setMessages={setMessages}
          />

          <RightSidebar
            chatUser={selectedChat}
            currentUser={user}
            messages={messages}
            setCurrentUser={setUser} // Allows profile photo update to reflect immediately
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
