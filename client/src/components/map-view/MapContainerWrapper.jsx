// MapContainerWrapper.jsx
import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import UserLocationMarker from "./UserLocationMarker";
import BusStopMarkers from "./BusStopMarkers";
import ZoomLevelTracker from "./ZoomLevelTracker";
import BottomSheet from "./BottomSheet";
import { ListPlus, HandCoins, BusFront } from "lucide-react";
import routesData from "../../assets/routes.json";

export default function MapContainerWrapper({
  route: routeProp,
  triggerOpenBottomSheet,
}) {
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

  // Effect: Open BottomSheet when triggered externally
  useEffect(() => {
    if (triggerOpenBottomSheet) {
      openBottomSheet("fare");
    }
  }, [triggerOpenBottomSheet]);

  // Effect: Open BottomSheet when route changes (if a route exists)
  useEffect(() => {
    if (routeProp && routeProp.length > 1) {
      openBottomSheet("fare");
    }
  }, [routeProp]);

  // Load user location only (removed bus stops fetch)
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
      },
      (err) => console.error("Geolocation error:", err)
    );
  }, []);

  // Load routes and extract unique stops
  useEffect(() => {
    // Load routes from assets
    setPredefinedRoutes(routesData);
    // Extract unique stops
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

  // Fetch fare data only when route changes, not on every open/close
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
      setFareData(null); // Clear fareData if route is cleared
    }
  }, [routeProp]);

  // Fetch OpenRouteService API route when routeProp changes (sidebar selection)
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
    // eslint-disable-next-line
  }, [routeProp]);

  const openBottomSheet = (tab = "fare") => {
    setIsBottomSheetOpen(true);
    setActiveTab(tab);
  };

  // Handle stop marker click
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

  // Find route subset between two stops and draw API route
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
        // Fetch and draw API route
        const stopsToSend = foundRoute || [selectedStops[0], selectedStops[1]];
        const coords = await fetchRouteFromAPI(stopsToSend);
        setApiRouteCoords(coords);
      } else {
        setRoute([]);
        setApiRouteCoords([]);
      }
    }
    handleRoute();
    // eslint-disable-next-line
  }, [selectedStops, predefinedRoutes]);

  // Fetch route from OpenRouteService API
  async function fetchRouteFromAPI(stops) {
    const url =
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson";
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Authorization:
            "5b3ce3597851110001cf62489be549b1f66e4cfeb86481900984eab5", // Replace with a valid key
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coordinates: stops.map((stop) => [stop.lon, stop.lat]),
        }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      return data.features[0].geometry.coordinates.map(([lon, lat]) => [
        lat,
        lon,
      ]);
    } catch (err) {
      console.error("Error fetching route:", err);
      return [];
    }
  }

  const center = [27.686262, 85.303635];

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
        <BusStopMarkers busStops={allStops} show={zoom >= 11} />
        {/* Draw API route polyline if available */}
        {apiRouteCoords.length > 1 && (
          <Polyline positions={apiRouteCoords} color="blue" weight={6} />
        )}
        {/* Removed RouteLine for straight line */}
      </MapContainer>

      {/* GET ROUTES BUTTON */}
      <button
        onClick={() => openBottomSheet("fare")}
        className="fixed bottom-5 right-4 bg-white px-4 py-2 rounded-full shadow-lg"
      >
        <ListPlus size={24} className="text-gray-600" />
      </button>

      {/* Bottom Sheet */}
      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
      >
        <div>
          <div className="flex justify-around items-center border-t border-gray-200 py-2 mb-4">
            <button
              className={`flex flex-col items-center focus:outline-none ${
                activeTab === "fare" ? "text-blue-600" : "text-gray-600"
              }`}
              onClick={() => setActiveTab("fare")}
            >
              <HandCoins size={24} />
              <span className="text-xs mt-1">Fare</span>
            </button>
            <button
              className={`flex flex-col items-center focus:outline-none ${
                activeTab === "bus" ? "text-blue-600" : "text-gray-600"
              }`}
              onClick={() => setActiveTab("bus")}
            >
              <BusFront size={24} />
              <span className="text-xs mt-1">Buses</span>
            </button>
          </div>
          {activeTab === "fare" && (
            <div>
              <h2 className="text-lg font-bold">Fare Estimation</h2>
              {fareData ? (
                <>
                  <p>Fare: ₹ {fareData.fare}</p>
                  <p>Distance: {fareData.totalDistance} km</p>
                </>
              ) : (
                <p className="text-gray-500">No fare data available.</p>
              )}
            </div>
          )}
          {activeTab === "bus" && (
            <div>
              <h2 className="text-lg font-bold">Bus Info</h2>
              <p>Bus details go here.</p>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
