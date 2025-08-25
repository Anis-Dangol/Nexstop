import React, { useState, useEffect, useMemo } from "react";
import {
  fetchBusStops,
  deleteBusStop,
  deleteBusStopFromAllRoutes,
  updateBusStop,
} from "../../services/bus-route/busRoutes";
import { useToast } from "../../components/ui/use-toast";
import BusStopHeader from "../../components/admin-view/admin-bus-stop/BusStopHeader";
import BusStopFilters from "../../components/admin-view/admin-bus-stop/BusStopFilters";
import BusStopTable from "../../components/admin-view/admin-bus-stop/BusStopTable";
import BusStopPagination from "../../components/admin-view/admin-bus-stop/BusStopPagination";

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
        <BusStopHeader />

        <BusStopFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          filteredCount={sortedAndFilteredBusStops.length}
          totalCount={busStops.length}
        />

        <BusStopTable
          busStops={currentBusStops}
          searchTerm={searchTerm}
          editingStop={editingStop}
          editForm={editForm}
          onEdit={handleEdit}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
          onDelete={handleDeleteBusStop}
          onInputChange={handleInputChange}
          formatCoordinate={formatCoordinate}
        />

        <BusStopPagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={sortedAndFilteredBusStops.length}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

export default AdminBusStops;
