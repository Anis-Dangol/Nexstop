import React, { useState, useEffect, useMemo } from "react";
import {
  fetchBusNames,
  createBusName,
  updateBusName,
  deleteBusName,
  importBusNames,
} from "../../services/bus-name/busNames";
import { clearBusNamesCache } from "../../map/mapSlice";

// Import components
import BusNameHeader from "../../components/admin-view/admin-bus-name/BusNameHeader";
import BusNameFilters from "../../components/admin-view/admin-bus-name/BusNameFilters";
import BusNameList from "../../components/admin-view/admin-bus-name/BusNameList";
import AddBusNameModal from "../../components/admin-view/admin-bus-name/AddBusNameModal";
import EditBusNameModal from "../../components/admin-view/admin-bus-name/EditBusNameModal";
import ImportBusNameModal from "../../components/admin-view/admin-bus-name/ImportBusNameModal";

function AdminBusNames() {
  const [busNames, setBusNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("none");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingBusName, setEditingBusName] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [replaceExisting, setReplaceExisting] = useState(false);

  // Drag and drop states
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Bulk selection states
  const [selectedBusNames, setSelectedBusNames] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  const [newBusName, setNewBusName] = useState({
    busname: "",
    stops: [""],
  });

  const [editForm, setEditForm] = useState({
    busname: "",
    stops: [""],
  });

  useEffect(() => {
    loadBusNames();
  }, []);

  const loadBusNames = async () => {
    try {
      setLoading(true);
      const data = await fetchBusNames();
      setBusNames(data);
      // Reset bulk selection when bus names are reloaded
      setSelectedBusNames([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Failed to load bus names:", error);
      alert("Failed to load bus names. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (busName) => {
    setEditingBusName(busName);
    setEditForm({
      busname: busName.busname,
      stops: [...busName.stops],
    });
    setShowEditModal(true);
    // Reset drag states
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingBusName(null);
    setEditForm({
      busname: "",
      stops: [""],
    });
    // Reset drag states
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStopChange = (index, value, formType = "edit") => {
    if (formType === "new") {
      const newStops = [...newBusName.stops];
      newStops[index] = value;
      setNewBusName((prev) => ({
        ...prev,
        stops: newStops,
      }));
    } else {
      const newStops = [...editForm.stops];
      newStops[index] = value;
      setEditForm((prev) => ({
        ...prev,
        stops: newStops,
      }));
    }
  };

  const addStop = (formType = "edit") => {
    if (formType === "new") {
      setNewBusName((prev) => ({
        ...prev,
        stops: [...prev.stops, ""],
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        stops: [...prev.stops, ""],
      }));
    }
  };

  const addStopAfter = (index, formType = "edit") => {
    if (formType === "new") {
      setNewBusName((prev) => {
        const newStops = [...prev.stops];
        newStops.splice(index + 1, 0, "");
        return {
          ...prev,
          stops: newStops,
        };
      });
    } else {
      setEditForm((prev) => {
        const newStops = [...prev.stops];
        newStops.splice(index + 1, 0, "");
        return {
          ...prev,
          stops: newStops,
        };
      });
    }
  };

  const removeStop = (index, formType = "edit") => {
    if (formType === "new") {
      if (newBusName.stops.length > 1) {
        const newStops = newBusName.stops.filter((_, i) => i !== index);
        setNewBusName((prev) => ({
          ...prev,
          stops: newStops,
        }));
      }
    } else {
      if (editForm.stops.length > 1) {
        const newStops = editForm.stops.filter((_, i) => i !== index);
        setEditForm((prev) => ({
          ...prev,
          stops: newStops,
        }));
      }
    }
  };

  // Drag and drop functions
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());

    // Create a custom drag image
    const dragElement = e.target.closest(".drag-container");
    if (dragElement) {
      e.dataTransfer.setDragImage(dragElement, 0, 0);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    // Check if we're leaving the container entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, dropIndex, formType = "edit") => {
    e.preventDefault();
    setDragOverIndex(null);

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    if (formType === "new") {
      setNewBusName((prev) => {
        const newStops = [...prev.stops];
        const draggedItem = newStops[draggedIndex];

        // Remove the dragged item from its current position
        newStops.splice(draggedIndex, 1);

        // Calculate the correct drop position
        let finalDropIndex;
        if (dropIndex >= newStops.length) {
          // Dropping at the end
          finalDropIndex = newStops.length;
        } else if (dropIndex > draggedIndex) {
          // Dropping after the original position (index already adjusted by removal)
          finalDropIndex = dropIndex - 1;
        } else {
          // Dropping before the original position
          finalDropIndex = dropIndex;
        }

        // Insert at new position
        newStops.splice(finalDropIndex, 0, draggedItem);

        return {
          ...prev,
          stops: newStops,
        };
      });
    } else {
      setEditForm((prev) => {
        const newStops = [...prev.stops];
        const draggedItem = newStops[draggedIndex];

        // Remove the dragged item from its current position
        newStops.splice(draggedIndex, 1);

        // Calculate the correct drop position
        let finalDropIndex;
        if (dropIndex >= newStops.length) {
          // Dropping at the end
          finalDropIndex = newStops.length;
        } else if (dropIndex > draggedIndex) {
          // Dropping after the original position (index already adjusted by removal)
          finalDropIndex = dropIndex - 1;
        } else {
          // Dropping before the original position
          finalDropIndex = dropIndex;
        }

        // Insert at new position
        newStops.splice(finalDropIndex, 0, draggedItem);

        return {
          ...prev,
          stops: newStops,
        };
      });
    }

    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSaveEdit = async () => {
    if (
      !editForm.busname.trim() ||
      editForm.stops.filter((stop) => stop.trim()).length === 0
    ) {
      alert("Bus name and at least one stop are required.");
      return;
    }

    try {
      const busNameData = {
        busname: editForm.busname.trim(),
        stops: editForm.stops.filter((stop) => stop.trim()),
      };

      await updateBusName(editingBusName._id, busNameData);
      clearBusNamesCache(); // Clear cache after update
      await loadBusNames();
      handleCancelEdit();
      alert("Bus name updated successfully!");
    } catch (error) {
      console.error("Error updating bus name:", error);
      alert(error.message || "Failed to update bus name. Please try again.");
    }
  };

  const handleAddNew = async () => {
    if (
      !newBusName.busname.trim() ||
      newBusName.stops.filter((stop) => stop.trim()).length === 0
    ) {
      alert("Bus name and at least one stop are required.");
      return;
    }

    try {
      const busNameData = {
        busname: newBusName.busname.trim(),
        stops: newBusName.stops.filter((stop) => stop.trim()),
      };

      await createBusName(busNameData);
      clearBusNamesCache(); // Clear cache after create
      await loadBusNames();
      setNewBusName({
        busname: "",
        stops: [""],
      });
      setShowAddModal(false);
      // Reset drag states
      setDraggedIndex(null);
      setDragOverIndex(null);
      alert("Bus name added successfully!");
    } catch (error) {
      console.error("Error adding bus name:", error);
      alert(error.message || "Failed to add bus name. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this bus name? This action cannot be undone."
      )
    ) {
      try {
        await deleteBusName(id);
        clearBusNamesCache(); // Clear cache after delete
        await loadBusNames();
        alert("Bus name deleted successfully!");
      } catch (error) {
        console.error("Error deleting bus name:", error);
        alert("Failed to delete bus name. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setNewBusName({
      busname: "",
      stops: [""],
    });
    // Reset drag states
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Function to export bus names to JSON
  const exportBusNamesToJSON = () => {
    const exportData = busNames.map((busName) => ({
      busname: busName.busname,
      stops: busName.stops,
    }));

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bus_names_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle file import
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      setSelectedFile(file);
    } else {
      alert("Please select a valid JSON file.");
      event.target.value = "";
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    try {
      setImportLoading(true);
      const fileContent = await selectedFile.text();
      const jsonData = JSON.parse(fileContent);

      if (!Array.isArray(jsonData)) {
        throw new Error("Invalid JSON format. Expected an array of bus names.");
      }

      const result = await importBusNames(jsonData, replaceExisting);
      clearBusNamesCache(); // Clear cache after import
      await loadBusNames();

      setShowImportModal(false);
      setSelectedFile(null);
      setReplaceExisting(false);
      alert(result.message || "Bus names imported successfully!");
    } catch (error) {
      console.error("Error importing bus names:", error);
      alert(error.message || "Failed to import bus names. Please try again.");
    } finally {
      setImportLoading(false);
    }
  };

  // Bulk selection functions
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedBusNames([]);
      setSelectAll(false);
    } else {
      const allVisibleIds = sortedAndFilteredBusNames.map(
        (busName) => busName._id
      );
      setSelectedBusNames(allVisibleIds);
      setSelectAll(true);
    }
  };

  const handleSelectBusName = (busNameId) => {
    setSelectedBusNames((prev) => {
      if (prev.includes(busNameId)) {
        const newSelection = prev.filter((id) => id !== busNameId);
        setSelectAll(false);
        return newSelection;
      } else {
        const newSelection = [...prev, busNameId];
        // Check if all visible bus names are now selected
        const allVisibleIds = sortedAndFilteredBusNames.map(
          (busName) => busName._id
        );
        if (
          newSelection.length === allVisibleIds.length &&
          allVisibleIds.every((id) => newSelection.includes(id))
        ) {
          setSelectAll(true);
        }
        return newSelection;
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedBusNames.length === 0) return;

    const confirmMessage = `Are you sure you want to delete ${
      selectedBusNames.length
    } bus name${
      selectedBusNames.length > 1 ? "s" : ""
    }? This action cannot be undone.`;

    if (!window.confirm(confirmMessage)) return;

    try {
      setBulkDeleteLoading(true);

      // Delete all selected bus names
      await Promise.all(selectedBusNames.map((id) => deleteBusName(id)));

      clearBusNamesCache(); // Clear cache after bulk delete
      await loadBusNames();

      alert(
        `Successfully deleted ${selectedBusNames.length} bus name${
          selectedBusNames.length > 1 ? "s" : ""
        }!`
      );
    } catch (error) {
      console.error("Error deleting bus names:", error);
      alert("Failed to delete some bus names. Please try again.");
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  // Filter and sort bus names
  const filteredBusNames = useMemo(() => {
    if (!searchTerm.trim()) {
      return busNames;
    }
    return busNames.filter(
      (busName) =>
        busName.busname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        busName.stops.some((stop) =>
          stop.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
  }, [busNames, searchTerm]);

  const sortedAndFilteredBusNames = useMemo(() => {
    if (sortOrder === "none") {
      return filteredBusNames;
    }

    const sorted = [...filteredBusNames].sort((a, b) => {
      const nameA = a.busname.toLowerCase();
      const nameB = b.busname.toLowerCase();

      if (sortOrder === "asc") {
        return nameA.localeCompare(nameB);
      } else if (sortOrder === "desc") {
        return nameB.localeCompare(nameA);
      }
      return 0;
    });

    return sorted;
  }, [filteredBusNames, sortOrder]);

  // Clean up selections when filtered bus names change
  useEffect(() => {
    const visibleBusNameIds = sortedAndFilteredBusNames.map(
      (busName) => busName._id
    );
    setSelectedBusNames((prev) =>
      prev.filter((id) => visibleBusNameIds.includes(id))
    );
    setSelectAll(false);
  }, [searchTerm, sortOrder]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Delete key for bulk delete
      if (
        e.key === "Delete" &&
        selectedBusNames.length > 0 &&
        !showAddModal &&
        !showEditModal
      ) {
        e.preventDefault();
        handleBulkDelete();
      }

      // Ctrl+A for select all
      if (e.ctrlKey && e.key === "a" && !showAddModal && !showEditModal) {
        e.preventDefault();
        handleSelectAll();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedBusNames, showAddModal, showEditModal]);

  if (loading) {
    return (
      <div className="w-full bg-gray-50 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Bus Names</h2>
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading bus names...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <BusNameHeader
          onAddNew={() => {
            setShowAddModal(true);
            setDraggedIndex(null);
            setDragOverIndex(null);
          }}
          onImport={() => setShowImportModal(true)}
          onExport={exportBusNamesToJSON}
          onBulkDelete={handleBulkDelete}
          selectedCount={selectedBusNames.length}
          bulkDeleteLoading={bulkDeleteLoading}
        />

        {/* Filter Section */}
        <BusNameFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          totalCount={busNames.length}
          filteredCount={sortedAndFilteredBusNames.length}
          selectedCount={selectedBusNames.length}
          onSelectAll={handleSelectAll}
          selectAll={selectAll}
          hasFiltered={searchTerm.trim() !== ""}
        />

        {/* Bus Names List */}
        <BusNameList
          busNames={sortedAndFilteredBusNames}
          selectedBusNames={selectedBusNames}
          onSelectBusName={handleSelectBusName}
          onSelectAll={handleSelectAll}
          selectAll={selectAll}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchTerm={searchTerm}
        />

        {/* Modals */}
        <AddBusNameModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
            setDraggedIndex(null);
            setDragOverIndex(null);
          }}
          busName={newBusName.busname}
          onBusNameChange={(value) =>
            setNewBusName((prev) => ({ ...prev, busname: value }))
          }
          onAddNew={handleAddNew}
          onReset={resetForm}
          stops={newBusName.stops}
          onStopChange={handleStopChange}
          onAddStopAfter={addStopAfter}
          onRemoveStop={removeStop}
          draggedIndex={draggedIndex}
          dragOverIndex={dragOverIndex}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />

        <EditBusNameModal
          isOpen={showEditModal}
          onClose={handleCancelEdit}
          busName={editForm.busname}
          onBusNameChange={(value) => handleInputChange("busname", value)}
          onSave={handleSaveEdit}
          onAddStop={() => addStop("edit")}
          stops={editForm.stops}
          onStopChange={handleStopChange}
          onAddStopAfter={addStopAfter}
          onRemoveStop={removeStop}
          draggedIndex={draggedIndex}
          dragOverIndex={dragOverIndex}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />

        <ImportBusNameModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImport}
          onFileUpload={handleFileUpload}
          selectedFile={selectedFile}
          replaceExisting={replaceExisting}
          onReplaceExistingChange={setReplaceExisting}
          importLoading={importLoading}
        />
      </div>
    </div>
  );
}

export default AdminBusNames;
