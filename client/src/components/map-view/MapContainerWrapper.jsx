// MapContainerWrapper.jsx
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import UserLocationMarker from "../route-marker/UserLocationMarker";
import BusStopMarkers from "../route-marker/BusStopMarkers";
import ZoomLevelTracker from "./ZoomLevelTracker";
import BottomSheet from "../bottom-sheet/BottomSheet";
import MapBottomSheet from "../bottom-sheet/MapBottomSheet";
import { HandCoins, BusFront } from "lucide-react";
import { fetchRouteFromAPI, fetchUserToStart } from "../../map/mapApi";
import routesData from "../../assets/routes.json";

export default function MapContainerWrapper({
  route: routeProp,
  triggerOpenBottomSheet,
}) {
  // --- State ---
  const [userLocation, setUserLocation] = useState(null);
  const [busStops, setBusStops] = useState([]);
  const [zoom, setZoom] = useState(13);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("fare");
  const [fareData, setFareData] = useState(null);
  const [allStops, setAllStops] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [predefinedRoutes, setPredefinedRoutes] = useState([]);
  const [apiRouteCoords, setApiRouteCoords] = useState([]);
  const [userToStartCoords, setUserToStartCoords] = useState([]);

  // --- Effects ---
  // Effect: Open BottomSheet when triggered externally
  useEffect(() => {
    if (triggerOpenBottomSheet) {
      openBottomSheet("fare");
    }
  }, [triggerOpenBottomSheet]);

  // Effect: Open/close BottomSheet when route changes
  useEffect(() => {
    if (routeProp && routeProp.length > 1) {
      openBottomSheet("fare");
    } else {
      setIsBottomSheetOpen(false);
    }
  }, [routeProp]);

  const center = [27.686262, 85.303635];

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
  }, []);

  // Effect: Fetch fare data when route changes
  useEffect(() => {
    if (routeProp && routeProp.length > 1) {
      const start = routeProp[0].name;
      const end = routeProp[routeProp.length - 1].name;
      fetch("http://192.168.1.3:5000/api/bus/estimate-fare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start, end }),
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

  // --- Handlers ---
  const openBottomSheet = (tab = "fare") => {
    setIsBottomSheetOpen(true);
    setActiveTab(tab);
  };

  const handleStopClick = (stop) => {
    if (selectedStops.length === 0) {
      setSelectedStops([stop]);
    } else if (selectedStops.length === 1) {
      if (
        selectedStops[0].lat === stop.lat &&
        selectedStops[0].lon === stop.lon
      )
        return;
      setSelectedStops([selectedStops[0], stop]);
    } else {
      setSelectedStops([stop]);
    }
  };

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
        setRoute(foundRoute || [selectedStops[0], selectedStops[1]]);
        const stopsToSend = foundRoute || [selectedStops[0], selectedStops[1]];
        const coords = await fetchRouteFromAPI(stopsToSend);
        setApiRouteCoords(coords);
      } else {
        setRoute([]);
        setApiRouteCoords([]);
      }
    }
    handleRoute();
  }, [selectedStops, predefinedRoutes]);

  // Effect: Sync selectedStops with routeProp
  useEffect(() => {
    if (routeProp && routeProp.length > 0) {
      setSelectedStops([routeProp[0]]);
    } else {
      setSelectedStops([]);
    }
  }, [routeProp]);

  // --- Render ---
  return (
    <div className="relative h-screen w-screen">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        zoomControl={false}
        className="h-screen w-full z-0"
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ZoomLevelTracker onZoomChange={setZoom} />
        <UserLocationMarker position={center} />
        {/* Show all unique stops as clickable markers */}
        <BusStopMarkers
          busStops={allStops}
          show={zoom >= 14}
          onSetStart={(stopName) => {
            if (window.setStartInput) window.setStartInput(stopName);
          }}
          onSetEnd={(stopName) => {
            if (window.setEndInput) window.setEndInput(stopName);
          }}
        />
        {/* Draw API route polyline if available */}
        {apiRouteCoords.length > 1 && (
          <Polyline positions={apiRouteCoords} color="blue" weight={6} />
        )}
        {/* Draw OSM route from user location to start bus stop if both exist */}
        {userToStartCoords.length > 1 && (
          <Polyline
            positions={userToStartCoords}
            color="green"
            weight={4}
            dashArray="6,8"
          />
        )}
      </MapContainer>

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
      >
        <MapBottomSheet
          isOpen={isBottomSheetOpen}
          onClose={() => setIsBottomSheetOpen(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          fareData={fareData}
        />
      </BottomSheet>
    </div>
  );
}
