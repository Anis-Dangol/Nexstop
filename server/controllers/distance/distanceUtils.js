/**
 * Distance calculation utilities using the Haversine formula
 * This utility provides accurate distance calculations between geographical coordinates
 */

/**
 * Calculate the great-circle distance between two points on Earth
 * using the Haversine formula
 *
 * @param {number} lat1 - Latitude of the first point (in degrees)
 * @param {number} lon1 - Longitude of the first point (in degrees)
 * @param {number} lat2 - Latitude of the second point (in degrees)
 * @param {number} lon2 - Longitude of the second point (in degrees)
 * @returns {number} Distance in kilometers
 */
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

/**
 * Calculate the total distance of a route (sum of distances between consecutive stops)
 *
 * @param {Array} route - Array of stops with lat and lon properties
 * @returns {number} Total distance in kilometers
 */
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

/**
 * Find the nearest point from a given location among an array of points
 *
 * @param {number} userLat - User's latitude
 * @param {number} userLon - User's longitude
 * @param {Array} points - Array of points with lat, lon, and name properties
 * @returns {Object|null} The nearest point with additional distance property
 */
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

/**
 * Convert distance from kilometers to meters
 *
 * @param {number} distanceKm - Distance in kilometers
 * @returns {number} Distance in meters
 */
export function kmToMeters(distanceKm) {
  return distanceKm * 1000;
}

/**
 * Convert distance from meters to kilometers
 *
 * @param {number} distanceM - Distance in meters
 * @returns {number} Distance in kilometers
 */
export function metersToKm(distanceM) {
  return distanceM / 1000;
}

// For backward compatibility, export the main function with different names
export const haversineDistance = calculateDistance;
export const getDistance = calculateDistance;
