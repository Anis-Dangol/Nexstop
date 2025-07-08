import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { fetchTransfers } from "../../services/transfers";

export default function ClientMenuItems({
  setOpen,
  start,
  setStart,
  end,
  setEnd,
  history,
  setHistory,
  setRoute,
  allStops,
  addToFavourites,
  routesData = [],
  routesLoading = false,
}) {
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  const [isToggleOn, setIsToggleOn] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [nearestStop, setNearestStop] = useState(null);
  const [transferData, setTransferData] = useState([]);
  const startRef = useRef();
  const endRef = useRef();

  // Load transfer data from MongoDB
  useEffect(() => {
    const loadTransferData = async () => {
      try {
        const transfers = await fetchTransfers();
        setTransferData(transfers);
      } catch (error) {
        console.error("Error loading transfer data:", error);
        setTransferData([]);
      }
    };
    loadTransferData();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (startRef.current && !startRef.current.contains(e.target)) {
        setStartSuggestions([]);
      }
      if (endRef.current && !endRef.current.contains(e.target)) {
        setEndSuggestions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleStartChange = (e) => {
    const value = e.target.value;
    setStart(value);
    setStartSuggestions(
      allStops.filter((stop) =>
        stop.name.toLowerCase().includes(value.toLowerCase())
      )
    );
  };
  const handleEndChange = (e) => {
    const value = e.target.value;
    setEnd(value);
    setEndSuggestions(
      allStops.filter((stop) =>
        stop.name.toLowerCase().includes(value.toLowerCase())
      )
    );
  };
  const handleSuggestionClick = (type, suggestion) => {
    if (type === "start") {
      setStart(suggestion);
      setStartSuggestions([]);
    }
    if (type === "end") {
      setEnd(suggestion);
      setEndSuggestions([]);
    }
  };
  const handleSubmit = (e, customStart, customEnd) => {
    if (e) e.preventDefault();
    const s = customStart !== undefined ? customStart : start;
    const d = customEnd !== undefined ? customEnd : end;
    const trimmedStart = s.trim();
    const trimmedEnd = d.trim();
    if (!trimmedStart || !trimmedEnd) return;

    let foundRoute = null;

    // First, try to find a direct route
    for (const route of routesData) {
      const stops = route.stops;
      const startIndex = stops.findIndex(
        (stop) => stop.name.toLowerCase() === trimmedStart.toLowerCase()
      );
      const endIndex = stops.findIndex(
        (stop) => stop.name.toLowerCase() === trimmedEnd.toLowerCase()
      );

      if (startIndex !== -1 && endIndex !== -1) {
        // Check for direct route (forward direction)
        if (startIndex < endIndex) {
          foundRoute = stops.slice(startIndex, endIndex + 1);
          console.log(
            `Direct route found: ${foundRoute.map((s) => s.name).join(" → ")}`
          );
          break;
        }
        // Check for circular route (wrap around)
        else if (startIndex > endIndex) {
          // For circular routes, check if the route loops back to the starting point
          const firstStop = stops[0];
          const lastStop = stops[stops.length - 1];

          // Check if it's a circular route (first and last stops are the same or very close)
          const isCircular =
            firstStop.name.toLowerCase() === lastStop.name.toLowerCase() ||
            (Math.abs(firstStop.lat - lastStop.lat) < 0.001 &&
              Math.abs(firstStop.lon - lastStop.lon) < 0.001);

          if (isCircular) {
            // Create circular route: from start to end of array, then from beginning to end index
            foundRoute = [
              ...stops.slice(startIndex), // From start to end of route
              ...stops.slice(1, endIndex + 1), // From beginning to destination (skip first to avoid duplicate)
            ];
            console.log(
              `Circular route found: ${foundRoute
                .map((s) => s.name)
                .join(" → ")}`
            );
            break;
          }
        }
      }
    }

    // If no direct route found, try to find route with transfers
    if (!foundRoute) {
      foundRoute = findRouteWithTransfers(trimmedStart, trimmedEnd);
    }

    // Last resort: create simple route if both stops exist
    if (!foundRoute) {
      const all = allStops;
      const startStop = all.find(
        (stop) => stop.name.toLowerCase() === trimmedStart.toLowerCase()
      );
      const endStop = all.find(
        (stop) => stop.name.toLowerCase() === trimmedEnd.toLowerCase()
      );
      if (startStop && endStop) foundRoute = [startStop, endStop];
    }

    if (!foundRoute) {
      toast({
        title: "No route found",
        description: `No route found between '${trimmedStart}' and '${trimmedEnd}'. Please check your input or try different stops.`,
        variant: "destructive",
      });
      setStart("");
      setEnd("");
      if (typeof setRoute === "function") setRoute([]);
      if (window.clearMapSelectedStops) window.clearMapSelectedStops();
      // Clear nearest stop marker when route is cleared
      if (window.removeNearestStopMarker) {
        window.removeNearestStopMarker();
      }
      return;
    }

    if (typeof setRoute === "function") {
      console.log("ClientMenuItems: Setting route:", foundRoute || []);
      // Force a new array reference to ensure React detects the change
      setRoute(foundRoute ? [...foundRoute] : []);
    }
    const newEntry = `${trimmedStart} → ${trimmedEnd}`;
    if (!history.some((h) => h.toLowerCase() === newEntry.toLowerCase())) {
      setHistory([newEntry, ...history]);
    }
    setOpen(false);
  };
  const handleHistoryClick = (item) => {
    const [s, d] = item.split(" → ");
    setStart(s);
    setEnd(d);
    handleSubmit(null, s, d);
  };
  const handleDeleteHistory = (idx) => {
    const newHistory = history.filter((_, i) => i !== idx);
    setHistory(newHistory);
  };

  // Helper function to get all stops
  const getAllStops = () => {
    return allStops;
  };

  // Function to find route with transfers using MongoDB data
  const findRouteWithTransfers = (startName, endName) => {
    // Try to find if there's a transfer route
    for (const transfer of transferData) {
      // Check if we need to go from start to transfer point 1, then transfer point 1 to transfer point 2, then to destination
      const route1 = findDirectRoute(startName, transfer.transfer1);
      const route2 = findDirectRoute(transfer.transfer2, endName);

      if (route1 && route2) {
        // Combine routes: start -> Transfer1, Transfer1 -> Transfer2 (transfer), Transfer2 -> end
        const transferConnection =
          findDirectRoute(transfer.transfer1, transfer.transfer2) ||
          [getAllStops().find((s) => s.name === transfer.transfer2)].filter(
            Boolean
          );
        const combinedRoute = [
          ...route1,
          ...transferConnection.slice(1), // Remove duplicate transfer point
          ...route2.slice(1), // Remove duplicate transfer point
        ];
        console.log(
          `Transfer route found via ${transfer.transfer1} -> ${transfer.transfer2}`
        );
        return combinedRoute.filter(Boolean); // Remove any null/undefined stops
      }

      // Also try the reverse: start -> transfer2, transfer2 -> transfer1, transfer1 -> end
      const route3 = findDirectRoute(startName, transfer.transfer2);
      const route4 = findDirectRoute(transfer.transfer1, endName);

      if (route3 && route4) {
        const transferConnection =
          findDirectRoute(transfer.transfer2, transfer.transfer1) ||
          [getAllStops().find((s) => s.name === transfer.transfer1)].filter(
            Boolean
          );
        const combinedRoute = [
          ...route3,
          ...transferConnection.slice(1),
          ...route4.slice(1),
        ];
        console.log(
          `Transfer route found via ${transfer.transfer2} -> ${transfer.transfer1}`
        );
        return combinedRoute.filter(Boolean);
      }
    }

    return null;
  };

  // Helper function to find direct route between two stops
  const findDirectRoute = (startName, endName) => {
    for (const route of routesData) {
      const stops = route.stops;
      const startIndex = stops.findIndex(
        (stop) => stop.name.toLowerCase() === startName.toLowerCase()
      );
      const endIndex = stops.findIndex(
        (stop) => stop.name.toLowerCase() === endName.toLowerCase()
      );

      if (startIndex !== -1 && endIndex !== -1) {
        // Check for direct route (forward direction)
        if (startIndex < endIndex) {
          return stops.slice(startIndex, endIndex + 1);
        }
        // Check for circular route (wrap around)
        else if (startIndex > endIndex) {
          // Check if it's a circular route
          const firstStop = stops[0];
          const lastStop = stops[stops.length - 1];

          const isCircular =
            firstStop.name.toLowerCase() === lastStop.name.toLowerCase() ||
            (Math.abs(firstStop.lat - lastStop.lat) < 0.001 &&
              Math.abs(firstStop.lon - lastStop.lon) < 0.001);

          if (isCircular) {
            // Create circular route
            return [
              ...stops.slice(startIndex), // From start to end of route
              ...stops.slice(1, endIndex + 1), // From beginning to destination
            ];
          }
        }
      }
    }
    return null;
  };

  // Function to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  };

  // Function to find nearest bus stop that has route to destination
  const findNearestBusStop = (userLat, userLon, destinationName = null) => {
    let nearest = null;
    let minDistance = Infinity;

    // Filter stops that have routes to the destination (if destination is provided)
    const candidateStops = destinationName
      ? allStops.filter((stop) => {
          // Exclude the destination stop itself
          if (stop.name.toLowerCase() === destinationName.toLowerCase()) {
            return false;
          }
          // Check if there's a route from this stop to the destination
          return routesData.some((route) => {
            const stops = route.stops;
            const startIndex = stops.findIndex(
              (s) => s.name.toLowerCase() === stop.name.toLowerCase()
            );
            const endIndex = stops.findIndex(
              (s) => s.name.toLowerCase() === destinationName.toLowerCase()
            );

            if (startIndex !== -1 && endIndex !== -1) {
              // Check forward direction
              if (startIndex < endIndex) {
                return true;
              }
              // Check circular route
              else if (startIndex > endIndex) {
                const firstStop = stops[0];
                const lastStop = stops[stops.length - 1];
                const isCircular =
                  firstStop.name.toLowerCase() ===
                    lastStop.name.toLowerCase() ||
                  (Math.abs(firstStop.lat - lastStop.lat) < 0.001 &&
                    Math.abs(firstStop.lon - lastStop.lon) < 0.001);
                return isCircular;
              }
            }
            return false;
          });
        })
      : allStops;

    // Debug logging
    console.log(`Finding nearest stop for destination: ${destinationName}`);
    console.log(`User location: ${userLat}, ${userLon}`);
    console.log(`Candidate stops count: ${candidateStops.length}`);
    console.log(`Destination "${destinationName}" excluded from candidates`);

    candidateStops.forEach((stop) => {
      const distance = calculateDistance(userLat, userLon, stop.lat, stop.lon);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = stop;
      }
      // Debug: Log distances for key stops
      if (
        stop.name.toLowerCase().includes("ratna") ||
        stop.name.toLowerCase().includes("balkhu") ||
        stop.name.toLowerCase().includes("new")
      ) {
        console.log(`${stop.name}: distance = ${distance.toFixed(4)}km`);
      }
    });

    console.log(
      `Nearest stop found: ${nearest?.name} at ${minDistance.toFixed(4)}km`
    );
    return nearest;
  };

  // Function to get user location and find nearest stop
  const getUserLocationAndNearestStop = () => {
    // Static fallback location (Your specific location)
    const fallbackLocation = {
      latitude: 27.686262,
      longitude: 85.303635,
    };

    const processLocation = (latitude, longitude, isFromGPS = true) => {
      setUserLocation({ lat: latitude, lon: longitude });

      // Pass destination to filter nearest stops
      const destinationName = end.trim();
      const nearest = findNearestBusStop(
        latitude,
        longitude,
        destinationName || null
      );

      if (nearest) {
        setNearestStop(nearest);
        setStart(nearest.name);

        // Add red marker to map if window function exists
        if (window.addNearestStopMarker) {
          window.addNearestStopMarker(nearest);
        }

        // Show toast to inform user about location source
        if (!isFromGPS) {
          toast({
            title: "Using default location",
            description:
              "GPS not available. Using your static location to find nearest stop.",
            variant: "default",
          });
        }
      } else if (destinationName) {
        // If no stop found with route to destination, show message
        toast({
          title: "No suitable stop found",
          description: `No nearby bus stops have routes to "${destinationName}". Please select destination first or choose manually.`,
          variant: "destructive",
        });
        setIsToggleOn(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          processLocation(latitude, longitude, true);
        },
        (error) => {
          console.error("Error getting GPS location:", error);
          // Use fallback location instead of showing error
          processLocation(
            fallbackLocation.latitude,
            fallbackLocation.longitude,
            false
          );
        },
        {
          timeout: 10000, // 10 second timeout
          enableHighAccuracy: true,
          maximumAge: 60000, // 1 minute cache
        }
      );
    } else {
      // Geolocation not supported, use fallback location
      processLocation(
        fallbackLocation.latitude,
        fallbackLocation.longitude,
        false
      );
    }
  };

  // Handle toggle change
  const handleToggleChange = () => {
    const newToggleState = !isToggleOn;

    if (newToggleState) {
      // Check if destination is provided
      const destinationName = end.trim();
      if (!destinationName) {
        toast({
          title: "Please select destination first",
          description:
            "To find the best starting point, please enter your destination before enabling auto-detect.",
          variant: "destructive",
        });
        return;
      }

      setIsToggleOn(newToggleState);
      // Toggle is turned ON - get location and nearest stop
      getUserLocationAndNearestStop();
    } else {
      setIsToggleOn(newToggleState);
      // Toggle is turned OFF - clear location data and marker
      setUserLocation(null);
      setNearestStop(null);
      setStart("");

      // Remove red marker from map if window function exists
      if (window.removeNearestStopMarker) {
        window.removeNearestStopMarker();
      }
    }
  };

  useEffect(() => {
    if (isToggleOn) {
      getUserLocationAndNearestStop();
    }
  }, [isToggleOn]);

  // Re-detect nearest stop when destination changes while toggle is on
  useEffect(() => {
    if (isToggleOn && end.trim()) {
      getUserLocationAndNearestStop();
    }
  }, [end, isToggleOn]);

  return (
    <nav className="flex-col flex gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {/* Toggle Button */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Route Search</span>
          <button
            type="button"
            onClick={handleToggleChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isToggleOn ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isToggleOn ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="relative" ref={startRef}>
          <input
            id="start-input"
            type="text"
            className={`w-full border rounded px-2 py-1 ${
              isToggleOn ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            placeholder={
              isToggleOn
                ? "Nearest bus stop (auto-detected)"
                : "Starting location"
            }
            value={
              isToggleOn
                ? nearestStop
                  ? nearestStop.name
                  : "Finding nearest stop..."
                : start
            }
            onChange={handleStartChange}
            autoComplete="off"
            disabled={isToggleOn}
          />
          {startSuggestions.length > 0 && (
            <ul
              className="absolute bg-white border rounded w-full mt-1 max-h-40 overflow-y-auto z-10"
              style={{ top: "100%" }}
            >
              {startSuggestions.map((suggestion, idx) => (
                <li
                  key={idx}
                  className="p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() =>
                    handleSuggestionClick("start", suggestion.name)
                  }
                >
                  {suggestion.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="relative" ref={endRef}>
          <input
            id="end-input"
            type="text"
            className="w-full border rounded px-2 py-1"
            placeholder="Destination"
            value={end}
            onChange={handleEndChange}
            autoComplete="off"
          />
          {endSuggestions.length > 0 && (
            <ul className="absolute bg-white border rounded w-full mt-1 max-h-40 overflow-y-auto">
              {endSuggestions.map((suggestion, idx) => (
                <li
                  key={idx}
                  className="p-2 cursor-pointer hover:bg-gray-200"
                  onClick={() => handleSuggestionClick("end", suggestion.name)}
                >
                  {suggestion.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex gap-2">
          <Button type="submit" variant="default" className="w-full">
            Get Route
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full bg-[#0F172A] text-white hover:bg-[#1E293B] hover:text-white"
            onClick={() => {
              const trimmedStart = start.trim();
              const trimmedEnd = end.trim();
              if (!trimmedStart || !trimmedEnd) return;
              const newEntry = `${trimmedStart} → ${trimmedEnd}`;
              if (addToFavourites) {
                addToFavourites(newEntry);
                toast({ title: "Route Added" });
              }
            }}
            disabled={!start || !end}
          >
            Add Route
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full mt-2"
          onClick={() => {
            setStart("");
            setEnd("");
            if (typeof setRoute === "function") setRoute([]);
            // Clear nearest stop marker when route is cleared
            if (window.removeNearestStopMarker) {
              window.removeNearestStopMarker();
            }
          }}
          disabled={!start && !end}
        >
          Clear
        </Button>
      </form>
      {history.length > 0 && (
        <div className="mt-4">
          <div className="font-bold mb-2 flex items-center justify-between">
            <span>History</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-red-500 hover:text-red-700 px-2 py-0"
              onClick={() => setHistory([])}
              title="Clear History"
            >
              Clear All
            </Button>
          </div>
          <ul className="space-y-1 max-h-60 overflow-y-auto pr-1">
            {history.map((item, idx) => (
              <li
                key={idx}
                className="flex items-center text-sm bg-gray-100 rounded px-2 py-1 cursor-pointer hover:bg-blue-200"
              >
                <span
                  className="flex-1"
                  onClick={() => handleHistoryClick(item)}
                >
                  {item}
                </span>
                <button
                  className="ml-2 text-red-500 hover:text-red-700 font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteHistory(idx);
                  }}
                  title="Delete"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
