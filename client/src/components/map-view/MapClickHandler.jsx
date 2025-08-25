import { useMapEvents } from "react-leaflet";

export default function MapClickHandler({ onLocationSet, isMapPickMode }) {
  useMapEvents({
    click(e) {
      console.log(
        "MapClickHandler: Map clicked at",
        e.latlng,
        "isMapPickMode:",
        isMapPickMode
      );

      // Use the new approach - check if we're in map pick mode
      if (isMapPickMode && onLocationSet) {
        const location = [e.latlng.lat, e.latlng.lng];
        console.log(
          "MapClickHandler: Setting location via new approach:",
          location
        );
        onLocationSet(location);
      } else if (window.setUserLocationFromMap) {
        // Fallback to old approach for backward compatibility
        const location = [e.latlng.lat, e.latlng.lng];
        console.log(
          "MapClickHandler: Setting location via window callback:",
          location
        );
        window.setUserLocationFromMap(e.latlng);
        if (onLocationSet) {
          onLocationSet(location);
        }
      } else {
        console.log("MapClickHandler: No location handler available");
      }
    },
  });

  return null;
}
