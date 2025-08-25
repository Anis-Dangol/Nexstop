const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Get all bus routes
export const fetchBusRoutes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/bus/routes`);
    if (!response.ok) {
      throw new Error("Failed to fetch bus routes");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching bus routes:", error);
    throw error;
  }
};

// Get all bus stops
export const fetchBusStops = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/bus/stops`);
    if (!response.ok) {
      throw new Error("Failed to fetch bus stops");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching bus stops:", error);
    throw error;
  }
};

// Get single bus route by ID
export const fetchBusRouteById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bus/routes/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch bus route");
    }
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching bus route:", error);
    throw error;
  }
};

// Create new bus route (admin only)
export const createBusRoute = async (routeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bus/routes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for authentication
      body: JSON.stringify(routeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create bus route");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating bus route:", error);
    throw error;
  }
};

// Update bus route (admin only)
export const updateBusRoute = async (id, routeData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bus/routes/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for authentication
      body: JSON.stringify(routeData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update bus route");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating bus route:", error);
    throw error;
  }
};

// Delete bus route (admin only)
export const deleteBusRoute = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bus/routes/${id}`, {
      method: "DELETE",
      credentials: "include", // Include cookies for authentication
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete bus route");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting bus route:", error);
    throw error;
  }
};

// Get bus statistics (admin only)
export const fetchBusStatistics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/bus/statistics`, {
      credentials: "include", // Include cookies for authentication
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch bus statistics");
    }

    const data = await response.json();
    return data.statistics;
  } catch (error) {
    console.error("Error fetching bus statistics:", error);
    throw error;
  }
};

// Import bus routes from JSON file (admin only)
export const importBusRoutes = async (routesData, replaceExisting = false) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bus/routes/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for authentication
      body: JSON.stringify({
        routes: routesData,
        replaceExisting: replaceExisting,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to import bus routes");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error importing bus routes:", error);
    throw error;
  }
};

// Delete bus stop (admin only)
export const deleteBusStop = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bus/stops/${id}`, {
      method: "DELETE",
      credentials: "include", // Include cookies for authentication
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete bus stop");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting bus stop:", error);
    throw error;
  }
};

// Update bus stop (admin only)
export const updateBusStop = async (id, stopData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bus/stops/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for authentication
      body: JSON.stringify(stopData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update bus stop");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating bus stop:", error);
    throw error;
  }
};

// Delete bus stop from all routes (admin only)
export const deleteBusStopFromAllRoutes = async (stopData) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/bus/stops/delete-from-all-routes`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify(stopData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to delete bus stop from all routes"
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error deleting bus stop from all routes:", error);
    throw error;
  }
};

// Bulk update route numbers (admin only)
export const bulkUpdateRouteNumbers = async (routeUpdates) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/bus/routes/bulk-update-numbers`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies for authentication
        body: JSON.stringify({ updates: routeUpdates }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Failed to bulk update route numbers"
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error bulk updating route numbers:", error);
    throw error;
  }
};

// Reorder routes with automatic route number assignment (admin only)
export const reorderRoutes = async (routeIds) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bus/routes/reorder`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include cookies for authentication
      body: JSON.stringify({ routeIds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to reorder routes");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error reordering routes:", error);
    throw error;
  }
};
