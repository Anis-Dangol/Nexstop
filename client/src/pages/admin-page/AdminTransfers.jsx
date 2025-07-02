import React, { useState, useEffect, useMemo } from "react";
import transferData from "../../assets/transfer.json";

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
  const [updatedTransfersData, setUpdatedTransfersData] =
    useState(transferData);

  useEffect(() => {
    // Load transfer data
    const loadTransfers = () => {
      try {
        const formattedTransfers = updatedTransfersData.map((transfer) => ({
          id: transfer.transferNumber,
          number: transfer.transferNumber,
          name: transfer.name,
          transfer1: transfer.Transfer1,
          transfer2: transfer.Transfer2,
          status: "Active", // Default status
        }));
        setTransfers(formattedTransfers);
      } catch (error) {
        console.error("Error loading transfers:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTransfers();
  }, [updatedTransfersData]);

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
  const handleSaveEdit = () => {
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

    // Update the transfers data
    const newUpdatedTransfersData = updatedTransfersData.map((transfer) => {
      if (transfer.transferNumber === editingTransfer) {
        return {
          ...transfer,
          name: editForm.name.trim(),
          Transfer1: editForm.transfer1.trim(),
          Transfer2: editForm.transfer2.trim(),
        };
      }
      return transfer;
    });

    // Update the state
    setUpdatedTransfersData(newUpdatedTransfersData);

    // Show success message
    const confirmed = window.confirm(
      `Successfully updated transfer "${originalTransfer.name}"!\n\nWould you like to download the updated transfers.json file?`
    );

    if (confirmed) {
      downloadUpdatedJSON(newUpdatedTransfersData);
    }

    handleCancelEdit();
  };

  // Function to download updated JSON file
  const downloadUpdatedJSON = (data) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transfers_updated.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle delete transfer
  const handleDelete = (transfer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the transfer "${transfer.name}"?`
    );

    if (confirmed) {
      const newUpdatedTransfersData = updatedTransfersData.filter(
        (t) => t.transferNumber !== transfer.id
      );
      setUpdatedTransfersData(newUpdatedTransfersData);
      alert("Transfer deleted successfully!");
    }
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
                onClick={() =>
                  alert("Add new transfer functionality coming soon!")
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                + Add New Transfer
              </button>
              <button
                onClick={() => downloadUpdatedJSON(updatedTransfersData)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                📥 Import Transfers
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

        {/* Edit Warning Message */}
        {editingTransfer && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Edit Transfer
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>
                    You are editing transfer connection details. Make sure both
                    transfer points are accurate.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

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
                    From Stop
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                    To Stop
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                    Status
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
                          placeholder="From stop"
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
                          placeholder="To stop"
                        />
                      ) : (
                        <span className="text-gray-700">
                          {transfer.transfer2}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {transfer.status}
                      </span>
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
      </div>
    </div>
  );
}

export default AdminTransfers;
