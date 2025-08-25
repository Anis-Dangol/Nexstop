import React, { useState, useEffect } from "react";
import { MapPin, X } from "lucide-react";

export default function UserLocationInput({
  isOpen,
  onClose,
  onLocationSet,
  currentLocation,
  startMapPickMode,
}) {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [isMapClickMode, setIsMapClickMode] = useState(false);

  // Initialize with current location when modal opens
  useEffect(() => {
    if (isOpen && currentLocation) {
      console.log(
        "UserLocationInput: Modal opened with current location:",
        currentLocation
      );
      setLat(currentLocation[0].toString());
      setLon(currentLocation[1].toString());
    } else if (isOpen && !currentLocation) {
      console.log(
        "UserLocationInput: Modal opened without current location, clearing fields"
      );
      setLat("");
      setLon("");
    }
  }, [isOpen, currentLocation]);

  useEffect(() => {
    if (currentLocation) {
      console.log(
        "UserLocationInput: Setting current location:",
        currentLocation
      );
      setLat(currentLocation[0].toString());
      setLon(currentLocation[1].toString());
    } else {
      console.log("UserLocationInput: No current location provided");
    }
  }, [currentLocation]);

  // Debug state changes
  useEffect(() => {
    console.log("UserLocationInput: State updated - lat:", lat, "lon:", lon);
  }, [lat, lon]);

  // Listen for map click location updates
  useEffect(() => {
    const originalHandler = window.setUserLocationFromMap;

    const mapClickHandler = (latlng) => {
      console.log("UserLocationInput: Window callback received:", latlng);
      setLat(latlng.lat.toFixed(6));
      setLon(latlng.lng.toFixed(6));
      setIsMapClickMode(false);
      onLocationSet([latlng.lat, latlng.lng]);
      window.setUserLocationFromMap = null;
      // Don't close modal here - let the user see the coordinates and save manually
    };

    if (isMapClickMode) {
      window.setUserLocationFromMap = mapClickHandler;
    }

    return () => {
      if (
        window.setUserLocationFromMap &&
        window.setUserLocationFromMap !== originalHandler
      ) {
        window.setUserLocationFromMap = originalHandler;
      }
    };
  }, [isMapClickMode, onLocationSet]);

  const handleMapClick = () => {
    if (startMapPickMode) {
      console.log("UserLocationInput: Starting map pick mode");
      // Use the new approach - pass a callback to handle the location
      startMapPickMode((location) => {
        console.log("UserLocationInput: Map location picked:", location);
        setLat(location[0].toFixed(6));
        setLon(location[1].toFixed(6));
        onLocationSet(location);
      });
      // Close the modal temporarily while picking
      onClose();
    } else {
      // Fallback to the old approach
      console.log("UserLocationInput: Using fallback map click approach");
      setIsMapClickMode(true);
      window.setUserLocationFromMap = (latlng) => {
        console.log("UserLocationInput: Window callback received:", latlng);
        setLat(latlng.lat.toFixed(6));
        setLon(latlng.lng.toFixed(6));
        setIsMapClickMode(false);
        onLocationSet([latlng.lat, latlng.lng]);
        window.setUserLocationFromMap = null;
      };
      onClose();
    }
  };

  const handleClose = () => {
    setIsMapClickMode(false);
    window.setUserLocationFromMap = null;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 relative">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <MapPin size={20} className="text-blue-500" />
            Enter User Location
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Latitude:
            </label>
            <input
              type="number"
              step="any"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="27.7172"
              disabled={isMapClickMode}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Longitude:
            </label>
            <input
              type="number"
              step="any"
              value={lon}
              onChange={(e) => setLon(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="85.3240"
              disabled={isMapClickMode}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleMapClick}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                isMapClickMode
                  ? "bg-green-500 text-white cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
              disabled={isMapClickMode}
            >
              <MapPin size={16} />
              {isMapClickMode ? "Click on Map..." : "Pick from Map"}
            </button>
          </div>

          {isMapClickMode && (
            <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md border border-blue-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                Click anywhere on the map to set your location
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleClose}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
