import React from "react";
import { useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function AdminDashboard() {
  const [userLocation, setUserLocation] = useState(null);

  const fetchApi = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api");
      console.log(response.data);
    } catch (err) {
      console.error("API Error:", err.message);
    }
  };

  const position = userLocation || [27.686262, 85.303635];

  return (
    <div className="relative h-screen w-screen">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        className="h-screen w-full z-0"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <Marker position={position}>
          <Popup>Your location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default AdminDashboard;
