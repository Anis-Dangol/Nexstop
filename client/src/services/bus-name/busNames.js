const API_BASE_URL = "http://localhost:5000/api";

// Fetch all bus names
export const fetchBusNames = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/busname`);
    if (!response.ok) {
      throw new Error("Failed to fetch bus names");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching bus names:", error);
    throw error;
  }
};

// Create a new bus name
export const createBusName = async (busNameData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/busname`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(busNameData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to create bus name");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating bus name:", error);
    throw error;
  }
};

// Update a bus name
export const updateBusName = async (id, busNameData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/busname/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(busNameData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to update bus name");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating bus name:", error);
    throw error;
  }
};

// Delete a bus name
export const deleteBusName = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/busname/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete bus name");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting bus name:", error);
    throw error;
  }
};

// Import bus names from JSON
export const importBusNames = async (busNamesData, replaceExisting = false) => {
  try {
    const response = await fetch(`${API_BASE_URL}/busname/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        busNames: busNamesData,
        replaceExisting,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to import bus names");
    }

    return await response.json();
  } catch (error) {
    console.error("Error importing bus names:", error);
    throw error;
  }
};
