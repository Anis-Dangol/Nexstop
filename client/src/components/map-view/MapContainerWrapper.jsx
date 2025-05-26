// Main Map wrapper

// components/map-view/MapContainerWrapper.jsx
import { useState, useEffect } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import UserLocationMarker from "./UserLocationMarker";
import BusStopMarkers from "./BusStopMarkers";
import ZoomLevelTracker from "./ZoomLevelTracker";

export default function MapContainerWrapper() {
  const [userLocation, setUserLocation] = useState(null);
  const [busStops, setBusStops] = useState([]);
  const [zoom, setZoom] = useState(13);

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

  const center = userLocation || [27.686262, 85.303635];

  return (
    <div className="relative h-screen w-screen">
      <MapContainer center={center} zoom={13} scrollWheelZoom className="h-screen w-full z-0">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <ZoomLevelTracker onZoomChange={setZoom} />
        <UserLocationMarker position={center} />
        <BusStopMarkers busStops={busStops} show={zoom >= 11} /> {/* Show bus stops only if zoom level is 15 or higher */}
      </MapContainer>
    </div>
  );
}
