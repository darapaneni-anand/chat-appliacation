import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach JWT token if available
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// 👇 Export helper functions
export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);
export const fetchMessages = (user1, user2) =>
  API.get(`/messages/${user1}/${user2}`);
export const sendMessage = (message) => API.post("/messages", message);

export default API; // still export default for flexibility
