import React, { useState, useContext } from "react";
import { login as loginApi } from "../api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form.email, form.password); // context handles API call and user storage
      navigate("/");
    } catch (err) {
      alert("Login failed!");
    }
  };
  return (
    <div className="p-6 border rounded w-80 mx-auto mt-10">
      <h2 className="text-xl mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="border p-2 w-full mb-2" />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="border p-2 w-full mb-2" />
        <button className="bg-green-500 text-white px-4 py-2">Login</button>
      </form>
    </div>
  );
}

export default Login;
