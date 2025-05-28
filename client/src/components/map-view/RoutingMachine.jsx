import { useMap } from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

export default function RoutingMachine({ userLocation, stop }) {
  const map = useMap();

  useEffect(() => {
    if (!userLocation || !stop) return;
    console.log("RoutingMachine userLocation:", userLocation, "stop:", stop);

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        L.latLng(stop.latitude, stop.longitude),
      ],
      lineOptions: {
        styles: [{ color: "red", weight: 6, dashArray: "5,10" }],
      },
      createMarker: () => null,
      routeWhileDragging: false,
      draggableWaypoints: false,
      addWaypoints: false,
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
    });

    routingControl.addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, userLocation, stop]);

  return null;
}
