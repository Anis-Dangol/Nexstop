import { useMapEvents } from "react-leaflet";

export default function MapClickHandler({ onLocationSet, isMapPickMode }) {
  useMapEvents({
    click(e) {
      // Use the new approach - check if we're in map pick mode
      if (isMapPickMode && onLocationSet) {
        const location = [e.latlng.lat, e.latlng.lng];
        onLocationSet(location);
      } else if (window.setUserLocationFromMap) {
        // Fallback to old approach for backward compatibility
        const location = [e.latlng.lat, e.latlng.lng];
        window.setUserLocationFromMap(e.latlng);
        if (onLocationSet) {
          onLocationSet(location);
        }
      }
    },
  });

  return null;
}
