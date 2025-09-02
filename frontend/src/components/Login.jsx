import React, { useState } from "react";
import { login } from "../api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form);
      localStorage.setItem("token", res.data.token);
      navigate("/chat"); 
    } catch (err) {
      alert("Login failed!");
    }
  };

  return (
    <div className="p-6 border rounded w-80 mx-auto mt-10">
      <h2 className="text-xl mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
        />
        <button className="bg-green-500 text-white px-4 py-2">Login</button>
      </form>
      <p className="mt-2 text-sm">
        Don’t have an account?{" "}
        <a href="/signup" className="text-blue-500">Sign Up</a>
      </p>
    </div>
  );
}

export default Login;
