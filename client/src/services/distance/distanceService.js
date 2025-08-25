// Distance service for handling distance calculations
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Local haversine distance calculation as fallback
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Cache for distance calculations to avoid repeated API calls
const distanceCache = new Map();

// Generate cache key for two coordinates
const getCacheKey = (lat1, lon1, lat2, lon2) => {
  return `${lat1.toFixed(6)},${lon1.toFixed(6)}-${lat2.toFixed(
    6
  )},${lon2.toFixed(6)}`;
};

// Synchronous distance calculation with caching
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const cacheKey = getCacheKey(lat1, lon1, lat2, lon2);

  // Check cache first
  if (distanceCache.has(cacheKey)) {
    return distanceCache.get(cacheKey);
  }

  // Use local calculation (same as before)
  const distance = haversineDistance(lat1, lon1, lat2, lon2);

  // Cache the result
  distanceCache.set(cacheKey, distance);

  return distance;
};

// Async distance calculation using backend API
export const calculateDistanceAsync = async (lat1, lon1, lat2, lon2) => {
  const cacheKey = getCacheKey(lat1, lon1, lat2, lon2);

  // Check cache first
  if (distanceCache.has(cacheKey)) {
    return distanceCache.get(cacheKey);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/distance/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lat1, lon1, lat2, lon2 }),
    });

    if (!response.ok) {
      throw new Error(`Distance calculation failed: ${response.status}`);
    }

    const data = await response.json();
    const distance = data.distance;

    // Cache the result
    distanceCache.set(cacheKey, distance);

    return distance;
  } catch (error) {
    console.error("Error calculating distance via API:", error);

    // Fallback to local calculation
    const distance = haversineDistance(lat1, lon1, lat2, lon2);
    distanceCache.set(cacheKey, distance);

    return distance;
  }
};

// Calculate route distance using backend API
export const calculateRouteDistanceAsync = async (route) => {
  if (!Array.isArray(route) || route.length < 2) {
    return 0;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/distance/route`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ route }),
    });

    if (!response.ok) {
      throw new Error(`Route distance calculation failed: ${response.status}`);
    }

    const data = await response.json();
    return data.totalDistance;
  } catch (error) {
    console.error("Error calculating route distance via API:", error);

    // Fallback to local calculation
    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      const current = route[i];
      const next = route[i + 1];
      totalDistance += calculateDistance(
        current.lat,
        current.lon,
        next.lat,
        next.lon
      );
    }
    return totalDistance;
  }
};

// Find nearest point using backend API
export const findNearestPointAsync = async (userLat, userLon, points) => {
  if (!Array.isArray(points) || points.length === 0) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/distance/nearest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userLat, userLon, points }),
    });

    if (!response.ok) {
      throw new Error(`Nearest point calculation failed: ${response.status}`);
    }

    const data = await response.json();
    return data.nearestPoint;
  } catch (error) {
    console.error("Error finding nearest point via API:", error);

    // Fallback to local calculation
    let nearestPoint = null;
    let minDistance = Infinity;

    for (const point of points) {
      const distance = calculateDistance(
        userLat,
        userLon,
        point.lat,
        point.lon
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = {
          ...point,
          distance: distance,
        };
      }
    }

    return nearestPoint;
  }
};

// Clear cache if needed
export const clearDistanceCache = () => {
  distanceCache.clear();
};

// Get cache size for debugging
export const getCacheSize = () => {
  return distanceCache.size;
};
