import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import transferData from "../../assets/transfer.json";
import { getRouteNumberForSegment } from "../../utils/mapUtils";

export default function RouteMarkers({ routeProp, predefinedRoutes }) {
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
          (t) => t.Transfer1 === stop.name && t.Transfer2 === nextStop.name
        );

        return (
          <Marker
            key={"mid-" + idx}
            position={[midLat, midLon]}
            icon={L.divIcon({
              className: "route-number-marker",
              iconSize: [24, 24],
              html: transfer
                ? `<div style='background:#f59e42;color:#fff;border-radius:50%;padding:6px 8px;border:2px solid #e67e22;font-size:14px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.12);'>T</div>`
                : `<div style='background:#fff;border-radius:12px;padding:2px 6px;border:1px solid #0074D9;font-size:12px;'>${routeNumberDisplay}</div>`,
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
                {transfer && (
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
                    Get off at bus stop <b>{transfer.Transfer1}</b> and take the
                    bus at <b>{transfer.Transfer2}</b> to continue your route.
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
}
