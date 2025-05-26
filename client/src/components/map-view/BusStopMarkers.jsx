// Component for bus stop markers (shown on zoom)

// components/map-view/BusStopMarkers.jsx
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Bus stop icon
const busStopIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/6686/6686693.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

export default function BusStopMarkers({ busStops, show }) {
  if (!show) return null;

  return (
    <>
      {busStops.map((stop, idx) => (
        <Marker
          key={idx}
          position={[stop.latitude, stop.longitude]}
          icon={busStopIcon}
        >
          <Popup>{stop.name}</Popup>
        </Marker>
      ))}
    </>
  );
}
