import React from "react";

const UserTable = ({
  currentUsers,
  users,
  filteredAndSortedUsers,
  visibleColumns,
  dateSort,
  selectedUsers,
  selectAll,
  handleSelectAll,
  handleSelectUser,
  handleEdit,
  handleDelete,
  formatDate,
}) => {
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="overflow-x-auto flex-1 flex flex-col">
        <table className="min-w-full text-left">
          <thead className="sticky top-0 bg-white z-10 shadow-sm">
            <tr>
              <th className="py-3 px-4 border-b-2 border-gray-200 font-semibold text-gray-700 bg-gray-50 w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </th>
              {visibleColumns.id && (
                <th className="py-3 px-4 border-b-2 border-gray-200 font-semibold text-gray-700 bg-gray-50">
                  ID
                </th>
              )}
              {visibleColumns.name && (
                <th className="py-3 px-4 border-b-2 border-gray-200 font-semibold text-gray-700 bg-gray-50">
                  Name
                </th>
              )}
              {visibleColumns.email && (
                <th className="py-3 px-4 border-b-2 border-gray-200 font-semibold text-gray-700 bg-gray-50">
                  Email
                </th>
              )}
              {visibleColumns.role && (
                <th className="py-3 px-4 border-b-2 border-gray-200 font-semibold text-gray-700 bg-gray-50">
                  Role
                </th>
              )}
              {visibleColumns.createdDate && (
                <th className="py-3 px-4 border-b-2 border-gray-200 font-semibold text-gray-700 bg-gray-50">
                  <div className="flex items-center space-x-1">
                    <span>Created Date</span>
                    {dateSort === "asc" && (
                      <span className="text-blue-600">↑</span>
                    )}
                    {dateSort === "desc" && (
                      <span className="text-blue-600">↓</span>
                    )}
                  </div>
                </th>
              )}
              {visibleColumns.actions && (
                <th className="py-3 px-4 border-b-2 border-gray-200 font-semibold text-gray-700 bg-gray-50">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="overflow-y-auto">
            {currentUsers.map((user) => (
              <tr
                key={user._id || user.id}
                className={`hover:bg-gray-50 transition-colors ${
                  selectedUsers.includes(user._id || user.id)
                    ? "bg-blue-50"
                    : ""
                }`}
              >
                <td className="py-2 px-4 border-b">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id || user.id)}
                    onChange={() => handleSelectUser(user._id || user.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                {visibleColumns.id && (
                  <td className="py-4 px-4 border-b text-sm text-gray-600">
                    {(user._id || user.id)?.substring()}
                  </td>
                )}
                {visibleColumns.name && (
                  <td className="py-2 px-4 border-b text-sm">
                    {user.userName || user.name}
                  </td>
                )}
                {visibleColumns.email && (
                  <td className="py-2 px-4 border-b text-sm">{user.email}</td>
                )}
                {visibleColumns.role && (
                  <td className="py-2 px-4 border-b text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                )}
                {visibleColumns.createdDate && (
                  <td className="py-2 px-4 border-b text-sm text-gray-600">
                    {formatDate(user.createdAt)}
                  </td>
                )}
                {visibleColumns.actions && (
                  <td className="py-2 px-4 border-b">
                    <div className="flex space-x-2">
                      <button
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        onClick={() => handleDelete(user._id || user.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {currentUsers.length === 0 && filteredAndSortedUsers.length > 0 && (
        <div className="text-center py-8 text-gray-500">
          No users found matching the current filters.
        </div>
      )}

      {users.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No users found. Create your first user above.
        </div>
      )}
    </div>
  );
};

export default UserTable;
