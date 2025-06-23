// MapContainerWrapper.jsx
import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import UserLocationMarker from "../route-marker/UserLocationMarker";
import BusStopMarkers from "../route-marker/BusStopMarkers";
import ZoomLevelTracker from "./ZoomLevelTracker";
import BottomSheet from "../bottom-sheet/BottomSheet";
import MapBottomSheet from "../bottom-sheet/MapBottomSheet";
import { HandCoins, BusFront } from "lucide-react";
import { fetchRouteFromAPI, fetchUserToStart } from "../../map/mapApi";
import routesData from "../../assets/routes.json";
import RoutePopup from "./RoutePopup";
import { getTransferMessage } from "@/lib/showTransferPopup";
import transferData from "@/assets/transfer.json";

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
  const [routePopupOpen, setRoutePopupOpen] = useState(false);
  const [routePopupPos, setRoutePopupPos] = useState(null);
  const [transferMessage, setTransferMessage] = useState(null);
  const [route, setRoute] = useState([]);
  const [showTransferPopup, setShowTransferPopup] = useState(false);

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
      fetch("http://localhost:5000/api/bus/estimate-fare", {
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

  // Effect: Check for transfer popup when route changes
  useEffect(() => {
    if (routeProp && routeProp.length > 1) {
      const stopNames = routeProp.map((stop) => stop.name);
      const message = getTransferMessage(stopNames);
      setTransferMessage(message);
    } else {
      setTransferMessage(null);
    }
  }, [routeProp]);

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

  // Helper to get midpoint of route for popup
  function getRouteMidpoint(coords) {
    if (!coords || coords.length === 0) return null;
    const midIdx = Math.floor(coords.length / 2);
    return coords[midIdx];
  }

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
        // Get transfer message for this route
        const stopNames = routeArr.map((stop) => stop.name);
        setTransferMessage(getTransferMessage(stopNames));
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

  // Effect: Sync selectedStops with routeProp
  useEffect(() => {
    if (routeProp && routeProp.length > 0) {
      setSelectedStops([routeProp[0]]);
    } else {
      setSelectedStops([]);
    }
  }, [routeProp]);

  // Helper: Find routeNumber for a stop
  function getRouteNumberForStop(stop) {
    for (const route of predefinedRoutes) {
      if (route.stops.some((s) => s.lat === stop.lat && s.lon === stop.lon)) {
        return route.routeNumber;
      }
    }
    return null;
  }

  // Helper: Find where routeNumber changes in routeProp
  function getRouteChangeIndices(routeProp) {
    if (!routeProp || routeProp.length < 2) return [];
    const changes = [];
    let prevRoute = getRouteNumberForStop(routeProp[0]);
    for (let i = 1; i < routeProp.length; i++) {
      const currRoute = getRouteNumberForStop(routeProp[i]);
      if (currRoute !== prevRoute) {
        changes.push(i);
        prevRoute = currRoute;
      }
    }
    return changes;
  }

  // Helper: Find routeNumber for a segment between two stops
  function getRouteNumberForSegment(stopA, stopB) {
    // Collect all route numbers for segments matching stopA -> stopB
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

  // --- Render ---
  return (
    <div className="relative h-screen w-screen">
      {/* Transfer Popup */}
      {transferMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-200 text-black px-6 py-3 rounded shadow-lg font-semibold">
          {transferMessage}
        </div>
      )}
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
          <>
            <Polyline
              positions={apiRouteCoords}
              color="blue"
              weight={6}
              eventHandlers={{
                click: (e) => {
                  setRoutePopupOpen(true);
                  setRoutePopupPos(e.latlng);
                },
              }}
            />
            {routePopupOpen &&
              routeProp &&
              routeProp.length > 1 &&
              routePopupPos && (
                <RoutePopup
                  start={routeProp[0].name}
                  end={routeProp[routeProp.length - 1].name}
                  position={routePopupPos}
                  transferMessage={transferMessage}
                />
              )}
          </>
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
        {/* Show routeNumber and transfer info in between each bus stop */}
        {routeProp &&
          routeProp.length > 1 &&
          routeProp.slice(0, -1).map((stop, idx) => {
            const nextStop = routeProp[idx + 1];
            const midLat = (stop.lat + nextStop.lat) / 2;
            const midLon = (stop.lon + nextStop.lon) / 2;
            // Use robust segment route number
            const routeNumbers =
              getRouteNumberForSegment(stop, nextStop) || "N/A";
            // Format for display: join if array, else show as is
            const routeNumberDisplay = Array.isArray(routeNumbers)
              ? routeNumbers.join(", ")
              : routeNumbers;
            // Check for transfer
            const transfer = transferData.find(
              (t) => t.Transfer1 === stop.name && t.Transfer2 === nextStop.name
            );
            return (
              <Marker
                key={"mid-" + idx}
                position={[midLat, midLon]}
                icon={L.divIcon({
                  className: "route-number-marker",
                  iconSize: [24, 24],
                  html: transfer
                    ? `<div style='background:#f59e42;color:#fff;border-radius:50%;padding:6px 8px;border:2px solid #e67e22;font-size:14px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.12);'>T</div>`
                    : `<div style='background:#fff;border-radius:12px;padding:2px 6px;border:1px solid #0074D9;font-size:12px;'>${routeNumberDisplay}</div>`,
                })}
              >
                <Popup>
                  <div>
                    Route Number: <b>{routeNumberDisplay}</b>
                    <br />
                    Between: <br />
                    {stop.name} <br />
                    and <br />
                    {nextStop.name}
                    {transfer && (
                      <div
                        style={{
                          marginTop: 8,
                          color: "#fff",
                          fontWeight: 600,
                          background: "#f59e42",
                          borderRadius: 8,
                          padding: "10px 12px",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                          border: "2px solid #e67e22",
                          textAlign: "center",
                        }}
                      >
                        Get off at bus stop <b>{transfer.Transfer1}</b> and take
                        the bus at <b>{transfer.Transfer2}</b> to continue your
                        route.
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Transfer Info Button */}
      {route && route.length > 1 && transferMessage && (
        <div className="absolute left-1/2 -translate-x-1/2 top-4 z-50">
          <button
            className="bg-yellow-200 text-black px-6 py-3 rounded shadow-lg font-semibold border border-yellow-400 hover:bg-yellow-300 transition"
            onClick={() => setShowTransferPopup(true)}
          >
            {transferMessage}
          </button>
        </div>
      )}
      {/* Transfer Info Popup */}
      {showTransferPopup && (
        <Popup
          position={route[1] ? [route[1].lat, route[1].lon] : center}
          onClose={() => setShowTransferPopup(false)}
        >
          <div>
            <strong>Transfer Info</strong>
            <div>{transferMessage}</div>
            <button
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => setShowTransferPopup(false)}
            >
              Close
            </button>
          </div>
        </Popup>
      )}

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
          route={routeProp}
          getRouteNumberForSegment={getRouteNumberForSegment}
        />
      </BottomSheet>
    </div>
  );
}
