import { fetchBusNames } from "../services/busNames";

// Cache for bus names data
let busNamesCache = null;

// Helper: Load bus names from API and cache them
async function loadBusNames() {
  if (!busNamesCache) {
    try {
      busNamesCache = await fetchBusNames();
    } catch (error) {
      console.error("Failed to load bus names:", error);
      busNamesCache = [];
    }
  }
  return busNamesCache;
}

// Helper: Clear bus names cache (call this when bus names are updated)
export function clearBusNamesCache() {
  busNamesCache = null;
}

// Helper: Find routeNumber for a stop
export function getRouteNumberForStop(stop, predefinedRoutes) {
  for (const route of predefinedRoutes) {
    if (route.stops.some((s) => s.lat === stop.lat && s.lon === stop.lon)) {
      return route.routeNumber;
    }
  }
  return null;
}

// Helper: Find where routeNumber changes in routeProp
export function getRouteChangeIndices(routeProp, predefinedRoutes) {
  if (!routeProp || routeProp.length < 2) return [];
  const changes = [];
  let prevRoute = getRouteNumberForStop(routeProp[0], predefinedRoutes);
  for (let i = 1; i < routeProp.length; i++) {
    const currRoute = getRouteNumberForStop(routeProp[i], predefinedRoutes);
    if (currRoute !== prevRoute) {
      changes.push(i);
      prevRoute = currRoute;
    }
  }
  return changes;
}

// Helper: Get bus names for a stop
export async function getBusNamesForStop(stopName) {
  const busNameArray = await loadBusNames();
  const busNames = busNameArray
    .filter((entry) => entry.stops.includes(stopName))
    .map((entry) => entry.busname);

  return busNames.length > 0 ? busNames : null;
}

// Helper: Find routeNumber for a segment between two stops
export function getRouteNumberForSegment(stopA, stopB, predefinedRoutes) {
  const routeNumbers = [];
  for (const route of predefinedRoutes) {
    const stops = route.stops;
    for (let i = 0; i < stops.length - 1; i++) {
      if (
        stops[i].lat === stopA.lat &&
        stops[i].lon === stopA.lon &&
        stops[i + 1].lat === stopB.lat &&
        stops[i + 1].lon === stopB.lon
      ) {
        routeNumbers.push(route.routeNumber);
      }
    }
  }
  return routeNumbers.length > 0 ? routeNumbers : null;
}
