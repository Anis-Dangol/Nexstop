import React, { useState, useEffect } from "react";
import {
  createBusRoute,
  fetchBusRoutes,
  updateBusRoute,
  deleteBusRoute,
  importBusRoutes,
  bulkUpdateRouteNumbers,
  reorderRoutes,
} from "../../services/bus-route/busRoutes";
import { useSelector } from "react-redux";
import RouteHeader from "../../components/admin-view/admin-bus-route/RouteHeader";
import RouteFilters from "../../components/admin-view/admin-bus-route/RouteFilters";
import RouteList from "../../components/admin-view/admin-bus-route/RouteList";
import AddRouteModal from "../../components/admin-view/admin-bus-route/AddRouteModal";
import EditRouteModal from "../../components/admin-view/admin-bus-route/EditRouteModal";
import ImportRouteModal from "../../components/admin-view/admin-bus-route/ImportRouteModal";

function AdminBusRoutes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("none");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [dragUpdateLoading, setDragUpdateLoading] = useState(false);
  const [busRoutes, setBusRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [newRoute, setNewRoute] = useState({
    routeNumber: "",
    name: "",
    stops: [{ name: "", lat: "", lon: "" }],
  });

  const [editRoute, setEditRoute] = useState({
    routeNumber: "",
    name: "",
    stops: [{ name: "", lat: "", lon: "" }],
  });

  // Bulk selection states
  const [selectedRoutes, setSelectedRoutes] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const { user } = useSelector((state) => state.auth);

  // Toast notification function
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch bus routes on component mount
  useEffect(() => {
    loadBusRoutes();
  }, []);

  const loadBusRoutes = async () => {
    try {
      setLoading(true);
      const routes = await fetchBusRoutes();
      setBusRoutes(routes);
      // Reset bulk selection when routes are reloaded
      setSelectedRoutes([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Failed to load bus routes:", error);
      // You might want to show a toast notification here
    } finally {
      setLoading(false);
    }
  };

  // Function to export routes to JSON
  const exportRoutesToJSON = () => {
    const exportData = busRoutes.map((route) => ({
      routeNumber: route.routeNumber,
      name: route.name,
      stops: route.stops.map((stop) => ({
        name: stop.name,
        lat: stop.lat,
        lon: stop.lon,
      })),
    }));

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bus_routes_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  // Clean up selections when filtered routes change
  useEffect(() => {
    const visibleRouteIds = sortedRoutes.map((route) => route._id);
    setSelectedRoutes((prev) =>
      prev.filter((id) => visibleRouteIds.includes(id))
    );
    setSelectAll(false);
  }, [searchTerm, sortOrder]);

  // Keyboard shortcuts for bulk actions
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+A to select all
      if (
        e.ctrlKey &&
        e.key === "a" &&
        !showAddModal &&
        !showEditModal &&
        !showImportModal
      ) {
        e.preventDefault();
        handleSelectAll();
      }
      // Delete key to delete selected routes
      if (
        e.key === "Delete" &&
        selectedRoutes.length > 0 &&
        !showAddModal &&
        !showEditModal &&
        !showImportModal
      ) {
        e.preventDefault();
        handleBulkDelete();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedRoutes, showAddModal, showEditModal, showImportModal]);

  // Helper functions for modal
  const addNewStop = (afterIndex = null, formType = "new") => {
    if (formType === "edit") {
      setEditRoute((prev) => {
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
    } else {
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
    }
  };

  const addStopAfter = (index, formType = "new") => {
    if (formType === "edit") {
      setEditRoute((prev) => {
        const newStops = [...prev.stops];
        newStops.splice(index + 1, 0, { name: "", lat: "", lon: "" });
        return {
          ...prev,
          stops: newStops,
        };
      });
    } else {
      setNewRoute((prev) => {
        const newStops = [...prev.stops];
        newStops.splice(index + 1, 0, { name: "", lat: "", lon: "" });
        return {
          ...prev,
          stops: newStops,
        };
      });
    }
  };

  const removeStop = (index, formType = "new") => {
    if (formType === "edit") {
      setEditRoute((prev) => ({
        ...prev,
        stops: prev.stops.filter((_, i) => i !== index),
      }));
    } else {
      setNewRoute((prev) => ({
        ...prev,
        stops: prev.stops.filter((_, i) => i !== index),
      }));
    }
  };

  const updateStop = (index, field, value, formType = "new") => {
    if (formType === "edit") {
      setEditRoute((prev) => ({
        ...prev,
        stops: prev.stops.map((stop, i) =>
          i === index ? { ...stop, [field]: value } : stop
        ),
      }));
    } else {
      setNewRoute((prev) => ({
        ...prev,
        stops: prev.stops.map((stop, i) =>
          i === index ? { ...stop, [field]: value } : stop
        ),
      }));
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

  const handleDrop = (e, dropIndex, formType = "new") => {
    e.preventDefault();
    setDragOverIndex(null);

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    if (formType === "edit") {
      setEditRoute((prev) => {
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
    }

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
          stops: [{ name: "", lat: "", lon: "" }],
        });
        setDraggedIndex(null);
        setDragOverIndex(null);
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
    setEditRoute({
      routeNumber: route.routeNumber,
      name: route.name,
      stops: route.stops.map((stop) => ({
        name: stop.name,
        lat: stop.lat.toString(),
        lon: stop.lon.toString(),
      })),
    });
    setShowEditModal(true);
    // Reset drag states
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Update route function
  const handleUpdateRoute = async (e) => {
    e.preventDefault();

    try {
      setSubmitLoading(true);

      // Prepare data for API
      const routeData = {
        routeNumber: parseInt(editRoute.routeNumber),
        name: editRoute.name,
        stops: editRoute.stops.map((stop) => ({
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
        setEditRoute({
          routeNumber: "",
          name: "",
          stops: [{ name: "", lat: "", lon: "" }],
        });
        setDraggedIndex(null);
        setDragOverIndex(null);
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
    setEditRoute({
      routeNumber: "",
      name: "",
      stops: [{ name: "", lat: "", lon: "" }],
    });
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setNewRoute({
      routeNumber: "",
      name: "",
      stops: [{ name: "", lat: "", lon: "" }],
    });
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Function to get the next available route number
  const getNextAvailableRouteNumber = () => {
    if (busRoutes.length === 0) return 1;

    // Get all existing route numbers and sort them
    const existingNumbers = busRoutes
      .map((route) => parseInt(route.routeNumber))
      .filter((num) => !isNaN(num))
      .sort((a, b) => a - b);

    // Find the first gap in the sequence
    for (let i = 0; i < existingNumbers.length; i++) {
      const expectedNumber = i + 1;
      if (existingNumbers[i] !== expectedNumber) {
        return expectedNumber;
      }
    }

    // If no gaps found, return the next number after the highest
    return existingNumbers.length > 0
      ? existingNumbers[existingNumbers.length - 1] + 1
      : 1;
  };

  // Function to auto-fill route number
  const handleAutoRouteNumber = () => {
    const nextNumber = getNextAvailableRouteNumber();
    setNewRoute((prev) => ({
      ...prev,
      routeNumber: nextNumber.toString(),
    }));
  };

  // Function to auto-fill route number for edit form
  const handleAutoRouteNumberEdit = () => {
    const nextNumber = getNextAvailableRouteNumber();
    setEditRoute((prev) => ({
      ...prev,
      routeNumber: nextNumber.toString(),
    }));
  };

  // Bulk selection functions
  const handleSelectRoute = (routeId) => {
    setSelectedRoutes((prev) => {
      if (prev.includes(routeId)) {
        // Remove from selection
        const newSelection = prev.filter((id) => id !== routeId);
        setSelectAll(
          newSelection.length === sortedRoutes.length && sortedRoutes.length > 0
        );
        return newSelection;
      } else {
        // Add to selection
        const newSelection = [...prev, routeId];
        setSelectAll(newSelection.length === sortedRoutes.length);
        return newSelection;
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all
      setSelectedRoutes([]);
      setSelectAll(false);
    } else {
      // Select all visible routes
      const allRouteIds = sortedRoutes.map((route) => route._id);
      setSelectedRoutes(allRouteIds);
      setSelectAll(true);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRoutes.length === 0) {
      alert("Please select routes to delete.");
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${
      selectedRoutes.length
    } route${
      selectedRoutes.length > 1 ? "s" : ""
    }? This action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      try {
        setBulkDeleteLoading(true);

        // Delete routes one by one
        const deletionPromises = selectedRoutes.map((routeId) =>
          deleteBusRoute(routeId)
        );
        await Promise.all(deletionPromises);

        // Reload routes and reset selection
        await loadBusRoutes();
        alert(
          `Successfully deleted ${selectedRoutes.length} route${
            selectedRoutes.length > 1 ? "s" : ""
          }!`
        );
      } catch (error) {
        console.error("Error deleting routes:", error);
        alert("Failed to delete some routes. Please try again.");
      } finally {
        setBulkDeleteLoading(false);
      }
    }
  };

  // Drag and drop functions for route reordering
  const handleRoutesDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());

    // Create a custom drag image
    const dragElement = e.target.closest(".routes-drag-container");
    if (dragElement) {
      e.dataTransfer.setDragImage(dragElement, 0, 0);
    }
  };

  const handleRoutesDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleRoutesDragEnter = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleRoutesDragLeave = (e) => {
    e.preventDefault();
    // Check if we're leaving the container entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleRoutesDrop = async (e, dropIndex) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    try {
      setLoading(true);
      setDragUpdateLoading(true);

      // Create a copy of the current sorted routes
      const reorderedRoutes = [...sortedRoutes];
      const draggedRoute = reorderedRoutes[draggedIndex];

      // Remove the dragged item from its current position
      reorderedRoutes.splice(draggedIndex, 1);

      // Calculate the correct drop position
      let finalDropIndex;
      if (dropIndex >= reorderedRoutes.length) {
        finalDropIndex = reorderedRoutes.length;
      } else if (dropIndex > draggedIndex) {
        finalDropIndex = dropIndex - 1;
      } else {
        finalDropIndex = dropIndex;
      }

      // Insert at new position
      reorderedRoutes.splice(finalDropIndex, 0, draggedRoute);

      // Extract route IDs in the new order for the reorder API
      const reorderedRouteIds = reorderedRoutes.map((route) => route._id);

      console.log(`Reordering ${reorderedRoutes.length} routes in database...`);

      try {
        // Use the dedicated reorder endpoint (most reliable)
        const reorderResult = await reorderRoutes(reorderedRouteIds);
        console.log("Reorder successful:", reorderResult);

        if (reorderResult.success) {
          console.log(
            `✅ Successfully reordered ${reorderResult.data.modifiedCount} routes in database`
          );
        } else {
          throw new Error("Reorder operation failed");
        }
      } catch (reorderError) {
        console.warn(
          "Reorder endpoint failed, falling back to bulk update:",
          reorderError.message
        );

        // Fallback to bulk update approach
        const routeUpdates = reorderedRoutes
          .map((route, index) => ({
            id: route._id,
            routeNumber: index + 1, // Start from 1
          }))
          .filter((update, index) => {
            // Only include routes whose numbers actually changed
            return reorderedRoutes[index].routeNumber !== update.routeNumber;
          });

        if (routeUpdates.length > 0) {
          try {
            // Try bulk update
            const bulkResult = await bulkUpdateRouteNumbers(routeUpdates);
            console.log("Bulk update successful:", bulkResult);

            if (
              bulkResult.success &&
              bulkResult.data.modifiedCount === routeUpdates.length
            ) {
              console.log(
                `✅ Successfully updated ${bulkResult.data.modifiedCount} routes via bulk update`
              );
            } else {
              throw new Error(
                `Bulk update partially failed. Expected ${routeUpdates.length}, got ${bulkResult.data.modifiedCount}`
              );
            }
          } catch (bulkError) {
            console.warn(
              "Bulk update failed, using sequential update strategy:",
              bulkError.message
            );

            // Sequential update strategy to avoid route number conflicts
            // Step 1: Assign temporary route numbers to all routes being updated
            const tempRouteNumbers = routeUpdates.map(
              (_, index) => 9000 + index
            ); // Use high numbers as temp

            console.log("Step 1: Assigning temporary route numbers...");
            for (let i = 0; i < routeUpdates.length; i++) {
              const update = routeUpdates[i];
              const route = reorderedRoutes.find((r) => r._id === update.id);
              try {
                await updateBusRoute(update.id, {
                  ...route,
                  routeNumber: tempRouteNumbers[i],
                });
                console.log(
                  `🔄 Temp number ${tempRouteNumbers[i]} assigned to route ${route.name}`
                );
              } catch (error) {
                console.error(
                  `❌ Failed to assign temp number to route ${route.name}:`,
                  error
                );
                throw new Error(
                  `Failed to assign temporary route number to ${route.name}`
                );
              }
            }

            // Step 2: Assign final route numbers
            console.log("Step 2: Assigning final route numbers...");
            for (const update of routeUpdates) {
              const route = reorderedRoutes.find((r) => r._id === update.id);
              try {
                await updateBusRoute(update.id, {
                  ...route,
                  routeNumber: update.routeNumber,
                });
                console.log(
                  `✅ Final number ${update.routeNumber} assigned to route ${route.name}`
                );
              } catch (error) {
                console.error(
                  `❌ Failed to assign final number to route ${route.name}:`,
                  error
                );
                throw new Error(
                  `Failed to assign final route number to ${route.name}`
                );
              }
            }

            console.log(
              `✅ Sequential updates completed: ${routeUpdates.length} routes updated`
            );
          }
        }
      }

      // Reload routes from database to ensure consistency
      console.log("Reloading routes from database to verify changes...");
      await loadBusRoutes();

      // Show success message
      console.log(`✅ Route reordering completed successfully!`);

      // Show toast notification
      showToast(
        `Successfully reordered routes and updated route numbers in database.`,
        "success"
      );
    } catch (error) {
      console.error("❌ Error reordering routes:", error);

      // Show specific error message based on error type
      let errorMessage = "Failed to reorder routes. Please try again.";

      if (error.message?.includes("Route number already exists")) {
        errorMessage = "Cannot reorder: Route number conflict detected.";
      } else if (
        error.message?.includes("network") ||
        error.message?.includes("fetch")
      ) {
        errorMessage =
          "Network error: Please check your connection and try again.";
      } else if (
        error.message?.includes("Forbidden") ||
        error.message?.includes("403")
      ) {
        errorMessage = "Permission denied: Admin access required.";
      }

      // Show error message
      showToast(errorMessage, "error");

      // Reload routes to ensure consistency with database
      console.log("Reloading routes from database after error...");
      await loadBusRoutes();
    } finally {
      setLoading(false);
      setDragUpdateLoading(false);
    }

    setDraggedIndex(null);
  };

  const handleRoutesDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <RouteHeader
          onAddRoute={() => {
            setShowAddModal(true);
            setDraggedIndex(null);
            setDragOverIndex(null);
          }}
          onImportRoute={() => setShowImportModal(true)}
          onExportRoute={exportRoutesToJSON}
          selectedRoutes={selectedRoutes}
          onBulkDelete={handleBulkDelete}
          bulkDeleteLoading={bulkDeleteLoading}
        />

        {/* Filter Section */}
        <RouteFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          totalRoutes={busRoutes.length}
          filteredRoutes={sortedRoutes.length}
          selectedRoutes={selectedRoutes}
        />

        {/* Routes List */}
        <RouteList
          routes={sortedRoutes}
          loading={loading}
          searchTerm={searchTerm}
          sortOrder={sortOrder}
          selectedRoutes={selectedRoutes}
          selectAll={selectAll}
          draggedIndex={draggedIndex}
          dragOverIndex={dragOverIndex}
          dragUpdateLoading={dragUpdateLoading}
          onSelectAll={handleSelectAll}
          onSelectRoute={handleSelectRoute}
          onEditRoute={handleEditRoute}
          onDeleteRoute={handleDeleteRoute}
          onRoutesDragStart={handleRoutesDragStart}
          onRoutesDragOver={handleRoutesDragOver}
          onRoutesDragEnter={handleRoutesDragEnter}
          onRoutesDragLeave={handleRoutesDragLeave}
          onRoutesDrop={handleRoutesDrop}
          onRoutesDragEnd={handleRoutesDragEnd}
        />

        {/* Add Route Modal */}
        <AddRouteModal
          isOpen={showAddModal}
          onClose={closeModal}
          newRoute={newRoute}
          setNewRoute={setNewRoute}
          submitLoading={submitLoading}
          draggedIndex={draggedIndex}
          dragOverIndex={dragOverIndex}
          onSubmit={handleSubmit}
          onAutoRouteNumber={handleAutoRouteNumber}
          onAddStopAfter={addStopAfter}
          onRemoveStop={removeStop}
          onUpdateStop={updateStop}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />

        {/* Edit Route Modal */}
        <EditRouteModal
          isOpen={showEditModal && editingRoute}
          onClose={closeEditModal}
          editRoute={editRoute}
          setEditRoute={setEditRoute}
          submitLoading={submitLoading}
          draggedIndex={draggedIndex}
          dragOverIndex={dragOverIndex}
          onSubmit={handleUpdateRoute}
          onAutoRouteNumber={handleAutoRouteNumberEdit}
          onAddStopAfter={addStopAfter}
          onRemoveStop={removeStop}
          onUpdateStop={updateStop}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        />

        {/* Import Routes Modal */}
        <ImportRouteModal
          isOpen={showImportModal}
          onClose={closeImportModal}
          selectedFile={selectedFile}
          replaceExisting={replaceExisting}
          setReplaceExisting={setReplaceExisting}
          importLoading={importLoading}
          onFileSelect={handleFileSelect}
          onImportRoutes={handleImportRoutes}
        />
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border-l-4 transition-all duration-500 ${
            toast.type === "success"
              ? "bg-green-50 border-green-400 text-green-700"
              : "bg-red-50 border-red-400 text-red-700"
          }`}
        >
          <div className="flex items-center">
            <div className="mr-3">
              {toast.type === "success" ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminBusRoutes;
