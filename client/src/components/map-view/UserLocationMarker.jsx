// Component for user location

// components/map-view/UserLocationMarker.jsx
import { Marker, Popup } from "react-leaflet";

export default function UserLocationMarker({ position }) {
  if (!position) return null;

  return (
    <Marker position={position}>
      <Popup>Your location</Popup>
    </Marker>
  );
}
