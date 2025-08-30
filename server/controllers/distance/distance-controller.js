
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const EARTH_RADIUS_KM = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) *
      Math.cos(radLat2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;
  return distance;
}

export const handleCalculateDistance = (req, res) => {
  try {
    const { lat1, lon1, lat2, lon2 } = req.body;

    // Validate input
    if (!lat1 || !lon1 || !lat2 || !lon2) {
      return res.status(400).json({
        error:
          "Missing required coordinates. Please provide lat1, lon1, lat2, lon2",
      });
    }

    // Convert to numbers
    const numLat1 = parseFloat(lat1);
    const numLon1 = parseFloat(lon1);
    const numLat2 = parseFloat(lat2);
    const numLon2 = parseFloat(lon2);

    // Validate coordinates
    if (isNaN(numLat1) || isNaN(numLon1) || isNaN(numLat2) || isNaN(numLon2)) {
      return res.status(400).json({
        error: "Invalid coordinates. All coordinates must be valid numbers",
      });
    }

    if (numLat1 < -90 || numLat1 > 90 || numLat2 < -90 || numLat2 > 90) {
      return res.status(400).json({
        error: "Invalid latitude. Latitude must be between -90 and 90",
      });
    }

    if (numLon1 < -180 || numLon1 > 180 || numLon2 < -180 || numLon2 > 180) {
      return res.status(400).json({
        error: "Invalid longitude. Longitude must be between -180 and 180",
      });
    }

    const distance = calculateDistance(numLat1, numLon1, numLat2, numLon2);

    res.json({
      distance: distance,
      unit: "kilometers",
      distanceMeters: distance * 1000,
      coordinates: {
        from: { lat: numLat1, lon: numLon1 },
        to: { lat: numLat2, lon: numLon2 },
      },
    });
  } catch (error) {
    console.error("Error calculating distance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export function calculateRouteDistance(route) {
  if (!Array.isArray(route) || route.length < 2) {
    return 0;
  }

  let totalDistance = 0;

  for (let i = 0; i < route.length - 1; i++) {
    const currentStop = route[i];
    const nextStop = route[i + 1];

    if (currentStop.lat && currentStop.lon && nextStop.lat && nextStop.lon) {
      const segmentDistance = calculateDistance(
        currentStop.lat,
        currentStop.lon,
        nextStop.lat,
        nextStop.lon
      );
      totalDistance += segmentDistance;
    }
  }

  return totalDistance;
}

export const handleRouteDistance = (req, res) => {
  try {
    const { route } = req.body;

    if (!Array.isArray(route)) {
      return res.status(400).json({
        error: "Route must be an array of coordinates",
      });
    }

    if (route.length < 2) {
      return res.status(400).json({
        error: "Route must contain at least 2 points",
      });
    }

    // Validate route points
    for (let i = 0; i < route.length; i++) {
      const point = route[i];
      if (!point.lat || !point.lon) {
        return res.status(400).json({
          error: `Point ${i} is missing lat or lon coordinates`,
        });
      }

      const lat = parseFloat(point.lat);
      const lon = parseFloat(point.lon);

      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({
          error: `Point ${i} has invalid coordinates`,
        });
      }
    }

    const totalDistance = calculateRouteDistance(route);

    res.json({
      totalDistance: totalDistance,
      unit: "kilometers",
      totalDistanceMeters: totalDistance * 1000,
      numberOfStops: route.length,
      numberOfSegments: route.length - 1,
    });
  } catch (error) {
    console.error("Error calculating route distance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export function findNearestPoint(userLat, userLon, points) {
  if (!Array.isArray(points) || points.length === 0) {
    return null;
  }

  let nearestPoint = null;
  let minDistance = Infinity;

  for (const point of points) {
    if (point.lat && point.lon) {
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
  }

  return nearestPoint;
}

export const handleNearestPoint = (req, res) => {
  try {
    const { userLat, userLon, points } = req.body;

    if (!userLat || !userLon) {
      return res.status(400).json({
        error: "Missing user coordinates. Please provide userLat and userLon",
      });
    }

    if (!Array.isArray(points) || points.length === 0) {
      return res.status(400).json({
        error: "Points must be a non-empty array",
      });
    }

    const numUserLat = parseFloat(userLat);
    const numUserLon = parseFloat(userLon);

    if (isNaN(numUserLat) || isNaN(numUserLon)) {
      return res.status(400).json({
        error: "Invalid user coordinates",
      });
    }

    const nearestPoint = findNearestPoint(numUserLat, numUserLon, points);

    if (!nearestPoint) {
      return res.status(404).json({
        error: "No valid points found",
      });
    }

    res.json({
      nearestPoint: nearestPoint,
      userLocation: { lat: numUserLat, lon: numUserLon },
      unit: "kilometers",
    });
  } catch (error) {
    console.error("Error finding nearest point:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export function kmToMeters(distanceKm) {
  return distanceKm * 1000;
}

export function metersToKm(distanceM) {
  return distanceM / 1000;
}

// For backward compatibility, export the main function with different names
export const haversineDistance = calculateDistance;
export const getDistance = calculateDistance;
