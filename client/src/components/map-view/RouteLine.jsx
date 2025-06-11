// components/map-view/RouteLine.jsx
import { Polyline, Popup } from "react-leaflet";

export default function RouteLine({ route, userLocation }) {
  if (!route || route.length < 1) return null;

  const positions = [];

  // Add user location to beginning of line if it's available
  if (userLocation) {
    positions.push(userLocation);
  }

  // Add each stop from the route
  positions.push(...route.map((stop) => [stop.lat, stop.lon]));

  const startName = route[0]?.name || "Start";
  const endName = route[route.length - 1]?.name || "Destination";

  return (
    <Polyline positions={positions} color="blue" weight={6}>
      <Popup>{`${startName} to ${endName}`}</Popup>
    </Polyline>
  );
}
