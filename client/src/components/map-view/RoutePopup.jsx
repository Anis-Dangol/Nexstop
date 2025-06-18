import { Popup } from "react-leaflet";

export default function RoutePopup({ start, end, position }) {
return (
    <Popup position={position}>
        <div>
            <strong>Route Info:</strong>
            <div><strong style={{ color: "green" }}>Start:</strong> {start}</div>
            <div><strong style={{ color: "red" }}>Destination:</strong> {end}</div>
        </div>
    </Popup>
);
}
