import React, { useState } from "react";
import { signup } from "../api";

function Signup({ onSignup }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await signup(form);
      alert("Signup successful! Please login.");
      onSignup();
    } catch (err) {
      alert("Signup failed!");
    }
  };

  return (
    <div className="p-6 border rounded w-80 mx-auto mt-10">
      <h2 className="text-xl mb-4">Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="border p-2 w-full mb-2"
        />
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
        <button className="bg-blue-500 text-white px-4 py-2">Signup</button>
      </form>
    </div>
  );
}

export default Signup;
