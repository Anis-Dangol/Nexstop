// MapContainerWrapper.jsx
import { useState, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import UserLocationMarker from "./UserLocationMarker";
import BusStopMarkers from "./BusStopMarkers";
import ZoomLevelTracker from "./ZoomLevelTracker";
import RouteLine from "./RouteLine";
import BottomSheet from "./BottomSheet";
import { ListPlus, HandCoins, BusFront, Bookmark } from "lucide-react";

export default function MapContainerWrapper({ route, setRoute, triggerOpenBottomSheet }) {
  const [userLocation, setUserLocation] = useState(null);
  const [busStops, setBusStops] = useState([]);
  const [zoom, setZoom] = useState(13);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("fare");
  const [fareData, setFareData] = useState(null);

  // Effect: Open BottomSheet when triggered externally
  useEffect(() => {
    if (triggerOpenBottomSheet) {
      openBottomSheet("fare");
    }
  }, [triggerOpenBottomSheet]);

  // Effect: Open BottomSheet when route changes (if a route exists)
  useEffect(() => {
    if (route && route.length > 1) {
      openBottomSheet("fare");
    }
  }, [route]);

  // Load bus stops and user location
  useEffect(() => {
    fetch("/busstops.json")
      .then((res) => res.json())
      .then((data) => setBusStops(data))
      .catch((err) => console.error("Error loading bus stops:", err));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
      },
      (err) => console.error("Geolocation error:", err)
    );
  }, []);

  // Fetch fare data only when route changes, not on every open/close
  useEffect(() => {
    if (route && route.length > 1) {
      const start = route[0].name;
      const end = route[route.length - 1].name;
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
  }, [route]);

  const openBottomSheet = (tab = "fare") => {
    setIsBottomSheetOpen(true);
    setActiveTab(tab);
  };

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
        <BusStopMarkers busStops={busStops} show={zoom >= 11} />
        {route && route.length > 0 && (
          <RouteLine route={route} userLocation={center} />
        )}
      </MapContainer>

      GET ROUTES BUTTON
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
            <button
              className={`flex flex-col items-center focus:outline-none ${
                activeTab === "favorites" ? "text-blue-600" : "text-gray-600"
              }`}
              onClick={() => setActiveTab("favorites")}
            >
              <Bookmark size={24} />
              <span className="text-xs mt-1">Favorites</span>
            </button>
          </div>
          {activeTab === "fare" && (
            <div>
              <h2 className="text-lg font-bold">Fare Estimation</h2>
              {fareData ? (
                <>
                  <p>Fare: Rs {fareData.fare}</p>
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
          {activeTab === "favorites" && (
            <div>
              <h2 className="text-lg font-bold">Favorites</h2>
              <p>Your favorite routes or stops go here.</p>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
}
