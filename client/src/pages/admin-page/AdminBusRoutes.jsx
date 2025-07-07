import React, { useState } from "react";

function AdminBusRoutes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("none");
  const [showAddModal, setShowAddModal] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [newRoute, setNewRoute] = useState({
    routeNumber: "",
    name: "",
    color: "#FF0000",
    stops: [{ name: "", lat: "", lon: "" }],
  });

  // Placeholder data - replace with actual data from your routes.json
  const busRoutes = [
    {
      id: 1,
      routeNumber: 1,
      name: "Kalanki to Lagankhel",
      color: "blue",
      totalStops: 14,
      status: "Active",
    },
    {
      id: 2,
      routeNumber: 2,
      name: "Koteshwor to Ratna Park",
      color: "red",
      totalStops: 18,
      status: "Active",
    },
    {
      id: 3,
      routeNumber: 3,
      name: "Kirtipur to New Baneshwor",
      color: "green",
      totalStops: 22,
      status: "Maintenance",
    },
    {
      id: 4,
      routeNumber: 4,
      name: "Thankot to Bhaktapur",
      color: "orange",
      totalStops: 16,
      status: "Active",
    },
  ];

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically save the route to your backend/routes.json
    console.log("New Route:", newRoute);
    setShowAddModal(false);
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
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
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
                    Status
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedRoutes.map((route, index) => (
                  <tr
                    key={route.id}
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
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          route.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {route.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <div className="flex space-x-2">
                        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors">
                          Edit
                        </button>
                        <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedRoutes.length === 0 && (
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
                                  type="number"
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
                                  type="number"
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
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Route
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

export default AdminBusRoutes;
