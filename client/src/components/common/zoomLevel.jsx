import { useMap } from "react-leaflet";
import { useEffect, useState } from "react";

export function ZoomLevelTracker({ onZoomChange }) {
  const map = useMap();

  useEffect(() => {
    const handleZoom = () => {
      onZoomChange(map.getZoom());
    };

    map.on("zoomend", handleZoom);

    // initial zoom
    onZoomChange(map.getZoom());

    return () => {
      map.off("zoomend", handleZoom);
    };
  }, [map, onZoomChange]);

  return null; // this component doesn't render anything
}
