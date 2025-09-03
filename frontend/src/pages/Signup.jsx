import React, { useState } from "react";
import { signup } from "../api";
import { useNavigate } from "react-router-dom";

function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    profilePhoto: null,
  });
  const navigate = useNavigate();

  // Handle text input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle profile photo selection
  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setForm({ ...form, profilePhoto: e.target.files[0] });
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("username", form.username);
      formData.append("email", form.email);
      formData.append("password", form.password);
      if (form.profilePhoto) formData.append("profilePhoto", form.profilePhoto);

      await signup(formData);
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error(err);
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
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-2"
        />
        {form.profilePhoto && (
          <img
            src={URL.createObjectURL(form.profilePhoto)}
            alt="preview"
            className="w-20 h-20 object-cover rounded mb-2 border"
          />
        )}
        <button className="bg-blue-500 text-white px-4 py-2 w-full rounded">
          Signup
        </button>
      </form>
    </div>
  );
}

export default Signup;
