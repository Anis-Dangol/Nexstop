import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useToast } from "../../components/ui/use-toast";
import UserHeader from "../../components/admin-view/admin-users/UserHeader";
import UserFilters from "../../components/admin-view/admin-users/UserFilters";
import UserForm from "../../components/admin-view/admin-users/UserForm";
import UserTable from "../../components/admin-view/admin-users/UserTable";
import UserPagination from "../../components/admin-view/admin-users/UserPagination";

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

  // Bulk selection states
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

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

  // Clean up selections when filtered users change
  useEffect(() => {
    const visibleUserIds = currentUsers.map((user) => user._id);
    setSelectedUsers((prev) =>
      prev.filter((id) => visibleUserIds.includes(id))
    );
    setSelectAll(false);
  }, [selectedYear, dateSort, currentPage]);

  // Keyboard shortcuts for bulk actions
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+A to select all
      if (e.ctrlKey && e.key === "a" && !editingId) {
        e.preventDefault();
        handleSelectAll();
      }
      // Delete key to delete selected users
      if (e.key === "Delete" && selectedUsers.length > 0 && !editingId) {
        e.preventDefault();
        handleBulkDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedUsers, editingId]);

  // Fetch users
  const fetchUsers = () => {
    axios
      .get(`${API_URL}/all-users`, { withCredentials: true })
      .then((res) => {
        if (res.data.success) {
          setUsers(res.data.users);
          // Reset bulk selection when users are reloaded
          setSelectedUsers([]);
          setSelectAll(false);
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

  // Bulk selection functions
  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        // Remove from selection
        const newSelection = prev.filter((id) => id !== userId);
        setSelectAll(
          newSelection.length === currentUsers.length && currentUsers.length > 0
        );
        return newSelection;
      } else {
        // Add to selection
        const newSelection = [...prev, userId];
        setSelectAll(newSelection.length === currentUsers.length);
        return newSelection;
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all
      setSelectedUsers([]);
      setSelectAll(false);
    } else {
      // Select all visible users
      const allUserIds = currentUsers.map((user) => user._id);
      setSelectedUsers(allUserIds);
      setSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      toast({
        title: "⚠️ Warning",
        description: "Please select users to delete.",
        variant: "destructive",
        className: "bg-yellow-50 border-yellow-200 text-yellow-800",
      });
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${
      selectedUsers.length
    } user${
      selectedUsers.length > 1 ? "s" : ""
    }? This action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      try {
        setBulkDeleteLoading(true);

        // Delete users one by one
        const deletionPromises = selectedUsers.map((userId) =>
          axios.delete(`${API_URL}/delete-user/${userId}`, {
            withCredentials: true,
          })
        );
        await Promise.all(deletionPromises);

        // Reload users and reset selection
        fetchUsers();
        toast({
          title: "✅ Success",
          description: `Successfully deleted ${selectedUsers.length} user${
            selectedUsers.length > 1 ? "s" : ""
          }!`,
          className: "bg-green-50 border-green-200 text-green-800",
        });
      } catch (error) {
        console.error("Error deleting users:", error);
        toast({
          title: "❌ Error",
          description: "Failed to delete some users. Please try again.",
          variant: "destructive",
          className: "bg-red-50 border-red-200 text-red-800",
        });
      } finally {
        setBulkDeleteLoading(false);
      }
    }
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

  // Go to specific page
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen p-2">
      <div className="max-w-7xl mx-auto">
        <UserHeader />

        <UserFilters
          visibleColumns={visibleColumns}
          columnConfig={columnConfig}
          toggleColumn={toggleColumn}
          resetColumns={resetColumns}
          dateSort={dateSort}
          setDateSort={setDateSort}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          availableYears={availableYears}
          startIndex={startIndex}
          endIndex={endIndex}
          filteredAndSortedUsers={filteredAndSortedUsers}
          currentPage={currentPage}
          totalPages={totalPages}
        />

        <UserForm
          form={form}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          editingId={editingId}
          handleCancel={handleCancel}
          selectedUsers={selectedUsers}
          handleBulkDelete={handleBulkDelete}
          bulkDeleteLoading={bulkDeleteLoading}
        />

        <UserTable
          currentUsers={currentUsers}
          users={users}
          filteredAndSortedUsers={filteredAndSortedUsers}
          visibleColumns={visibleColumns}
          dateSort={dateSort}
          selectedUsers={selectedUsers}
          selectAll={selectAll}
          handleSelectAll={handleSelectAll}
          handleSelectUser={handleSelectUser}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          formatDate={formatDate}
        />

        <UserPagination
          totalPages={totalPages}
          currentPage={currentPage}
          goToPage={goToPage}
          setCurrentPage={setCurrentPage}
          setDateSort={setDateSort}
          setSelectedYear={setSelectedYear}
        />
      </div>
    </div>
  );
}

export default AdminUsers;
