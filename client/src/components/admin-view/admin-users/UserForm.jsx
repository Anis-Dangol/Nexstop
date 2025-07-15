import React from "react";

const UserForm = ({
  form,
  handleChange,
  handleSubmit,
  editingId,
  handleCancel,
  selectedUsers,
  handleBulkDelete,
  bulkDeleteLoading,
}) => {
  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
        <h3 className="text-lg font-bold text-blue-800 uppercase tracking-wide border-b-2 border-blue-300 pb-1 mb-2 inline-block">
          {editingId ? "Edit User" : "Create New User"}
        </h3>
        {selectedUsers.length > 0 && (
          <span className="text-sm text-orange-700 bg-orange-50 px-3 py-1 rounded-md border border-orange-200">
            {selectedUsers.length} user
            {selectedUsers.length > 1 ? "s" : ""} selected
          </span>
        )}

        {selectedUsers.length > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleteLoading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
            title={`Delete ${selectedUsers.length} selected user${
              selectedUsers.length > 1 ? "s" : ""
            }`}
          >
            {bulkDeleteLoading
              ? "Deleting..."
              : `🗑️ Delete ${selectedUsers.length} User${
                  selectedUsers.length > 1 ? "s" : ""
                }`}
          </button>
        )}
      </div>
      <div>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3"
        >
          <input
            type="text"
            name="userName"
            placeholder="Name"
            value={form.userName}
            onChange={handleChange}
            required
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="password"
            name="password"
            placeholder={editingId ? "New Password (optional)" : "Password"}
            value={form.password}
            onChange={handleChange}
            required={!editingId}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors font-medium"
          >
            {editingId ? "Update User" : "Create User"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors font-medium"
            >
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserForm;
