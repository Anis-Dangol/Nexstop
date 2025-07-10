import React, { useState, useEffect } from "react";
import { MapPin, X, Navigation } from "lucide-react";

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
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (currentLocation) {
      setLat(currentLocation[0].toString());
      setLon(currentLocation[1].toString());
    }
  }, [currentLocation]);

  // Listen for map click location updates
  useEffect(() => {
    const originalHandler = window.setUserLocationFromMap;
    if (originalHandler) {
      window.setUserLocationFromMap = (latlng) => {
        setLat(latlng.lat.toFixed(6));
        setLon(latlng.lng.toFixed(6));
        setIsMapClickMode(false);
        onLocationSet([latlng.lat, latlng.lng]);
        window.setUserLocationFromMap = null;
      };
    }
    return () => {
      if (
        window.setUserLocationFromMap &&
        window.setUserLocationFromMap !== originalHandler
      ) {
        window.setUserLocationFromMap = null;
      }
    };
  }, [onLocationSet]);

  const handleSave = () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      alert("Please enter valid coordinates");
      return;
    }

    if (latitude < -90 || latitude > 90) {
      alert("Latitude must be between -90 and 90");
      return;
    }

    if (longitude < -180 || longitude > 180) {
      alert("Longitude must be between -180 and 180");
      return;
    }

    onLocationSet([latitude, longitude]);
    onClose();
  };

  const handleMapClick = () => {
    if (startMapPickMode) {
      // Use the new approach - pass a callback to handle the location
      startMapPickMode((location) => {
        setLat(location[0].toFixed(6));
        setLon(location[1].toFixed(6));
        onLocationSet(location);
        // Reopen the modal to show the filled coordinates
        setTimeout(() => {
          // The modal will reopen automatically when location is set
        }, 100);
      });
      // Close the modal temporarily while picking
      onClose();
    } else {
      // Fallback to the old approach
      setIsMapClickMode(true);
      window.setUserLocationFromMap = (latlng) => {
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

  const handleGetCurrentLocation = () => {
    setIsGettingLocation(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLat(latitude.toFixed(6));
          setLon(longitude.toFixed(6));
          setIsGettingLocation(false);
          onLocationSet([latitude, longitude]);
          // Close the modal after setting GPS location
          onClose();
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsGettingLocation(false);
          let errorMessage = "Unable to get your location. ";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage +=
                "Location access denied. Please enable location permissions.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage += "Location request timed out.";
              break;
            default:
              errorMessage += "An unknown error occurred.";
              break;
          }

          alert(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    } else {
      setIsGettingLocation(false);
      alert("Geolocation is not supported by this browser.");
    }
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
              disabled={isMapClickMode || isGettingLocation}
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
              disabled={isMapClickMode || isGettingLocation}
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

            <button
              onClick={handleGetCurrentLocation}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                isGettingLocation
                  ? "bg-orange-500 text-white cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
              disabled={isGettingLocation || isMapClickMode}
            >
              <Navigation size={16} />
              {isGettingLocation ? "Getting..." : "Use GPS"}
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
              onClick={handleSave}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isMapClickMode || isGettingLocation}
            >
              Save Location
            </button>
            <button
              onClick={handleClose}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
