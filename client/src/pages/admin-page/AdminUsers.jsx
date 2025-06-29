import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../../components/ui/dropdown-menu";
import { useToast } from "../../components/ui/use-toast";
import {
  ChevronDown,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/auth";

function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    role: "user",
  });
  const [editingId, setEditingId] = useState(null);

  // Date filtering and sorting state
  const [dateSort, setDateSort] = useState("desc"); // "asc", "desc", or "none"
  const [selectedYear, setSelectedYear] = useState("all"); // "all" or specific year

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10); // Fixed at 10 users per page

  // Column visibility state
  const [visibleColumns, setVisibleColumns] = useState(() => {
    // Load saved preferences from localStorage
    const saved = localStorage.getItem("adminUsersColumnVisibility");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved column preferences:", e);
      }
    }
    // Default visibility
    return {
      id: true,
      name: true,
      email: true,
      role: true,
      createdDate: true,
      actions: true,
    };
  });

  // Available columns configuration
  const columnConfig = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "role", label: "Role" },
    { key: "createdDate", label: "Created Date" },
    { key: "actions", label: "Actions" },
  ];

  // Toggle column visibility
  const toggleColumn = (columnKey) => {
    setVisibleColumns((prev) => {
      const newVisibility = {
        ...prev,
        [columnKey]: !prev[columnKey],
      };
      // Save to localStorage
      localStorage.setItem(
        "adminUsersColumnVisibility",
        JSON.stringify(newVisibility)
      );
      return newVisibility;
    });
  };

  // Reset column visibility to default
  const resetColumns = () => {
    const defaultVisibility = {
      id: true,
      name: true,
      email: true,
      role: true,
      createdDate: true,
      actions: true,
    };
    setVisibleColumns(defaultVisibility);
    localStorage.setItem(
      "adminUsersColumnVisibility",
      JSON.stringify(defaultVisibility)
    );
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get unique years from users data
  const availableYears = useMemo(() => {
    const years = new Set();
    users.forEach((user) => {
      if (user.createdAt) {
        const year = new Date(user.createdAt).getFullYear();
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b - a); // Sort descending
  }, [users]);

  // Filter and sort users based on date filters
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = [...users];

    // Filter by year
    if (selectedYear !== "all") {
      filtered = filtered.filter((user) => {
        if (!user.createdAt) return false;
        const userYear = new Date(user.createdAt).getFullYear();
        return userYear === parseInt(selectedYear);
      });
    }

    // Sort by date
    if (dateSort !== "none") {
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);

        if (dateSort === "asc") {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
    }

    return filtered;
  }, [users, selectedYear, dateSort]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const endIndex = startIndex + usersPerPage;
  const currentUsers = filteredAndSortedUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, dateSort]);

  // Pagination controls
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Fetch users
  const fetchUsers = () => {
    axios
      .get(`${API_URL}/all-users`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          setUsers(res.data.users);
        } else {
          toast({
            title: "❌ Error",
            description: "Failed to fetch users",
            variant: "destructive",
            className: "bg-red-50 border-red-200 text-red-800",
          });
        }
      })
      .catch((error) => {
        console.error("Fetch users error:", error);
        toast({
          title: "❌ Error",
          description: "Failed to load users",
          variant: "destructive",
          className: "bg-red-50 border-red-200 text-red-800",
        });
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
        .put(`${API_URL}/update-user/${editingId}`, form, {
          withCredentials: true,
        })
        .then((res) => {
          if (res.data.success) {
            setEditingId(null);
            setForm({ userName: "", email: "", password: "", role: "user" });
            fetchUsers();
            toast({
              title: "✅ Success",
              description: "User updated successfully!",
              variant: "default",
              className: "bg-green-50 border-green-200 text-green-800",
            });
          } else {
            toast({
              title: "❌ Error",
              description: res.data.message || "Failed to update user",
              variant: "destructive",
              className: "bg-red-50 border-red-200 text-red-800",
            });
          }
        })
        .catch((error) => {
          console.error("Update user error:", error);
          toast({
            title: "❌ Error",
            description:
              error.response?.data?.message || "Failed to update user",
            variant: "destructive",
            className: "bg-red-50 border-red-200 text-red-800",
          });
        });
    } else {
      // Create user
      axios
        .post(`${API_URL}/create-user`, form, { withCredentials: true })
        .then((res) => {
          if (res.data.success) {
            setForm({ userName: "", email: "", password: "", role: "user" });
            fetchUsers();
            toast({
              title: "✅ Success",
              description: "User created successfully!",
              variant: "default",
              className: "bg-green-50 border-green-200 text-green-800",
            });
          } else {
            toast({
              title: "❌ Error",
              description: res.data.message || "Failed to create user",
              variant: "destructive",
              className: "bg-red-50 border-red-200 text-red-800",
            });
          }
        })
        .catch((error) => {
          console.error("Create user error:", error);
          toast({
            title: "❌ Error",
            description:
              error.response?.data?.message || "Failed to create user",
            variant: "destructive",
            className: "bg-red-50 border-red-200 text-red-800",
          });
        });
    }
  };

  // Edit user
  const handleEdit = (user) => {
    setEditingId(user._id);
    setForm({
      userName: user.userName,
      email: user.email,
      password: "",
      role: user.role,
    });
  };

  // Delete user
  const handleDelete = (id) => {
    // Find the user to get their email for the confirmation message
    const userToDelete = users.find((user) => (user._id || user.id) === id);
    const userEmail = userToDelete?.email || "this user";

    if (
      window.confirm(
        `Are you sure you want to delete user: ${userEmail}?\n\nThis action cannot be undone.`
      )
    ) {
      axios
        .delete(`${API_URL}/delete-user/${id}`, { withCredentials: true })
        .then((res) => {
          if (res.data.success) {
            fetchUsers();
            toast({
              title: "✅ Success",
              description: `User ${userEmail} deleted successfully!`,
              variant: "default",
              className: "bg-green-50 border-green-200 text-green-800",
            });
          } else {
            toast({
              title: "❌ Error",
              description: res.data.message || "Failed to delete user",
              variant: "destructive",
              className: "bg-red-50 border-red-200 text-red-800",
            });
          }
        })
        .catch((error) => {
          console.error("Delete user error:", error);
          toast({
            title: "❌ Error",
            description:
              error.response?.data?.message || "Failed to delete user",
            variant: "destructive",
            className: "bg-red-50 border-red-200 text-red-800",
          });
        });
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setForm({ userName: "", email: "", password: "", role: "user" });
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">Users</h1>
            </div>
          </div>
        </div>

        {/* Create New User Section */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-4 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Display Options Section */}
            <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
              <div className="flex items-center">
                <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wide border-b-2 border-blue-300 pb-1">
                  Display Options
                </h4>
              </div>
              {/* Column Visibility Dropdown */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-600">
                  Show Columns:
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                      <Settings size={16} />
                      <span className="text-sm">Columns</span>
                      <ChevronDown size={16} />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-48">
                    <DropdownMenuLabel>Visible Columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {columnConfig.map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.key}
                        checked={visibleColumns[column.key]}
                        onCheckedChange={() => toggleColumn(column.key)}
                      >
                        {column.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <button
                        onClick={resetColumns}
                        className="w-full text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded transition-colors"
                      >
                        Reset to Default
                      </button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Vertical Divider - Only show if Created Date column is visible */}
            {visibleColumns.createdDate && (
              <div className="flex items-center justify-center lg:mx-2">
                <div className="h-16 w-px bg-blue-400 shadow-sm"></div>
              </div>
            )}

            {/* Filter Options Section - Only show if Created Date column is visible */}
            {visibleColumns.createdDate && (
              <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
                <div className="flex items-center">
                  <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wide border-b-2 border-blue-300 pb-1">
                    Filter Options
                  </h4>
                </div>

                {/* Date Sort */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-600">
                    Sort by Date:
                  </label>
                  <Select value={dateSort} onValueChange={setDateSort}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Sort order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest First</SelectItem>
                      <SelectItem value="asc">Oldest First</SelectItem>
                      <SelectItem value="none">No Sorting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Year Filter */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-600">
                    Filter by Year:
                  </label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Years</SelectItem>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Reset Date Filters */}
                <button
                  onClick={() => {
                    setDateSort("desc");
                    setSelectedYear("all");
                  }}
                  className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* Results Count */}
            <div className="flex items-center ml-auto">
              <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-md border border-gray-200">
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredAndSortedUsers.length)} of{" "}
                {filteredAndSortedUsers.length} users
                {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
              </span>
            </div>
          </div>
        </div>
        {/* User Form */}
        <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
          <h3 className="text-lg font-bold text-blue-800 uppercase tracking-wide border-b-2 border-blue-300 pb-1 mb-2 inline-block">
            {editingId ? "Edit User" : "Create New User"}
          </h3>
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
        {/* Users Table */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1 flex flex-col">
            <table className="min-w-full text-left">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr>
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
                  <tr key={user._id || user.id} className="hover:bg-gray-50">
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
                      <td className="py-2 px-4 border-b text-sm">
                        {user.email}
                      </td>
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <div className="flex items-center space-x-1">
                {/* Previous Button */}
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-300 hover:bg-gray-400 text-gray-700"
                  }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there's a gap
                    const showEllipsis =
                      index > 0 && page - array[index - 1] > 1;

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => goToPage(page)}
                          className={`px-3 py-1 rounded text-sm transition-colors ${
                            page === currentPage
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}

                {/* Next Button */}
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gray-300 hover:bg-gray-400 text-gray-700"
                  }`}
                >
                  Next
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Go to page:</span>
                <input
                  type="number"
                  min="1"
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) => {
                    const page = parseInt(e.target.value);
                    if (page >= 1 && page <= totalPages) {
                      goToPage(page);
                    }
                  }}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {currentUsers.length === 0 && filteredAndSortedUsers.length > 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found matching the current filters.
              <button
                onClick={() => {
                  setDateSort("desc");
                  setSelectedYear("all");
                }}
                className="block mx-auto mt-2 text-blue-600 hover:text-blue-800 underline"
              >
                Clear filters
              </button>
            </div>
          )}

          {users.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No users found. Create your first user above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
