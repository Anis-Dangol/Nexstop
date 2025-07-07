import { useState, useEffect } from "react";
import { fetchRouteFromAPI, fetchUserToStart } from "../map/MapAPISlice";
import { fetchBusRoutes } from "../services/busRoutes";
import { GetTransferMessage } from "@/lib/GetTransferMessage";

export const useMapData = (routeProp) => {
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

  const center = [27.686262, 85.303635];

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

  // Effect: Fetch fare data when route changes
  useEffect(() => {
    if (routeProp && routeProp.length > 1) {
      const start = routeProp[0].name;
      const end = routeProp[routeProp.length - 1].name;
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
        .then((data) => setFareData(data))
        .catch(() => setFareData(null));
    } else {
      setFareData(null);
    }
  }, [routeProp]);

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
      if (userLocation && selectedStops.length > 0) {
        const coords = await fetchUserToStart(userLocation, selectedStops);
        setUserToStartCoords(coords);
      } else {
        setUserToStartCoords([]);
      }
    }
    fetchUserToStartCoords();
  }, [userLocation, selectedStops]);

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

  return {
    userLocation,
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
  };
};
