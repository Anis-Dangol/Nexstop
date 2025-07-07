import React, { useState, useEffect } from "react";
import {
  createBusRoute,
  fetchBusRoutes,
  updateBusRoute,
  deleteBusRoute,
  importBusRoutes,
} from "../../services/busRoutes";
import { useSelector } from "react-redux";

function AdminBusRoutes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("none");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [busRoutes, setBusRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [newRoute, setNewRoute] = useState({
    routeNumber: "",
    name: "",
    color: "#FF0000",
    stops: [{ name: "", lat: "", lon: "" }],
  });

  const { user } = useSelector((state) => state.auth);

  // Fetch bus routes on component mount
  useEffect(() => {
    loadBusRoutes();
  }, []);

  const loadBusRoutes = async () => {
    try {
      setLoading(true);
      const routes = await fetchBusRoutes();
      setBusRoutes(routes);
    } catch (error) {
      console.error("Failed to load bus routes:", error);
      // You might want to show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  // Filter routes based on search term
  const filteredRoutes = busRoutes.filter(
    (route) =>
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.routeNumber.toString().includes(searchTerm)
  );

  // Sort routes
  const sortedRoutes = [...filteredRoutes].sort((a, b) => {
    if (sortOrder === "asc") return a.name.localeCompare(b.name);
    if (sortOrder === "desc") return b.name.localeCompare(a.name);
    return 0;
  });

  // Helper functions for modal
  const addNewStop = (afterIndex = null) => {
    setNewRoute((prev) => {
      const newStops = [...prev.stops];
      const newStop = { name: "", lat: "", lon: "" };

      if (afterIndex !== null) {
        // Insert after the specified index
        newStops.splice(afterIndex + 1, 0, newStop);
      } else {
        // Add at the end (default behavior)
        newStops.push(newStop);
      }

      return {
        ...prev,
        stops: newStops,
      };
    });
  };

  const removeStop = (index) => {
    setNewRoute((prev) => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index),
    }));
  };

  const updateStop = (index, field, value) => {
    setNewRoute((prev) => ({
      ...prev,
      stops: prev.stops.map((stop, i) =>
        i === index ? { ...stop, [field]: value } : stop
      ),
    }));
  };

  // Drag and drop functions
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Create a custom drag image
    const dragElement = e.target.closest(".drag-container");
    e.dataTransfer.setDragImage(dragElement, 0, 0);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    // Only set drag over index if it's different from dragged index
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e) => {
    // Only clear drag over index if we're leaving the container entirely
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    setNewRoute((prev) => {
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

    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitLoading(true);

      // Prepare data for API
      const routeData = {
        routeNumber: parseInt(newRoute.routeNumber),
        name: newRoute.name,
        color: newRoute.color,
        stops: newRoute.stops.map((stop) => ({
          name: stop.name,
          lat: parseFloat(stop.lat),
          lon: parseFloat(stop.lon),
        })),
      };

      // Validate data
      if (
        !routeData.routeNumber ||
        !routeData.name ||
        routeData.stops.length === 0
      ) {
        alert("Please fill in all required fields");
        return;
      }

      // Check if any stop has invalid coordinates
      for (const stop of routeData.stops) {
        if (!stop.name || isNaN(stop.lat) || isNaN(stop.lon)) {
          alert("Please enter valid coordinates for all stops");
          return;
        }
      }

      const result = await createBusRoute(routeData);

      if (result.success) {
        // Success - reload routes and close modal
        await loadBusRoutes();
        setShowAddModal(false);
        setNewRoute({
          routeNumber: "",
          name: "",
          color: "#FF0000",
          stops: [{ name: "", lat: "", lon: "" }],
        });
        alert("Bus route created successfully!");
      }
    } catch (error) {
      console.error("Error creating route:", error);
      alert(error.message || "Failed to create bus route. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Edit route function
  const handleEditRoute = (route) => {
    setEditingRoute(route);
    setNewRoute({
      routeNumber: route.routeNumber,
      name: route.name,
      color: route.color,
      stops: route.stops.map((stop) => ({
        name: stop.name,
        lat: stop.lat.toString(),
        lon: stop.lon.toString(),
      })),
    });
    setShowEditModal(true);
  };

  // Update route function
  const handleUpdateRoute = async (e) => {
    e.preventDefault();

    try {
      setSubmitLoading(true);

      // Prepare data for API
      const routeData = {
        routeNumber: parseInt(newRoute.routeNumber),
        name: newRoute.name,
        color: newRoute.color,
        stops: newRoute.stops.map((stop) => ({
          name: stop.name,
          lat: parseFloat(stop.lat),
          lon: parseFloat(stop.lon),
        })),
      };

      // Validate data
      if (
        !routeData.routeNumber ||
        !routeData.name ||
        routeData.stops.length === 0
      ) {
        alert("Please fill in all required fields");
        return;
      }

      // Check if any stop has invalid coordinates
      for (const stop of routeData.stops) {
        if (!stop.name || isNaN(stop.lat) || isNaN(stop.lon)) {
          alert("Please enter valid coordinates for all stops");
          return;
        }
      }

      const result = await updateBusRoute(editingRoute._id, routeData);

      if (result.success) {
        // Success - reload routes and close modal
        await loadBusRoutes();
        setShowEditModal(false);
        setEditingRoute(null);
        setNewRoute({
          routeNumber: "",
          name: "",
          color: "#FF0000",
          stops: [{ name: "", lat: "", lon: "" }],
        });
        alert("Bus route updated successfully!");
      }
    } catch (error) {
      console.error("Error updating route:", error);
      alert(error.message || "Failed to update bus route. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Delete route function
  const handleDeleteRoute = async (route) => {
    if (
      window.confirm(
        `Are you sure you want to delete route ${route.routeNumber} - ${route.name}?`
      )
    ) {
      try {
        const result = await deleteBusRoute(route._id);

        if (result.success) {
          // Success - reload routes
          await loadBusRoutes();
          alert("Bus route deleted successfully!");
        }
      } catch (error) {
        console.error("Error deleting route:", error);
        alert(error.message || "Failed to delete bus route. Please try again.");
      }
    }
  };

  // Handle file selection for import
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      setSelectedFile(file);
    } else {
      alert("Please select a valid JSON file");
      event.target.value = ""; // Reset file input
    }
  };

  // Handle import routes
  const handleImportRoutes = async () => {
    if (!selectedFile) {
      alert("Please select a JSON file to import");
      return;
    }

    try {
      setImportLoading(true);

      // Read the file content
      const fileContent = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(selectedFile);
      });

      // Parse JSON
      let routesData;
      try {
        routesData = JSON.parse(fileContent);
      } catch (parseError) {
        alert("Invalid JSON file format");
        return;
      }

      // Validate that it's an array
      if (!Array.isArray(routesData)) {
        alert("JSON file must contain an array of routes");
        return;
      }

      // Import routes
      const result = await importBusRoutes(routesData, replaceExisting);

      if (result.success) {
        // Show success message with summary
        const summary = result.summary;
        alert(
          `Import completed successfully!\n\nSummary:\n- Total routes processed: ${
            summary.total
          }\n- New routes imported: ${
            summary.imported
          }\n- Existing routes updated: ${summary.updated}\n- Routes skipped: ${
            summary.skipped
          }\n- Errors: ${summary.errors}\n\n${
            result.errors ? "Check console for error details." : ""
          }`
        );

        if (result.errors && result.errors.length > 0) {
          console.error("Import errors:", result.errors);
        }

        // Reload routes and close modal
        await loadBusRoutes();
        setShowImportModal(false);
        setSelectedFile(null);
        setReplaceExisting(false);
      }
    } catch (error) {
      console.error("Error importing routes:", error);
      alert(error.message || "Failed to import routes. Please try again.");
    } finally {
      setImportLoading(false);
    }
  };

  // Close import modal
  const closeImportModal = () => {
    setShowImportModal(false);
    setSelectedFile(null);
    setReplaceExisting(false);
  };

  // Close edit modal
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingRoute(null);
    setNewRoute({
      routeNumber: "",
      name: "",
      color: "#FF0000",
      stops: [{ name: "", lat: "", lon: "" }],
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setNewRoute({
      routeNumber: "",
      name: "",
      color: "#FF0000",
      stops: [{ name: "", lat: "", lon: "" }],
    });
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Bus Routes
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + Add New Route
              </button>
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                📥 Import Routes
              </button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Routes
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by route name or number..."
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
            <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
              Showing {sortedRoutes.length} of {busRoutes.length} routes
            </div>
          </div>
        </div>

        {/* Routes Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading routes...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                      S.N.
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                      Route Name
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                      Color
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                      Total Stops
                    </th>
                    <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sortedRoutes.map((route, index) => (
                    <tr
                      key={route._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">
                        {route.routeNumber}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900">
                        {route.name}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded-full border-2 border-white shadow-sm`}
                            style={{ backgroundColor: route.color }}
                          ></div>
                          <span className="text-gray-700 capitalize">
                            {route.color}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {route.totalStops}
                      </td>
                      <td className="py-4 px-6 text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditRoute(route)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRoute(route)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && sortedRoutes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {searchTerm
                  ? `No routes found matching "${searchTerm}"`
                  : "No routes available"}
              </div>
            </div>
          )}
        </div>

        {/* Add Route Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-blue-600">
                    Add new Route
                  </h2>
                  <button
                    onClick={closeModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  {/* Route Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Route Number:
                      </label>
                      <input
                        type="number"
                        value={newRoute.routeNumber}
                        onChange={(e) =>
                          setNewRoute((prev) => ({
                            ...prev,
                            routeNumber: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Route Name:
                      </label>
                      <input
                        type="text"
                        value={newRoute.name}
                        onChange={(e) =>
                          setNewRoute((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ratnapark and Kirtipur"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Route Color:
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={newRoute.color}
                          onChange={(e) =>
                            setNewRoute((prev) => ({
                              ...prev,
                              color: e.target.value,
                            }))
                          }
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                          title="Select route color"
                        />
                        <input
                          type="text"
                          value={newRoute.color}
                          onChange={(e) =>
                            setNewRoute((prev) => ({
                              ...prev,
                              color: e.target.value,
                            }))
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                          placeholder="#FF0000"
                          pattern="^#[0-9A-Fa-f]{6}$"
                          title="Enter hex color code (e.g., #FF0000)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bus Stops Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-blue-600">
                        Bus Stops
                      </h3>
                      <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        💡 Drag the ⋮⋮ button to reorder stops
                      </div>
                    </div>
                    <div className="space-y-2">
                      {newRoute.stops.map((stop, index) => (
                        <React.Fragment key={index}>
                          {/* Drop zone indicator */}
                          {draggedIndex !== null && draggedIndex !== index && (
                            <div
                              className={`h-2 transition-all duration-200 ${
                                dragOverIndex === index
                                  ? "bg-green-300 rounded-full opacity-100"
                                  : "opacity-0"
                              }`}
                              onDragOver={(e) => {
                                e.preventDefault();
                                setDragOverIndex(index);
                              }}
                              onDrop={(e) => handleDrop(e, index)}
                            />
                          )}

                          <div
                            className={`drag-container flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${
                              draggedIndex === index
                                ? "bg-blue-100 opacity-60 transform scale-95 border-2 border-blue-400 shadow-lg"
                                : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                            }`}
                          >
                            {/* ...existing code... */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => addNewStop(index)}
                                className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg hover:bg-blue-600 transition-colors"
                                title="Add new bus stop after this one"
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
                                title="Drag to reorder bus stops"
                              >
                                <span className="text-xs font-bold">⋮⋮</span>{" "}
                              </div>
                            </div>
                            {/* ...existing code... */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Bus Stop Name (Stop #{index + 1})
                                </label>
                                <input
                                  type="text"
                                  value={stop.name}
                                  onChange={(e) =>
                                    updateStop(index, "name", e.target.value)
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder={
                                    index === 0
                                      ? "Ratnapark"
                                      : "Enter Busstop Name"
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Latitude
                                </label>
                                <input
                                  type="text"
                                  step="any"
                                  value={stop.lat}
                                  onChange={(e) =>
                                    updateStop(index, "lat", e.target.value)
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder={
                                    index === 0
                                      ? "27.7025617421252824"
                                      : "Enter Latitude"
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Longitude
                                </label>
                                <input
                                  type="text"
                                  step="any"
                                  value={stop.lon}
                                  onChange={(e) =>
                                    updateStop(index, "lon", e.target.value)
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder={
                                    index === 0
                                      ? "85.31361099960553"
                                      : "Enter Longitude"
                                  }
                                  required
                                />
                              </div>
                            </div>
                            {newRoute.stops.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeStop(index)}
                                className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-lg hover:bg-red-600"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </React.Fragment>
                      ))}

                      {/* Drop zone at the end */}
                      {draggedIndex !== null && (
                        <div
                          className={`h-3 transition-all duration-200 ${
                            dragOverIndex === newRoute.stops.length
                              ? "bg-green-300 rounded-full opacity-100"
                              : "opacity-0"
                          }`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragOverIndex(newRoute.stops.length);
                          }}
                          onDrop={(e) => handleDrop(e, newRoute.stops.length)}
                        />
                      )}
                      {/* 
                      // Stop at End Button 
                      <div className="flex justify-center mt-4">
                        <button
                          type="button"
                          onClick={() => addNewStop()}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <span className="text-lg">+</span>
                          Add Stop at End
                        </button>
                      </div> */}
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                      {submitLoading ? "Adding Route..." : "Add Route"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Route Modal */}
        {showEditModal && editingRoute && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-blue-600">
                    Edit Route
                  </h2>
                  <button
                    onClick={closeEditModal}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleUpdateRoute}>
                  {/* Route Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Route Number:
                      </label>
                      <input
                        type="number"
                        value={newRoute.routeNumber}
                        onChange={(e) =>
                          setNewRoute((prev) => ({
                            ...prev,
                            routeNumber: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Route Name:
                      </label>
                      <input
                        type="text"
                        value={newRoute.name}
                        onChange={(e) =>
                          setNewRoute((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ratnapark and Kirtipur"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Route Color:
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={newRoute.color}
                          onChange={(e) =>
                            setNewRoute((prev) => ({
                              ...prev,
                              color: e.target.value,
                            }))
                          }
                          className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                          title="Select route color"
                        />
                        <input
                          type="text"
                          value={newRoute.color}
                          onChange={(e) =>
                            setNewRoute((prev) => ({
                              ...prev,
                              color: e.target.value,
                            }))
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                          placeholder="#FF0000"
                          pattern="^#[0-9A-Fa-f]{6}$"
                          title="Enter hex color code (e.g., #FF0000)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bus Stops Section */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-blue-600">
                        Bus Stops
                      </h3>
                      <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        💡 Drag the ⋮⋮ button to reorder stops
                      </div>
                    </div>
                    <div className="space-y-2">
                      {newRoute.stops.map((stop, index) => (
                        <React.Fragment key={index}>
                          {/* Drop zone indicator */}
                          {draggedIndex !== null && draggedIndex !== index && (
                            <div
                              className={`h-2 transition-all duration-200 ${
                                dragOverIndex === index
                                  ? "bg-green-300 rounded-full opacity-100"
                                  : "opacity-0"
                              }`}
                              onDragOver={(e) => {
                                e.preventDefault();
                                setDragOverIndex(index);
                              }}
                              onDrop={(e) => handleDrop(e, index)}
                            />
                          )}

                          <div
                            className={`drag-container flex items-center gap-4 p-4 rounded-lg transition-all duration-200 ${
                              draggedIndex === index
                                ? "bg-blue-100 opacity-60 transform scale-95 border-2 border-blue-400 shadow-lg"
                                : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                            }`}
                          >
                            {/* ...existing code... */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => addNewStop(index)}
                                className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg hover:bg-blue-600 transition-colors"
                                title="Add new bus stop after this one"
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
                                title="Drag to reorder bus stops"
                              >
                                <span className="text-xs font-bold">⋮⋮</span>{" "}
                              </div>
                            </div>
                            {/* ...existing code... */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Bus Stop Name (Stop #{index + 1})
                                </label>
                                <input
                                  type="text"
                                  value={stop.name}
                                  onChange={(e) =>
                                    updateStop(index, "name", e.target.value)
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder={
                                    index === 0
                                      ? "Ratnapark"
                                      : "Enter Busstop Name"
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Latitude
                                </label>
                                <input
                                  type="text"
                                  step="any"
                                  value={stop.lat}
                                  onChange={(e) =>
                                    updateStop(index, "lat", e.target.value)
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder={
                                    index === 0
                                      ? "27.7025617421252824"
                                      : "Enter Latitude"
                                  }
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Longitude
                                </label>
                                <input
                                  type="text"
                                  step="any"
                                  value={stop.lon}
                                  onChange={(e) =>
                                    updateStop(index, "lon", e.target.value)
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder={
                                    index === 0
                                      ? "85.31361099960553"
                                      : "Enter Longitude"
                                  }
                                  required
                                />
                              </div>
                            </div>
                            {newRoute.stops.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeStop(index)}
                                className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-lg hover:bg-red-600"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        </React.Fragment>
                      ))}

                      {/* Drop zone at the end */}
                      {draggedIndex !== null && (
                        <div
                          className={`h-3 transition-all duration-200 ${
                            dragOverIndex === newRoute.stops.length
                              ? "bg-green-300 rounded-full opacity-100"
                              : "opacity-0"
                          }`}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragOverIndex(newRoute.stops.length);
                          }}
                          onDrop={(e) => handleDrop(e, newRoute.stops.length)}
                        />
                      )}
                      {/* 
                      // Stop at End Button 
                      <div className="flex justify-center mt-4">
                        <button
                          type="button"
                          onClick={() => addNewStop()}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <span className="text-lg">+</span>
                          Add Stop at End
                        </button>
                      </div> */}
                    </div>
                  </div>

                  {/* Modal Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                      {submitLoading ? "Updating Route..." : "Update Route"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Import Routes Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-blue-600">
                  Import Bus Routes
                </h2>
                <p className="text-sm text-gray-500">
                  Import bus routes from a JSON file. Ensure the file is in the
                  correct format.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select JSON File:
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={replaceExisting}
                    onChange={(e) => setReplaceExisting(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Replace existing routes with the same number
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeImportModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportRoutes}
                  disabled={importLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                  {importLoading ? "Importing..." : "Import Routes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBusRoutes;
