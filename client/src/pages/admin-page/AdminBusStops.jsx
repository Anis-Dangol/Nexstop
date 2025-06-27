import React, { useState, useEffect, useMemo } from "react";
import routesData from "../../assets/routes.json";

function AdminBusStops() {
  const [busStops, setBusStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("none"); // "none", "asc", "desc"
  const [editingStop, setEditingStop] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    latitude: "",
    longitude: "",
  });
  const [updatedRoutesData, setUpdatedRoutesData] = useState(routesData);

  useEffect(() => {
    // Extract all unique bus stops from routes data
    const extractBusStops = () => {
      const allStops = [];
      const uniqueStops = new Map(); // Use Map to avoid duplicates based on name and coordinates

      updatedRoutesData.forEach((route) => {
        route.stops.forEach((stop) => {
          const stopKey = `${stop.name}-${stop.lat}-${stop.lon}`; // Create unique key
          if (!uniqueStops.has(stopKey)) {
            uniqueStops.set(stopKey, {
              id: uniqueStops.size + 1, // Generate sequential ID
              name: stop.name,
              latitude: stop.lat,
              longitude: stop.lon,
            });
          }
        });
      });

      return Array.from(uniqueStops.values());
    };

    try {
      const stops = extractBusStops();
      setBusStops(stops);
    } catch (error) {
      console.error("Error loading bus stops:", error);
    } finally {
      setLoading(false);
    }
  }, [updatedRoutesData]);

  // Format coordinates to show limited decimal places
  const formatCoordinate = (coord) => {
    return typeof coord === "number" ? coord.toFixed(6) : coord;
  };

  // Handle edit button click
  const handleEdit = (stop) => {
    setEditingStop(stop.id);
    setEditForm({
      name: stop.name,
      latitude: stop.latitude.toString(),
      longitude: stop.longitude.toString(),
    });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingStop(null);
    setEditForm({
      name: "",
      latitude: "",
      longitude: "",
    });
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save changes to bus stop
  const handleSaveEdit = () => {
    const originalStop = busStops.find((stop) => stop.id === editingStop);
    if (!originalStop) return;

    // Validate coordinates
    const newLat = parseFloat(editForm.latitude);
    const newLon = parseFloat(editForm.longitude);

    if (isNaN(newLat) || isNaN(newLon)) {
      alert("Please enter valid latitude and longitude values.");
      return;
    }

    if (newLat < -90 || newLat > 90) {
      alert("Latitude must be between -90 and 90 degrees.");
      return;
    }

    if (newLon < -180 || newLon > 180) {
      alert("Longitude must be between -180 and 180 degrees.");
      return;
    }

    // Update all bus stops with the same original name in routes data
    const newUpdatedRoutesData = updatedRoutesData.map((route) => ({
      ...route,
      stops: route.stops.map((stop) => {
        if (stop.name === originalStop.name) {
          return {
            ...stop,
            name: editForm.name.trim(),
            lat: newLat,
            lon: newLon,
          };
        }
        return stop;
      }),
    }));

    // Update the routes data state
    setUpdatedRoutesData(newUpdatedRoutesData);

    // Show success message with download option
    const confirmed = window.confirm(
      `Successfully updated all bus stops with name "${originalStop.name}" across all routes!\n\nWould you like to download the updated routes.json file?`
    );

    if (confirmed) {
      downloadUpdatedJSON(newUpdatedRoutesData);
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
    a.download = "routes_updated.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter bus stops based on search term
  const filteredBusStops = useMemo(() => {
    if (!searchTerm.trim()) {
      return busStops;
    }
    return busStops.filter((stop) =>
      stop.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [busStops, searchTerm]);

  // Sort filtered bus stops based on sort order
  const sortedAndFilteredBusStops = useMemo(() => {
    if (sortOrder === "none") {
      return filteredBusStops;
    }

    const sorted = [...filteredBusStops].sort((a, b) => {
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
  }, [filteredBusStops, sortOrder]);

  if (loading) {
    return (
      <div className="w-full bg-gray-50 min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Bus Stops</h2>
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading bus stops...</div>
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
                Bus Stops
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
              <button
                onClick={() => downloadUpdatedJSON(updatedRoutesData)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                title="Download updated routes.json file"
              >
                📥 Download JSON
              </button>
              <button
                onClick={() => {
                  setUpdatedRoutesData(routesData);
                  alert("Routes data has been reset to original values.");
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                title="Reset to original routes data"
              >
                🔄 Reset Data
              </button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Bus Stops
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search bus stops..."
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
                  Showing {sortedAndFilteredBusStops.length} of{" "}
                  {busStops.length} stops
                </>
              ) : (
                <>Total Stops: {busStops.length}</>
              )}
            </div>
          </div>
        </div>

        {/* Edit Warning Message */}
        {editingStop && (
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
                  Bulk Update Warning
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>
                    Editing this bus stop will update{" "}
                    <strong>all bus stops</strong> with the same name across all
                    routes. This ensures consistency across the entire
                    transportation network.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bus Stops Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="sticky top-0 bg-gray-50 z-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                    ID
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                    Bus Stop Name
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                    Latitude
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                    Longitude
                  </th>
                  <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedAndFilteredBusStops.map((stop, index) => (
                  <tr
                    key={stop.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                      {stop.id}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {editingStop === stop.id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Bus stop name"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">
                          {stop.name}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700 font-mono">
                      {editingStop === stop.id ? (
                        <input
                          type="number"
                          step="0.000001"
                          value={editForm.latitude}
                          onChange={(e) =>
                            handleInputChange("latitude", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                          placeholder="Latitude"
                        />
                      ) : (
                        formatCoordinate(stop.latitude)
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700 font-mono">
                      {editingStop === stop.id ? (
                        <input
                          type="number"
                          step="0.000001"
                          value={editForm.longitude}
                          onChange={(e) =>
                            handleInputChange("longitude", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                          placeholder="Longitude"
                        />
                      ) : (
                        formatCoordinate(stop.longitude)
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {editingStop === stop.id ? (
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
                        <button
                          onClick={() => handleEdit(stop)}
                          disabled={editingStop !== null}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            editingStop !== null
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-yellow-500 hover:bg-yellow-600 text-white"
                          }`}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sortedAndFilteredBusStops.length === 0 && busStops.length > 0 && (
              <div className="text-center py-12 text-gray-500">
                No bus stops found matching "{searchTerm}".
              </div>
            )}

            {busStops.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No bus stops found in the routes data.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminBusStops;
