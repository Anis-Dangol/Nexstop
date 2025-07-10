import { Marker, Popup } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";

// Custom user location icon
const userLocationIcon = L.divIcon({
  className: "user-location-marker",
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background: #4F46E5;
      border: 4px solid white;
      border-radius: 50%;
      box-shadow: 0 4px 16px rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: white;
      font-weight: bold;
      position: relative;
      z-index: 999999;
    ">
      📍
    </div>
  `,
});

export default function UserLocationMarker({
  position,
  isCustomLocation = false,
}) {
  const [currentPosition, setCurrentPosition] = useState(null);

  // Update position when prop changes
  useEffect(() => {
    if (position && Array.isArray(position) && position.length === 2) {
      const lat = parseFloat(position[0]);
      const lng = parseFloat(position[1]);

      if (!isNaN(lat) && !isNaN(lng)) {
        setCurrentPosition([lat, lng]);
      }
    }
  }, [position]);

  // Don't render if no valid position
  if (!currentPosition) return null;

  return (
    <Marker
      key={`user-location-${currentPosition[0]}-${currentPosition[1]}-${isCustomLocation}`}
      position={currentPosition}
      icon={userLocationIcon}
      zIndexOffset={999999}
      pane="overlayPane"
      interactive={true}
    >
      <Popup>
        <div className="text-center">
          <div className="font-semibold text-blue-600">
            {isCustomLocation ? "Custom Location" : "Your Location"}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Lat: {currentPosition[0].toFixed(6)}
            <br />
            Lon: {currentPosition[1].toFixed(6)}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
