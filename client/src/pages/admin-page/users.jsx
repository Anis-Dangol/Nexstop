import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api/auth";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ userName: "", email: "", password: "", role: "user" });
  const [editingId, setEditingId] = useState(null);

  // Fetch users
  const fetchUsers = () => {
    axios
      .get(`${API_URL}/all-users`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) setUsers(res.data.users);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create or update user
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      // Update user
      axios
        .put(
          `${API_URL}/update-user/${editingId}`,
          form,
          { withCredentials: true }
        )
        .then((res) => {
          setEditingId(null);
          setForm({ userName: "", email: "", password: "", role: "user" });
          fetchUsers();
        });
    } else {
      // Create user
      axios
        .post(
          `${API_URL}/create-user`,
          form,
          { withCredentials: true }
        )
        .then((res) => {
          setForm({ userName: "", email: "", password: "", role: "user" });
          fetchUsers();
        });
    }
  };

  // Edit user
  const handleEdit = (user) => {
    setEditingId(user._id);
    setForm({ userName: user.userName, email: user.email, password: "", role: user.role });
  };

  // Delete user
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      axios
        .delete(`${API_URL}/delete-user/${id}`, { withCredentials: true })
        .then(() => fetchUsers());
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setForm({ userName: "", email: "", password: "", role: "user" });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-700">Users</h2>
      {/* User Form */}
      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap gap-2 items-end">
        <input
          type="text"
          name="userName"
          placeholder="Name"
          value={form.userName}
          onChange={handleChange}
          required
          className="border px-2 py-1 rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="border px-2 py-1 rounded"
        />
        <input
          type="password"
          name="password"
          placeholder={editingId ? "New Password (optional)" : "Password"}
          value={form.password}
          onChange={handleChange}
          className="border px-2 py-1 rounded"
        />
        <select
          name="role"
          value={form.role}
          onChange={handleChange}
          className="border px-2 py-1 rounded"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-1 rounded"
        >
          {editingId ? "Update User" : "Create User"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-400 text-white px-3 py-1 rounded"
          >
            Cancel
          </button>
        )}
      </form>
      {/* Users Table */}
      <table className="min-w-full text-left">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Role</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id || user.id}>
              <td className="py-2 px-4 border-b">{user._id || user.id}</td>
              <td className="py-2 px-4 border-b">{user.userName || user.name}</td>
              <td className="py-2 px-4 border-b">{user.email}</td>
              <td className="py-2 px-4 border-b">{user.role}</td>
              <td className="py-2 px-4 border-b">
                <button
                  className="bg-yellow-400 text-white px-2 py-1 rounded mr-2"
                  onClick={() => handleEdit(user)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-600 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(user._id || user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;
