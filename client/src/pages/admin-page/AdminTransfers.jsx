import React, { useState, useEffect, useMemo } from "react";
import {
  fetchTransfers,
  createTransfer,
  updateTransfer,
  deleteTransfer,
  bulkImportTransfers,
} from "../../services/transfer/transfers";
import TransferHeader from "../../components/admin-view/admin-transfers/TransferHeader";
import TransferFilters from "../../components/admin-view/admin-transfers/TransferFilters";
import TransferTable from "../../components/admin-view/admin-transfers/TransferTable";
import TransferModal from "../../components/admin-view/admin-transfers/TransferModal";

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

  // Bulk selection states
  const [selectedTransfers, setSelectedTransfers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

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
      // Reset bulk selection when transfers are reloaded
      setSelectedTransfers([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error loading transfers:", error);
      alert("Failed to load transfers. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Bulk selection functions
  const handleSelectTransfer = (transferId) => {
    setSelectedTransfers((prev) => {
      if (prev.includes(transferId)) {
        // Remove from selection
        const newSelection = prev.filter((id) => id !== transferId);
        setSelectAll(
          newSelection.length === sortedAndFilteredTransfers.length &&
            sortedAndFilteredTransfers.length > 0
        );
        return newSelection;
      } else {
        // Add to selection
        const newSelection = [...prev, transferId];
        setSelectAll(newSelection.length === sortedAndFilteredTransfers.length);
        return newSelection;
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all
      setSelectedTransfers([]);
      setSelectAll(false);
    } else {
      // Select all visible transfers
      const allTransferIds = sortedAndFilteredTransfers.map(
        (transfer) => transfer.id
      );
      setSelectedTransfers(allTransferIds);
      setSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTransfers.length === 0) {
      alert("Please select transfers to delete.");
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${
      selectedTransfers.length
    } transfer${
      selectedTransfers.length > 1 ? "s" : ""
    }? This action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      try {
        setBulkDeleteLoading(true);

        // Delete transfers one by one
        const deletionPromises = selectedTransfers.map((transferId) =>
          deleteTransfer(transferId)
        );
        await Promise.all(deletionPromises);

        // Reload transfers and reset selection
        await loadTransfers();
        alert(
          `Successfully deleted ${selectedTransfers.length} transfer${
            selectedTransfers.length > 1 ? "s" : ""
          }!`
        );
      } catch (error) {
        console.error("Error deleting transfers:", error);
        alert("Failed to delete some transfers. Please try again.");
      } finally {
        setBulkDeleteLoading(false);
      }
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

  // Clean up selections when filtered transfers change
  useEffect(() => {
    const visibleTransferIds = sortedAndFilteredTransfers.map(
      (transfer) => transfer.id
    );
    setSelectedTransfers((prev) =>
      prev.filter((id) => visibleTransferIds.includes(id))
    );
    setSelectAll(false);
  }, [searchTerm, sortOrder]);

  // Keyboard shortcuts for bulk actions
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+A to select all
      if (e.ctrlKey && e.key === "a" && !showAddModal && !editingTransfer) {
        e.preventDefault();
        handleSelectAll();
      }
      // Delete key to delete selected transfers
      if (
        e.key === "Delete" &&
        selectedTransfers.length > 0 &&
        !showAddModal &&
        !editingTransfer
      ) {
        e.preventDefault();
        handleBulkDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTransfers, showAddModal, editingTransfer]);

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
        <TransferHeader
          setShowAddModal={setShowAddModal}
          handleFileImport={handleFileImport}
          exportTransfersToJSON={exportTransfersToJSON}
          selectedTransfers={selectedTransfers}
          handleBulkDelete={handleBulkDelete}
          bulkDeleteLoading={bulkDeleteLoading}
        />

        <TransferFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          sortedAndFilteredTransfers={sortedAndFilteredTransfers}
          transfers={transfers}
          selectedTransfers={selectedTransfers}
        />

        <TransferTable
          sortedAndFilteredTransfers={sortedAndFilteredTransfers}
          transfers={transfers}
          selectedTransfers={selectedTransfers}
          selectAll={selectAll}
          handleSelectAll={handleSelectAll}
          handleSelectTransfer={handleSelectTransfer}
          editingTransfer={editingTransfer}
          editForm={editForm}
          handleEdit={handleEdit}
          handleInputChange={handleInputChange}
          handleSaveEdit={handleSaveEdit}
          handleCancelEdit={handleCancelEdit}
          handleDelete={handleDelete}
          searchTerm={searchTerm}
        />

        <TransferModal
          showAddModal={showAddModal}
          closeAddModal={closeAddModal}
          handleAddTransfer={handleAddTransfer}
          newTransfer={newTransfer}
          setNewTransfer={setNewTransfer}
          submitLoading={submitLoading}
        />
      </div>
    </div>
  );
}

export default AdminTransfers;
