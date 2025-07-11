import { Marker, Popup } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import { fetchTransfers } from "../../services/transfers";
import { getRouteNumberForSegment } from "../../utils/mapUtils";

export default function RouteMarkers({
  routeProp,
  predefinedRoutes,
  userRole,
}) {
  const [transferData, setTransferData] = useState([]);

  // Load transfer data from MongoDB
  useEffect(() => {
    const loadTransferData = async () => {
      try {
        const transfers = await fetchTransfers();
        setTransferData(transfers);
      } catch (error) {
        console.error("Error loading transfer data:", error);
        setTransferData([]);
      }
    };
    loadTransferData();
  }, []);

  if (!routeProp || routeProp.length < 2) return null;

  return (
    <>
      {routeProp.slice(0, -1).map((stop, idx) => {
        const nextStop = routeProp[idx + 1];
        const midLat = (stop.lat + nextStop.lat) / 2;
        const midLon = (stop.lon + nextStop.lon) / 2;

        // Use robust segment route number
        const routeNumbers =
          getRouteNumberForSegment(stop, nextStop, predefinedRoutes) || "N/A";

        // Format for display: join if array, else show as is
        const routeNumberDisplay = Array.isArray(routeNumbers)
          ? routeNumbers.join(", ")
          : routeNumbers;

        // Check for transfer
        const transfer = transferData.find(
          (t) => t.transfer1 === stop.name && t.transfer2 === nextStop.name
        );

        // For transfer markers, show for all users
        if (transfer) {
          return (
            <Marker
              key={"transfer-" + idx}
              position={[midLat, midLon]}
              icon={L.divIcon({
                className: "route-number-marker",
                iconSize: [24, 24],
                html: `<div style='background:#f59e42;color:#fff;border-radius:50%;padding:6px 8px;border:2px solid #e67e22;font-size:14px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.12);'>T</div>`,
              })}
            >
              <Popup>
                <div>
                  {userRole === "admin" && (
                    <div style={{ marginBottom: 8, textAlign: "center" }}>
                      <strong>Transfer Points:</strong>
                      <br />
                      From: <b>{transfer.transfer1}</b>
                      <br />
                      To: <b>{transfer.transfer2}</b>
                    </div>
                  )}
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
                    Get off at bus stop <b>{transfer.transfer1}</b> and take the
                    bus at <b>{transfer.transfer2}</b> to continue your route.
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        }

        // For route markers, only show for admin users
        if (userRole === "admin") {
          return (
            <Marker
              key={"route-" + idx}
              position={[midLat, midLon]}
              icon={L.divIcon({
                className: "route-number-marker",
                iconSize: [24, 24],
                html: `<div style='background:#fff;border-radius:12px;padding:2px 6px;border:1px solid #0074D9;font-size:12px;'>${routeNumberDisplay}</div>`,
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
                </div>
              </Popup>
            </Marker>
          );
        }

        // For non-admin users, return null (no marker at all)
        return null;
      })}
    </>
  );
}
