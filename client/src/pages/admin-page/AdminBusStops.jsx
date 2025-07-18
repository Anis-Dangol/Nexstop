import React, { useState, useEffect, useMemo } from "react";
import {
  fetchBusStops,
  deleteBusStop,
  deleteBusStopFromAllRoutes,
  updateBusStop,
} from "../../services/busRoutes";
import { useToast } from "../../components/ui/use-toast";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { toast } = useToast();

  useEffect(() => {
    // Load bus stops from MongoDB via API
    const loadBusStops = async () => {
      try {
        setLoading(true);
        const stops = await fetchBusStops();
        // Use the actual MongoDB _id from the API response
        const transformedStops = stops.map((stop) => ({
          id: stop.id, // Use the actual MongoDB _id
          name: stop.name,
          latitude: stop.lat,
          longitude: stop.lon,
          routeId: stop.routeId,
          routeName: stop.routeName,
          routeNumber: stop.routeNumber,
        }));
        setBusStops(transformedStops);
      } catch (error) {
        console.error("Failed to load bus stops:", error);
        setBusStops([]);
      } finally {
        setLoading(false);
      }
    };

    loadBusStops();
  }, []);

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
  const handleSaveEdit = async () => {
    const originalStop = busStops.find((stop) => stop.id === editingStop);
    if (!originalStop) return;

    // Validate coordinates
    const newLat = parseFloat(editForm.latitude);
    const newLon = parseFloat(editForm.longitude);

    if (isNaN(newLat) || isNaN(newLon)) {
      toast({
        title: "Invalid input",
        description: "Please enter valid latitude and longitude values.",
        variant: "destructive",
      });
      return;
    }

    if (newLat < -90 || newLat > 90) {
      toast({
        title: "Invalid latitude",
        description: "Latitude must be between -90 and 90 degrees.",
        variant: "destructive",
      });
      return;
    }

    if (newLon < -180 || newLon > 180) {
      toast({
        title: "Invalid longitude",
        description: "Longitude must be between -180 and 180 degrees.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateBusStop(editingStop, {
        name: editForm.name,
        lat: newLat,
        lon: newLon,
      });

      // Update the local state
      setBusStops((prevStops) =>
        prevStops.map((stop) =>
          stop.id === editingStop
            ? {
                ...stop,
                name: editForm.name,
                latitude: newLat,
                longitude: newLon,
              }
            : stop
        )
      );

      toast({
        title: "Success",
        description: `Bus stop "${editForm.name}" updated successfully!`,
      });

      handleCancelEdit();
    } catch (error) {
      console.error("Error updating bus stop:", error);
      toast({
        title: "Error",
        description: "Failed to update bus stop. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle delete bus stop
  const handleDeleteBusStop = async (stopId) => {
    const stopToDelete = busStops.find((stop) => stop.id === stopId);
    if (!stopToDelete) return;

    if (
      window.confirm(
        `Are you sure you want to delete "${stopToDelete.name}"?\n\nThis will remove the bus stop from ALL routes that contain it. This action cannot be undone.`
      )
    ) {
      try {
        // Use the comprehensive delete function that removes the stop from all routes
        await deleteBusStopFromAllRoutes({
          name: stopToDelete.name,
          lat: stopToDelete.latitude,
          lon: stopToDelete.longitude,
        });

        // Remove from local state
        setBusStops((prevStops) =>
          prevStops.filter((stop) => stop.id !== stopId)
        );

        toast({
          title: "Success",
          description: `Bus stop "${stopToDelete.name}" deleted from all routes successfully!`,
        });
      } catch (error) {
        console.error("Error deleting bus stop:", error);
        toast({
          title: "Error",
          description: "Failed to delete bus stop. Please try again.",
          variant: "destructive",
        });
      }
    }
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBusStops = sortedAndFilteredBusStops.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(sortedAndFilteredBusStops.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-1 mx-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Previous
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 mx-1 rounded ${
            i === currentPage
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-1 mx-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Next
        </button>
      );
    }

    return pages;
  };

  // Reset page to 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder]);

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
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Bus Stops
              </h1>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex-1">
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
                {currentBusStops.map((stop, index) => (
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
                        <div className="flex space-x-2">
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
                          <button
                            onClick={() => handleDeleteBusStop(stop.id)}
                            disabled={editingStop !== null}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              editingStop !== null
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

        {/* Pagination Controls */}
        {sortedAndFilteredBusStops.length > itemsPerPage && (
          <div className="flex justify-between items-center mt-6 px-6 py-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-700">
              Showing{" "}
              {Math.min(
                (currentPage - 1) * itemsPerPage + 1,
                sortedAndFilteredBusStops.length
              )}{" "}
              to{" "}
              {Math.min(
                currentPage * itemsPerPage,
                sortedAndFilteredBusStops.length
              )}{" "}
              of {sortedAndFilteredBusStops.length} results
            </div>
            <div className="flex space-x-1">{renderPagination()}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBusStops;
