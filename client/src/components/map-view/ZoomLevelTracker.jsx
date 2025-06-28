import { useMap } from "react-leaflet";
import { useEffect } from "react";

export default function ZoomLevelTracker({ onZoomChange }) {
  const map = useMap();

  useEffect(() => {
    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };

    map.on("zoomend", handleZoom);
    onZoomChange(map.getZoom()); // initial zoom

    return () => {
      map.off("zoomend", handleZoom);
    };
  }, [map, onZoomChange]);

  return null;
}
