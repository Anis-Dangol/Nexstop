import { Popup } from "react-leaflet";

export default function RoutePopup({ start, end, position, transferMessage }) {
  return (
    <Popup position={position}>
      <div>
        <strong>Route Info:</strong>
        <div>
          <strong style={{ color: "green" }}>Start:</strong> {start}
        </div>
        <div>
          <strong style={{ color: "red" }}>Destination:</strong> {end}
        </div>
        {transferMessage && (
          <div style={{ marginTop: 8 }}>
            <button
              style={{
                background: "#ffe066",
                color: "#333",
                border: "none",
                borderRadius: 4,
                padding: "6px 12px",
                cursor: "pointer",
                fontWeight: 600,
              }}
              onClick={() => alert(transferMessage)}
            >
              Show Transfer Info
            </button>
          </div>
        )}
      </div>
    </Popup>
  );
}
