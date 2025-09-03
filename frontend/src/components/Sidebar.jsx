import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api";

function Sidebar({ onSelectChat }) {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/auth/users");
        setUsers(res.data.filter(u => u._id !== user._id));
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    if (user?._id) fetchUsers();
  }, [user]);

  return (
    <aside className="w-1/5 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Chats</h2>
      </div>
      {/* Search Bar */}
      <div className="p-3">
        <input
          type="text"
          placeholder="Search chats..."
          className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {/* Chat List */}
      <ul className="flex-1 overflow-y-auto">
        {users.map((user) => (
          <li
            key={user._id}
            onClick={() => onSelectChat(user)}
            className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100"
          >
            <div>
              <h3 className="text-sm font-semibold text-gray-800">{user.username}</h3>
              <p className="text-xs text-gray-500 truncate w-32">{user.email}</p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;