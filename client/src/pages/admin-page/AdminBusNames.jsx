import React, { useState, useEffect, useMemo } from "react";
import {
  fetchBusNames,
  createBusName,
  updateBusName,
  deleteBusName,
  importBusNames,
} from "../../services/busNames";
import { clearBusNamesCache } from "../../utils/mapUtils";

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
        <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Bus Names
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
              <button
                onClick={() => {
                  setShowAddModal(true);
                  setDraggedIndex(null);
                  setDragOverIndex(null);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + Add New Bus Name
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                📥 Import Bus Names
              </button>
              <button
                onClick={exportBusNamesToJSON}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                title="Export bus names to JSON file"
              >
                📤 Export Bus Names
              </button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Bus Names or Stops
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search bus names or stops..."
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
            <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 whitespace-nowrap">
              {searchTerm.trim() ? (
                <>
                  Showing {sortedAndFilteredBusNames.length} of{" "}
                  {busNames.length} bus names
                </>
              ) : (
                <>Total Bus Names: {busNames.length}</>
              )}
            </div>
          </div>
        </div>

        {/* Bus Names List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4">
            {sortedAndFilteredBusNames.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchTerm.trim()
                  ? `No bus names found matching "${searchTerm}".`
                  : "No bus names found. Add your first bus name to get started."}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedAndFilteredBusNames.map((busName) => (
                  <div
                    key={busName._id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {busName.busname}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {busName.stops.length} stops
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(busName)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(busName._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">
                      <strong>Stops:</strong>{" "}
                      <span className="italic">
                        {busName.stops.join(" → ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
            <div className="bg-white rounded-lg p-4 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-blue-600">
                  Add New Bus Name
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setDraggedIndex(null);
                    setDragOverIndex(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-2">
                    Bus Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter bus name"
                    value={newBusName.busname}
                    onChange={(e) =>
                      setNewBusName((prev) => ({
                        ...prev,
                        busname: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-lg font-medium text-gray-700">
                      Stops <span className="text-red-600">*</span>
                    </label>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {newBusName.stops.map((stop, index) => (
                      <div key={index}>
                        {/* Drop zone before each item */}
                        <div
                          className={`h-3 transition-all duration-200 flex items-center justify-center ${
                            draggedIndex !== null &&
                            draggedIndex !== index &&
                            dragOverIndex === index
                              ? "bg-green-300 rounded-full opacity-100"
                              : "opacity-0"
                          }`}
                          onDragOver={handleDragOver}
                          onDragEnter={(e) => handleDragEnter(e, index)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, index, "new")}
                        >
                          {draggedIndex !== null &&
                            draggedIndex !== index &&
                            dragOverIndex === index && (
                              <span className="text-xs text-green-700 font-medium">
                                Drop here
                              </span>
                            )}
                        </div>

                        <div
                          className={`drag-container flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                            draggedIndex === index
                              ? "bg-blue-100 opacity-60 transform scale-95 border-2 border-blue-400 shadow-lg"
                              : "bg-white border-2 border-transparent hover:bg-gray-50 shadow-sm"
                          }`}
                        >
                          {/* Stop Number */}
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full text-lg font-bold">
                            {index + 1}
                          </div>

                          {/* Add and Drag Controls */}
                          <div className="flex flex-col items-center gap-1">
                            <button
                              type="button"
                              onClick={() => addStopAfter(index, "new")}
                              className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-green-600 transition-colors"
                              title="Add new stop after this one"
                            >
                              +
                            </button>
                            <div
                              draggable="true"
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragEnd={handleDragEnd}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-grab active:cursor-grabbing transition-all duration-200 select-none ${
                                draggedIndex === index
                                  ? "bg-blue-500 text-white shadow-lg transform scale-110"
                                  : "bg-gray-300 text-gray-600 hover:bg-gray-400 hover:text-gray-700 hover:scale-105"
                              }`}
                              title="Drag to reorder stops"
                            >
                              <span className="text-sm font-bold">⋮⋮</span>
                            </div>
                          </div>

                          {/* Stop Input */}
                          <input
                            type="text"
                            placeholder={`Enter stop name`}
                            value={stop}
                            onChange={(e) =>
                              handleStopChange(index, e.target.value, "new")
                            }
                            className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />

                          {/* Remove Button */}
                          {newBusName.stops.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeStop(index, "new")}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-3 rounded text-sm font-medium transition-colors"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Drop zone after the last item */}
                        {index === newBusName.stops.length - 1 && (
                          <div
                            className={`h-3 transition-all duration-200 flex items-center justify-center ${
                              draggedIndex !== null &&
                              dragOverIndex === newBusName.stops.length
                                ? "bg-green-300 rounded-full opacity-100"
                                : "opacity-0"
                            }`}
                            onDragOver={handleDragOver}
                            onDragEnter={(e) =>
                              handleDragEnter(e, newBusName.stops.length)
                            }
                            onDragLeave={handleDragLeave}
                            onDrop={(e) =>
                              handleDrop(e, newBusName.stops.length, "new")
                            }
                          >
                            {draggedIndex !== null &&
                              dragOverIndex === newBusName.stops.length && (
                                <span className="text-xs text-green-700 font-medium">
                                  Drop here
                                </span>
                              )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setDraggedIndex(null);
                    setDragOverIndex(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={resetForm}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={handleAddNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Add Bus Name
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Edit Bus Name
                </h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-medium text-gray-700 mb-3">
                    Bus Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter bus name"
                    value={editForm.busname}
                    onChange={(e) =>
                      handleInputChange("busname", e.target.value)
                    }
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-lg font-medium text-gray-700">
                      Stops *
                    </label>
                    <button
                      type="button"
                      onClick={() => addStop("edit")}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-lg font-medium transition-colors"
                    >
                      + Add Stop
                    </button>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {editForm.stops.map((stop, index) => (
                      <div key={index}>
                        {/* Drop zone before each item */}
                        <div
                          className={`h-3 transition-all duration-200 flex items-center justify-center ${
                            draggedIndex !== null &&
                            draggedIndex !== index &&
                            dragOverIndex === index
                              ? "bg-green-300 rounded-full opacity-100"
                              : "opacity-0"
                          }`}
                          onDragOver={handleDragOver}
                          onDragEnter={(e) => handleDragEnter(e, index)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, index, "edit")}
                        >
                          {draggedIndex !== null &&
                            draggedIndex !== index &&
                            dragOverIndex === index && (
                              <span className="text-xs text-green-700 font-medium">
                                Drop here
                              </span>
                            )}
                        </div>

                        <div
                          className={`drag-container flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                            draggedIndex === index
                              ? "bg-blue-100 opacity-60 transform scale-95 border-2 border-blue-400 shadow-lg"
                              : "bg-white border-2 border-transparent hover:bg-gray-50 shadow-sm"
                          }`}
                        >
                          {/* Stop Number */}
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full text-lg font-bold">
                            {index + 1}
                          </div>

                          {/* Add and Drag Controls */}
                          <div className="flex flex-col items-center gap-1">
                            <button
                              type="button"
                              onClick={() => addStopAfter(index, "edit")}
                              className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-green-600 transition-colors"
                              title="Add new stop after this one"
                            >
                              +
                            </button>
                            <div
                              draggable="true"
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragEnd={handleDragEnd}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-grab active:cursor-grabbing transition-all duration-200 select-none ${
                                draggedIndex === index
                                  ? "bg-blue-500 text-white shadow-lg transform scale-110"
                                  : "bg-gray-300 text-gray-600 hover:bg-gray-400 hover:text-gray-700 hover:scale-105"
                              }`}
                              title="Drag to reorder stops"
                            >
                              <span className="text-sm font-bold">⋮⋮</span>
                            </div>
                          </div>

                          {/* Stop Input */}
                          <input
                            type="text"
                            placeholder={`Enter stop name`}
                            value={stop}
                            onChange={(e) =>
                              handleStopChange(index, e.target.value, "edit")
                            }
                            className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />

                          {/* Remove Button */}
                          {editForm.stops.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeStop(index, "edit")}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-3 rounded text-sm font-medium transition-colors"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Drop zone after the last item */}
                        {index === editForm.stops.length - 1 && (
                          <div
                            className={`h-3 transition-all duration-200 flex items-center justify-center ${
                              draggedIndex !== null &&
                              dragOverIndex === editForm.stops.length
                                ? "bg-green-300 rounded-full opacity-100"
                                : "opacity-0"
                            }`}
                            onDragOver={handleDragOver}
                            onDragEnter={(e) =>
                              handleDragEnter(e, editForm.stops.length)
                            }
                            onDragLeave={handleDragLeave}
                            onDrop={(e) =>
                              handleDrop(e, editForm.stops.length, "edit")
                            }
                          >
                            {draggedIndex !== null &&
                              dragOverIndex === editForm.stops.length && (
                                <span className="text-xs text-green-700 font-medium">
                                  Drop here
                                </span>
                              )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors text-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Import Bus Names
                </h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Import bus names from a JSON file. Ensure the file is in the
                  correct format with "busname" and "stops" fields.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select JSON File
                  </label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="replaceExisting"
                    checked={replaceExisting}
                    onChange={(e) => setReplaceExisting(e.target.checked)}
                    className="mr-2"
                  />
                  <label
                    htmlFor="replaceExisting"
                    className="text-sm text-gray-700"
                  >
                    Replace existing data (clear all current bus names)
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!selectedFile || importLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {importLoading ? "Importing..." : "Import"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBusNames;
