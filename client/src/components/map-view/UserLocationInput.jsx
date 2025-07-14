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

  const handleSave = () => {
    console.log(
      "UserLocationInput: Attempting to save - lat:",
      lat,
      "lon:",
      lon
    );

    if (!lat || !lon) {
      alert("Please enter both latitude and longitude");
      return;
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || isNaN(longitude)) {
      alert("Please enter valid numeric coordinates");
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

    console.log("UserLocationInput: Saving location:", [latitude, longitude]);
    onLocationSet([latitude, longitude]);
    onClose();
  };

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

  // Advanced GPS function with multiple attempts
  const getHighAccuracyLocation = () => {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 5; // Increased attempts
      let bestLocation = null;
      let bestAccuracy = Infinity;
      const seenLocations = new Set(); // Track duplicate locations

      const tryGetLocation = () => {
        attempts++;
        console.log(
          `UserLocationInput: GPS attempt ${attempts}/${maxAttempts}`
        );

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy, timestamp } =
              position.coords;
            const locationKey = `${latitude.toFixed(6)},${longitude.toFixed(
              6
            )}`;

            console.log(
              `UserLocationInput: GPS attempt ${attempts} - lat: ${latitude}, lon: ${longitude}, accuracy: ${accuracy}m`
            );

            // Check for duplicate/cached locations
            if (seenLocations.has(locationKey) && attempts > 1) {
              console.warn(
                `UserLocationInput: Duplicate location detected (${locationKey}), might be cached`
              );
            }
            seenLocations.add(locationKey);

            // Check if location is too old (cached)
            const locationAge = Date.now() - timestamp;
            if (locationAge > 60000) {
              // More than 1 minute old
              console.warn(
                `UserLocationInput: Location is ${Math.round(
                  locationAge / 1000
                )}s old, might be cached`
              );
            }

            // Keep the most accurate location that's not too old
            if (accuracy < bestAccuracy && locationAge < 120000) {
              // Less than 2 minutes old
              bestAccuracy = accuracy;
              bestLocation = { latitude, longitude, accuracy, timestamp };
            }

            // If we have good accuracy or reached max attempts, resolve
            if (accuracy < 15 || attempts >= maxAttempts) {
              if (bestLocation) {
                resolve(bestLocation);
              } else {
                resolve({ latitude, longitude, accuracy, timestamp });
              }
            } else {
              // Try again for better accuracy with increasing delays
              const delay = attempts * 1500; // Progressive delay: 1.5s, 3s, 4.5s...
              setTimeout(tryGetLocation, delay);
            }
          },
          (error) => {
            console.error(
              `UserLocationInput: GPS attempt ${attempts} failed:`,
              error.message
            );
            if (attempts >= maxAttempts) {
              reject(error);
            } else {
              // Try again with exponential backoff
              const delay = Math.pow(2, attempts) * 1000;
              setTimeout(tryGetLocation, delay);
            }
          },
          {
            enableHighAccuracy: true,
            timeout: 15000, // Increased timeout
            maximumAge: 0, // Force fresh location
          }
        );
      };

      tryGetLocation();
    });
  };

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    console.log("UserLocationInput: Advanced GPS request initiated");

    // Clear any browser location cache first
    if ("permissions" in navigator) {
      try {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        });
        console.log(
          "UserLocationInput: Geolocation permission status:",
          permission.state
        );
      } catch (e) {
        console.log("UserLocationInput: Could not check permission status");
      }
    }

    if (navigator.geolocation) {
      try {
        const location = await getHighAccuracyLocation();
        const { latitude, longitude, accuracy, timestamp } = location;

        console.log(
          "UserLocationInput: Final GPS result - lat:",
          latitude,
          "lon:",
          longitude,
          "accuracy:",
          accuracy,
          "timestamp:",
          new Date(timestamp)
        );

        // Check if the location is too old (more than 5 minutes)
        const locationAge = Date.now() - timestamp;
        if (locationAge > 300000) {
          // 5 minutes in milliseconds
          console.warn(
            "UserLocationInput: GPS location is old:",
            locationAge / 1000,
            "seconds"
          );
        }

        // Validate coordinates are reasonable for your region
        // Nepal coordinates roughly: lat 26-31, lon 80-89
        const isValidNepalLocation =
          latitude >= 26 &&
          latitude <= 31 &&
          longitude >= 80 &&
          longitude <= 89;
        if (!isValidNepalLocation) {
          console.warn(
            `UserLocationInput: Location ${latitude}, ${longitude} seems outside Nepal region`
          );
        }

        // Check if this exact location was used before (indicating cache)
        const locationString = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
        const lastKnownLocation = localStorage.getItem("lastGPSLocation");
        if (lastKnownLocation === locationString) {
          console.warn(
            "UserLocationInput: This exact location was returned before - might be cached"
          );
        }
        localStorage.setItem("lastGPSLocation", locationString);

        setLat(latitude.toFixed(6));
        setLon(longitude.toFixed(6));
        setIsGettingLocation(false);
        onLocationSet([latitude, longitude]);

        // Show accuracy information to user
        const accuracyMessage =
          accuracy < 10
            ? "Excellent accuracy"
            : accuracy < 20
            ? "Very good accuracy"
            : accuracy < 50
            ? "Good accuracy"
            : accuracy < 100
            ? "Fair accuracy"
            : "Poor accuracy";

        console.log(
          "UserLocationInput: GPS accuracy:",
          accuracyMessage,
          "±",
          accuracy,
          "meters"
        );

        // Show detailed feedback for poor accuracy or cached locations
        if (
          accuracy > 100 ||
          locationAge > 60000 ||
          lastKnownLocation === locationString
        ) {
          let warningMessage = `Location obtained with ${accuracyMessage} (±${accuracy}m).`;

          if (locationAge > 60000) {
            warningMessage += ` Location is ${Math.round(
              locationAge / 1000
            )}s old.`;
          }

          if (lastKnownLocation === locationString) {
            warningMessage += " Same location as before - might be cached.";
          }

          warningMessage +=
            " You may want to try again for better accuracy or move to an area with better GPS signal.";

          alert(warningMessage);
        }

        // Close the modal after setting GPS location
        onClose();
      } catch (error) {
        console.error("UserLocationInput: Advanced GPS failed:", error);
        setIsGettingLocation(false);
        let errorMessage = "Unable to get your location. ";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage +=
              "Location access denied. Please enable location permissions in your browser settings and try again.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage +=
              "Location information unavailable. Please try again or enter coordinates manually.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out. Please try again.";
            break;
          default:
            errorMessage += "An unknown error occurred. Please try again.";
            break;
        }

        alert(errorMessage);

        // Keep the modal open so user can try again or enter manually
        // Don't close the modal on error
      }
    } else {
      setIsGettingLocation(false);
      alert(
        "Geolocation is not supported by this browser. Please enter coordinates manually."
      );
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
              disabled={isMapClickMode || isGettingLocation}
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
              {isGettingLocation ? "Getting GPS..." : "Use GPS"}
            </button>
          </div>

          {/* Clear Cache Button */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                localStorage.removeItem("lastGPSLocation");
                console.log("UserLocationInput: GPS location cache cleared");
                alert(
                  "Location cache cleared! Try GPS again for a fresh location."
                );
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
              disabled={isGettingLocation || isMapClickMode}
            >
              <span className="text-xs">🔄</span>
              Clear Cache
            </button>

            <button
              onClick={() => {
                setLat("");
                setLon("");
                console.log("UserLocationInput: Location fields cleared");
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors"
              disabled={isGettingLocation || isMapClickMode}
            >
              <X size={14} />
              Clear Fields
            </button>
          </div>

          {/* GPS Status Information */}
          {isGettingLocation && (
            <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-md border border-orange-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span>Getting high-accuracy GPS location...</span>
              </div>
              <div className="mt-1 text-xs text-orange-500">
                This may take up to 30 seconds for best accuracy
              </div>
            </div>
          )}

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
