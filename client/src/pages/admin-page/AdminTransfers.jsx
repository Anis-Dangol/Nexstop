import React, { useState, useEffect, useMemo } from "react";
import {
  fetchTransfers,
  createTransfer,
  updateTransfer,
  deleteTransfer,
  bulkImportTransfers,
} from "../../services/transfers";

function AdminTransfers() {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("none"); // "none", "asc", "desc"
  const [editingTransfer, setEditingTransfer] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    transfer1: "",
    transfer2: "",
  });

  // Add new transfer modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [newTransfer, setNewTransfer] = useState({
    name: "",
    transfer1: "",
    transfer2: "",
  });

  // Load transfers from MongoDB
  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async () => {
    try {
      setLoading(true);
      const transfersData = await fetchTransfers();
      const formattedTransfers = transfersData.map((transfer) => ({
        id: transfer._id,
        number: transfer.transferNumber,
        name: transfer.name,
        transfer1: transfer.transfer1,
        transfer2: transfer.transfer2,
      }));
      setTransfers(formattedTransfers);
    } catch (error) {
      console.error("Error loading transfers:", error);
      alert("Failed to load transfers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit button click
  const handleEdit = (transfer) => {
    setEditingTransfer(transfer.id);
    setEditForm({
      name: transfer.name,
      transfer1: transfer.transfer1,
      transfer2: transfer.transfer2,
    });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingTransfer(null);
    setEditForm({
      name: "",
      transfer1: "",
      transfer2: "",
    });
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save changes to transfer
  const handleSaveEdit = async () => {
    const originalTransfer = transfers.find(
      (transfer) => transfer.id === editingTransfer
    );
    if (!originalTransfer) return;

    if (
      !editForm.name.trim() ||
      !editForm.transfer1.trim() ||
      !editForm.transfer2.trim()
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setSubmitLoading(true);
      const updatedTransferData = {
        name: editForm.name.trim(),
        transfer1: editForm.transfer1.trim(),
        transfer2: editForm.transfer2.trim(),
      };

      await updateTransfer(editingTransfer, updatedTransferData);

      // Reload transfers to get the updated data
      await loadTransfers();

      // Clear editing state
      setEditingTransfer(null);
      setEditForm({
        name: "",
        transfer1: "",
        transfer2: "",
      });

      alert("Transfer updated successfully!");
    } catch (error) {
      console.error("Error updating transfer:", error);
      alert("Failed to update transfer. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle add new transfer
  const handleAddTransfer = async (e) => {
    e.preventDefault();

    try {
      setSubmitLoading(true);

      // Validate input
      if (
        !newTransfer.name.trim() ||
        !newTransfer.transfer1.trim() ||
        !newTransfer.transfer2.trim()
      ) {
        alert("Please fill in all required fields.");
        return;
      }

      // Create new transfer object
      const newTransferData = {
        name: newTransfer.name.trim(),
        transfer1: newTransfer.transfer1.trim(),
        transfer2: newTransfer.transfer2.trim(),
      };

      await createTransfer(newTransferData);

      // Reload transfers to get the updated data
      await loadTransfers();

      // Reset form and close modal
      setNewTransfer({
        name: "",
        transfer1: "",
        transfer2: "",
      });
      setShowAddModal(false);

      alert("Transfer added successfully!");
    } catch (error) {
      console.error("Error adding transfer:", error);
      alert("Failed to add transfer. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Close add modal
  const closeAddModal = () => {
    setShowAddModal(false);
    setNewTransfer({
      name: "",
      transfer1: "",
      transfer2: "",
    });
  };

  // Handle delete transfer
  const handleDelete = async (transfer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the transfer "${transfer.name}"?`
    );

    if (confirmed) {
      try {
        setSubmitLoading(true);
        await deleteTransfer(transfer.id);

        // Reload transfers to get the updated data
        await loadTransfers();

        alert("Transfer deleted successfully!");
      } catch (error) {
        console.error("Error deleting transfer:", error);
        alert("Failed to delete transfer. Please try again.");
      } finally {
        setSubmitLoading(false);
      }
    }
  };

  // Function to export transfers to JSON
  const exportTransfersToJSON = () => {
    const exportData = transfers.map((transfer) => ({
      transferNumber: transfer.number,
      name: transfer.name,
      Transfer1: transfer.transfer1,
      Transfer2: transfer.transfer2,
    }));

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transfers.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Function to handle file import
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);

        if (!Array.isArray(jsonData)) {
          alert(
            "Invalid JSON format. Please upload a valid transfers JSON file."
          );
          return;
        }

        const confirmed = window.confirm(
          `Are you sure you want to import ${jsonData.length} transfers? This will replace all existing transfers.`
        );

        if (confirmed) {
          setSubmitLoading(true);
          await bulkImportTransfers(jsonData);
          await loadTransfers();
          alert("Transfers imported successfully!");
        }
      } catch (error) {
        console.error("Error importing transfers:", error);
        alert(
          "Failed to import transfers. Please check the JSON format and try again."
        );
      } finally {
        setSubmitLoading(false);
      }
    };
    reader.readAsText(file);

    // Clear the input so the same file can be imported again
    event.target.value = "";
  };

  // Filter transfers based on search term
  const filteredTransfers = useMemo(() => {
    if (!searchTerm.trim()) {
      return transfers;
    }
    return transfers.filter(
      (transfer) =>
        transfer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.number.toString().includes(searchTerm) ||
        transfer.transfer1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transfer.transfer2.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transfers, searchTerm]);

  // Sort filtered transfers based on sort order
  const sortedAndFilteredTransfers = useMemo(() => {
    if (sortOrder === "none") {
      return filteredTransfers;
    }

    const sorted = [...filteredTransfers].sort((a, b) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      if (sortOrder === "asc") {
        return nameA.localeCompare(nameB);
      } else if (sortOrder === "desc") {
        return nameB.localeCompare(nameA);
      }
      return 0;
    });

    return sorted;
  }, [filteredTransfers, sortOrder]);

  if (loading) {
    return (
      <div className="w-full bg-gray-50 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Bus Transfers
            </h2>
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading transfers...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen p-2 pb-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Bus Transfers
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                + Add New Transfer
              </button>
              <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer">
                📤 Import Transfers
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
              <button
                onClick={exportTransfersToJSON}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                📥 Export Transfers
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Transfers
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by transfer name or number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort by Name
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="none">No Sort</option>
                  <option value="asc">A-Z</option>
                  <option value="desc">Z-A</option>
                </select>
              </div>
              <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 whitespace-nowrap self-end">
                {searchTerm.trim() ? (
                  <>
                    Showing {sortedAndFilteredTransfers.length} of{" "}
                    {transfers.length} transfers
                  </>
                ) : (
                  <>Total Transfers: {transfers.length}</>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Transfers Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="sticky top-0 bg-gray-50 z-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                    S.N.
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                    Transfer Name
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                    Transfer-1
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                    Transfer-2
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedAndFilteredTransfers.map((transfer, index) => (
                  <tr
                    key={transfer.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                      {transfer.number}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {editingTransfer === transfer.id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Transfer name"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">
                          {transfer.name}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {editingTransfer === transfer.id ? (
                        <input
                          type="text"
                          value={editForm.transfer1}
                          onChange={(e) =>
                            handleInputChange("transfer1", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Transfer-1"
                        />
                      ) : (
                        <span className="text-gray-700">
                          {transfer.transfer1}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {editingTransfer === transfer.id ? (
                        <input
                          type="text"
                          value={editForm.transfer2}
                          onChange={(e) =>
                            handleInputChange("transfer2", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Transfer-2"
                        />
                      ) : (
                        <span className="text-gray-700">
                          {transfer.transfer2}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {editingTransfer === transfer.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSaveEdit}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(transfer)}
                            disabled={editingTransfer !== null}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              editingTransfer !== null
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-yellow-500 hover:bg-yellow-600 text-white"
                            }`}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(transfer)}
                            disabled={editingTransfer !== null}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              editingTransfer !== null
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-red-500 hover:bg-red-600 text-white"
                            }`}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sortedAndFilteredTransfers.length === 0 &&
              transfers.length > 0 && (
                <div className="text-center py-12 text-gray-500">
                  No transfers found matching "{searchTerm}".
                </div>
              )}

            {transfers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No transfer data found.
              </div>
            )}
          </div>
        </div>

        {/* Add Transfer Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-blue-600">
                    Add New Transfer
                  </h2>
                  <button
                    onClick={closeAddModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleAddTransfer}>
                  {/* Transfer Basic Info */}
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transfer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newTransfer.name}
                        onChange={(e) =>
                          setNewTransfer((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter transfer connection name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transfer-1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newTransfer.transfer1}
                        onChange={(e) =>
                          setNewTransfer((prev) => ({
                            ...prev,
                            transfer1: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter Transfer-1 stop name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Transfer-2 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newTransfer.transfer2}
                        onChange={(e) =>
                          setNewTransfer((prev) => ({
                            ...prev,
                            transfer2: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter Transfer-2 stop name"
                        required
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeAddModal}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      disabled={submitLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={submitLoading}
                    >
                      {submitLoading ? "Adding..." : "Add Transfer"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminTransfers;
