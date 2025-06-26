import { Marker, Popup } from "react-leaflet";

export default function UserLocationMarker({ position }) {
  if (!position) return null;

  return (
    <Marker position={position}>
      <Popup>Your location</Popup>
    </Marker>
  );
}
