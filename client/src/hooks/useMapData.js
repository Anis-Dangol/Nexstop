import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchRouteFromAPI, fetchUserToStart } from "../map/MapAPISlice";
import { fetchBusRoutes } from "../services/busRoutes";
import { GetTransferMessage } from "@/lib/GetTransferMessage";

export const useMapData = (routeProp, customUserLocation = null) => {
  const [userLocation, setUserLocation] = useState(null);
  const [fareData, setFareData] = useState(null);
  const [allStops, setAllStops] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [predefinedRoutes, setPredefinedRoutes] = useState([]);
  const [apiRouteCoords, setApiRouteCoords] = useState([]);
  const [userToStartCoords, setUserToStartCoords] = useState([]);
  const [transferMessage, setTransferMessage] = useState(null);
  const [route, setRoute] = useState([]);
  const [nearestStopMarker, setNearestStopMarker] = useState(null);
  const [routesData, setRoutesData] = useState([]);

  const center = customUserLocation || userLocation || [27.686262, 85.303635];

  // Load routes data from MongoDB
  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const routes = await fetchBusRoutes();
        setRoutesData(routes);
      } catch (error) {
        console.error("Failed to load routes:", error);
        setRoutesData([]);
      }
    };
    loadRoutes();
  }, []);

  // Effect: Load user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setUserLocation(center);
      }
    );
  }, []);

  // Effect: Load routes and extract unique stops
  useEffect(() => {
    setPredefinedRoutes(routesData);
    const stopSet = new Set();
    const allStopsArr = [];
    routesData.forEach((route) => {
      route.stops.forEach((stop) => {
        const key = `${stop.lat},${stop.lon}`;
        if (!stopSet.has(key)) {
          stopSet.add(key);
          allStopsArr.push(stop);
        }
      });
    });
    setAllStops(allStopsArr);
  }, [routesData]); // Add routesData as dependency

  // Create a route hash to force re-evaluation
  const routeHash = useMemo(() => {
    if (!routeProp || routeProp.length === 0) return "";
    return routeProp
      .map((stop) => `${stop.name}_${stop.lat}_${stop.lon}`)
      .join("|");
  }, [routeProp]);

  // Effect: Fetch fare data when route changes
  useEffect(() => {
    console.log("useMapData: Route changed, routeProp:", routeProp);
    console.log("useMapData: Route hash:", routeHash);
    if (routeProp && routeProp.length > 1) {
      const start = routeProp[0].name;
      const end = routeProp[routeProp.length - 1].name;
      console.log("useMapData: Fetching fare data for:", start, "→", end);
      console.log("useMapData: Route data:", routeProp);

      fetch("http://localhost:5000/api/bus/estimate-fare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start,
          end,
          route: routeProp,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("useMapData: Fare data received:", data);
          setFareData(data);
        })
        .catch((error) => {
          console.error("useMapData: Error fetching fare data:", error);
          setFareData(null);
        });
    } else {
      console.log(
        "useMapData: No route or route too short, clearing fare data"
      );
      setFareData(null);
    }
  }, [routeHash]); // Use route hash for more reliable change detection

  // Effect: Fetch API route when routeProp changes
  useEffect(() => {
    async function fetchApiRoute() {
      if (routeProp && routeProp.length > 1) {
        const coords = await fetchRouteFromAPI(routeProp);
        setApiRouteCoords(coords);
      } else {
        setApiRouteCoords([]);
      }
    }
    fetchApiRoute();
  }, [routeProp]);

  // Effect: Fetch OSM route from user location to start bus stop
  useEffect(() => {
    async function fetchUserToStartCoords() {
      // Use custom user location if available, otherwise use GPS location
      const effectiveUserLocation = customUserLocation || userLocation;
      if (effectiveUserLocation && selectedStops.length > 0) {
        const coords = await fetchUserToStart(
          effectiveUserLocation,
          selectedStops
        );
        setUserToStartCoords(coords);
      } else {
        setUserToStartCoords([]);
      }
    }
    fetchUserToStartCoords();
  }, [userLocation, selectedStops, customUserLocation]);

  // Effect: Check for transfer popup when route changes
  useEffect(() => {
    const checkTransferMessage = async () => {
      if (routeProp && routeProp.length > 1) {
        const stopNames = routeProp.map((stop) => stop.name);
        const message = await GetTransferMessage(stopNames);
        setTransferMessage(message);
      } else {
        setTransferMessage(null);
      }
    };

    checkTransferMessage();
  }, [routeProp]);

  // Effect: Find route subset between two stops and draw API route
  useEffect(() => {
    async function handleRoute() {
      if (selectedStops.length === 2) {
        const [start, end] = selectedStops;
        let foundRoute = null;
        for (const route of predefinedRoutes) {
          const stops = route.stops;
          const startIndex = stops.findIndex(
            (s) => s.lat === start.lat && s.lon === start.lon
          );
          const endIndex = stops.findIndex(
            (s) => s.lat === end.lat && s.lon === end.lon
          );
          if (startIndex !== -1 && endIndex !== -1 && startIndex <= endIndex) {
            foundRoute = stops.slice(startIndex, endIndex + 1);
            break;
          }
        }
        const routeArr = foundRoute || [selectedStops[0], selectedStops[1]];
        setRoute(routeArr);
        const stopNames = routeArr.map((stop) => stop.name);
        const transferMessage = await GetTransferMessage(stopNames);
        setTransferMessage(transferMessage);
        const coords = await fetchRouteFromAPI(routeArr);
        setApiRouteCoords(coords);
      } else {
        setRoute([]);
        setApiRouteCoords([]);
        setTransferMessage(null);
      }
    }
    handleRoute();
  }, [selectedStops, predefinedRoutes]);

  // Effect: Sync selectedStops with routeProp and clear nearest stop marker when route is cleared
  useEffect(() => {
    if (routeProp && routeProp.length > 0) {
      setSelectedStops([routeProp[0]]);
    } else {
      setSelectedStops([]);
      // Clear nearest stop marker when route is cleared
      setNearestStopMarker(null);
    }
  }, [routeProp]);

  // Effect: Set up nearest stop marker window function
  useEffect(() => {
    window.updateNearestMarker = (stop) => {
      setNearestStopMarker(stop);
    };

    return () => {
      window.updateNearestMarker = undefined;
    };
  }, []);

  // Function to force refresh fare data
  const refreshFareData = useCallback(() => {
    console.log("useMapData: Force refreshing fare data");
    if (routeProp && routeProp.length > 1) {
      const start = routeProp[0].name;
      const end = routeProp[routeProp.length - 1].name;
      console.log("useMapData: Force fetching fare data for:", start, "→", end);

      fetch("http://localhost:5000/api/bus/estimate-fare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start,
          end,
          route: routeProp,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("useMapData: Force refresh - Fare data received:", data);
          setFareData(data);
        })
        .catch((error) => {
          console.error(
            "useMapData: Force refresh - Error fetching fare data:",
            error
          );
          setFareData(null);
        });
    }
  }, [routeProp]);

  // Calculate the effective user location
  const effectiveUserLocation = customUserLocation || userLocation;

  return {
    userLocation,
    effectiveUserLocation,
    fareData,
    allStops,
    selectedStops,
    predefinedRoutes,
    apiRouteCoords,
    userToStartCoords,
    transferMessage,
    route,
    nearestStopMarker,
    center,
    setSelectedStops,
    refreshFareData, // Add the refresh function
  };
};
