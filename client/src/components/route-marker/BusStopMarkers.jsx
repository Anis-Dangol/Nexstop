/* eslint-disable no-unused-vars */
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useRef } from "react";
import { toast } from "@/components/ui/use-toast";

// Bus stop icon
const busStopIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/128/8059/8059045.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

export default function BusStopMarkers({
  busStops,
  routesData = [], // Add routesData prop
  show,
  onStopClick,
  onSetStart,
  onSetEnd,
}) {
  if (!show) return null;

  // Helper function to get route numbers for a bus stop
  const getRouteNumbersForStop = (stopName, stopLat, stopLon) => {
    const routes = [];
    routesData.forEach((route) => {
      const hasStop = route.stops.some(
        (stop) =>
          stop.name === stopName &&
          Math.abs(stop.lat - stopLat) < 0.0001 &&
          Math.abs(stop.lon - stopLon) < 0.0001
      );
      if (hasStop) {
        routes.push(route.routeNumber);
      }
    });
    return routes;
  };

  // Helper to close popup after click
  function handleSet(type, stopName, markerRef) {
    if (type === "start" && onSetStart) onSetStart(stopName);
    if (type === "end" && onSetEnd) onSetEnd(stopName);
    if (type === "start")
      toast({ title: `${stopName} added as start location` });
    if (type === "end") toast({ title: `${stopName} added as destination` });
    if (markerRef && markerRef.current) {
      markerRef.current.closePopup();
    }
  }

  return (
    <>
      {busStops.map((stop, idx) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const markerRef = useRef();
        const routeNumbers = getRouteNumbersForStop(
          stop.name,
          stop.lat,
          stop.lon
        );

        return (
          <Marker
            key={idx}
            position={[stop.lat, stop.lon]}
            icon={busStopIcon}
            eventHandlers={{
              click: () => onStopClick && onStopClick(stop),
            }}
            ref={markerRef}
          >
            <Popup>
              <div style={{ minWidth: 120, textAlign: "center" }}>
                <div style={{ fontWeight: "bold", marginBottom: 10 }}>
                  {stop.name}
                </div>
                <div style={{ display: "flex", width: "100%" }}>
                  <button
                    style={{
                      flex: 1,
                      background: "limegreen",
                      color: "black",
                      fontWeight: "bold",
                      fontSize: 15,
                      border: "none",
                      borderRadius: 10,
                      cursor: "pointer",
                      padding: 2,
                      marginRight: 10,
                    }}
                    onClick={() => handleSet("start", stop.name, markerRef)}
                  >
                    START
                  </button>
                  <button
                    style={{
                      flex: 1,
                      background: "red",
                      color: "black",
                      fontWeight: "bold",
                      fontSize: 15,
                      border: "none",
                      borderRadius: 10,
                      cursor: "pointer",
                      padding: 2,
                    }}
                    onClick={() => handleSet("end", stop.name, markerRef)}
                  >
                    END
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
