import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";
import { fetchTransfers } from "../../services/transfer/transfers";
import { calculateDistance } from "../../services/distance/distanceService";

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
  isToggleOn, // Receive from props
  setIsToggleOn, // Receive from props
  customUserLocation, // Add custom user location prop
  userRole, // Add user role prop
}) {
  const [startSuggestions, setStartSuggestions] = useState([]);
  const [endSuggestions, setEndSuggestions] = useState([]);
  // Remove local toggle state since it's now coming from props
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
    let routeInfo = null; // Add route info to track route details

    // Use optimal route finding when toggle is ON, otherwise use traditional method
    if (isToggleOn) {
      foundRoute = findOptimalRoute(trimmedStart, trimmedEnd);
      if (foundRoute) {
        console.log("Using optimal route finding algorithm");
      }
    } else {
      // Traditional route finding logic
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
            routeInfo = route; // Store route info
            // Only show route number for admin users
            if (userRole === "admin") {
              console.log(
                `Direct route found: ${foundRoute
                  .map((s) => s.name)
                  .join(" → ")} (Route: ${route.routeNumber || "N/A"})`
              );
            } else {
              console.log(
                `Direct route found: ${foundRoute
                  .map((s) => s.name)
                  .join(" → ")}`
              );
            }
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
              routeInfo = route; // Store route info
              // Only show route number for admin users
              if (userRole === "admin") {
                console.log(
                  `Circular route found: ${foundRoute
                    .map((s) => s.name)
                    .join(" → ")} (Route: ${route.routeNumber || "N/A"})`
                );
              } else {
                console.log(
                  `Circular route found: ${foundRoute
                    .map((s) => s.name)
                    .join(" → ")}`
                );
              }
              break;
            }
          }
        }
      }

      // If no direct route found, try to find route with transfers
      if (!foundRoute) {
        foundRoute = findRouteWithTransfers(trimmedStart, trimmedEnd);
      }
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

    // Show route number popup only for admin users
    if (userRole === "admin" && routeInfo && window.showRouteNumberPopup) {
      window.showRouteNumberPopup(routeInfo);
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

  // Enhanced function to find optimal nearest bus stop considering destination
  const findOptimalNearestBusStop = (
    userLat,
    userLon,
    destinationName = null
  ) => {
    if (!destinationName) {
      // If no destination, fall back to regular nearest stop
      return findNearestBusStop(userLat, userLon, destinationName);
    }

    console.log(
      `Finding optimal nearest stop for destination: ${destinationName}`
    );
    console.log(`User location: ${userLat}, ${userLon}`);

    // Find all stops that have routes to the destination
    const candidateStops = allStops.filter((stop) => {
      // Exclude the destination stop itself
      if (stop.name.toLowerCase() === destinationName.toLowerCase()) {
        return false;
      }

      // Check if there's any route from this stop to the destination
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
          if (startIndex < endIndex) return true;

          // Check circular route
          if (startIndex > endIndex) {
            const firstStop = stops[0];
            const lastStop = stops[stops.length - 1];
            return (
              firstStop.name.toLowerCase() === lastStop.name.toLowerCase() ||
              (Math.abs(firstStop.lat - lastStop.lat) < 0.001 &&
                Math.abs(firstStop.lon - lastStop.lon) < 0.001)
            );
          }
        }
        return false;
      });
    });

    console.log(
      `Found ${candidateStops.length} candidate stops with routes to destination`
    );

    // Evaluate each candidate stop and calculate optimal score
    const stopEvaluations = candidateStops.map((stop) => {
      const distanceToStop = calculateDistance(
        userLat,
        userLon,
        stop.lat,
        stop.lon
      );

      // Find the best route from this stop to destination using our optimal algorithm
      const routeFromStop = findOptimalRoute(stop.name, destinationName);

      let routeDistance = 0;
      let routeTime = 0;
      let transfers = 0;

      if (routeFromStop && routeFromStop.length > 1) {
        routeDistance = calculateRouteDistance(routeFromStop);

        // Determine if this route has transfers by checking if it uses transfer points
        const hasTransfer = transferData.some((transfer) =>
          routeFromStop.some(
            (stop) =>
              stop.name.toLowerCase() === transfer.transfer1.toLowerCase() ||
              stop.name.toLowerCase() === transfer.transfer2.toLowerCase()
          )
        );

        routeTime = calculateRouteTime(routeFromStop, hasTransfer);
        transfers = hasTransfer ? 1 : 0;
      } else {
        // Fallback: direct distance if no route found
        routeDistance = calculateDistance(
          stop.lat,
          stop.lon,
          allStops.find(
            (s) => s.name.toLowerCase() === destinationName.toLowerCase()
          )?.lat || 0,
          allStops.find(
            (s) => s.name.toLowerCase() === destinationName.toLowerCase()
          )?.lon || 0
        );
        routeTime = (routeDistance / 20) * 60; // Basic time estimation
        transfers = 0;
      }

      // Calculate optimization score (lower is better)
      // Factors: walking distance (40%), route time (40%), transfers (20%)
      const walkingTime = (distanceToStop / 5) * 60; // 5 km/h walking speed
      const totalTime = walkingTime + routeTime;
      const transferPenalty = transfers * 15; // 15 minutes penalty per transfer

      const optimizationScore =
        distanceToStop * 0.4 + totalTime * 0.004 + transferPenalty * 0.2;

      return {
        stop,
        distanceToStop,
        routeDistance,
        totalTime,
        transfers,
        optimizationScore,
        walkingTime,
      };
    });

    // Sort by optimization score (lower is better)
    stopEvaluations.sort((a, b) => a.optimizationScore - b.optimizationScore);

    // Log detailed analysis for admin users
    if (userRole === "admin" && stopEvaluations.length > 0) {
      console.log("=== OPTIMAL NEAREST STOP ANALYSIS ===");
      console.log(
        `Evaluating ${stopEvaluations.length} stops with routes to ${destinationName}:`
      );
      stopEvaluations.slice(0, 5).forEach((evaluation, index) => {
        console.log(`${index + 1}. ${evaluation.stop.name}:
          Walking: ${evaluation.walkingTime.toFixed(
            1
          )}min (${evaluation.distanceToStop.toFixed(3)}km)
          Route: ${evaluation.totalTime.toFixed(1)}min total
          Transfers: ${evaluation.transfers}
          Score: ${evaluation.optimizationScore.toFixed(3)}`);
      });
      console.log(`Selected optimal stop: ${stopEvaluations[0].stop.name}`);
    }

    // Show optimization info to user
    if (stopEvaluations.length > 1) {
      const optimal = stopEvaluations[0];
      toast({
        title: "Optimal Start Location Found",
        description: `Selected ${
          optimal.stop.name
        } (${optimal.walkingTime.toFixed(
          1
        )}min walk, ${optimal.totalTime.toFixed(1)}min total trip, ${
          optimal.transfers
        } transfers)`,
        variant: "default",
      });
    }

    return stopEvaluations.length > 0 ? stopEvaluations[0].stop : null;
  };

  // Function to get user location and find nearest stop
  const getUserLocationAndNearestStop = () => {
    // Check if custom user location is available first
    if (
      customUserLocation &&
      Array.isArray(customUserLocation) &&
      customUserLocation.length === 2
    ) {
      const [lat, lng] = customUserLocation;
      const processCustomLocation = (latitude, longitude) => {
        setUserLocation({ lat: latitude, lon: longitude });

        // Pass destination to find optimal nearest stop when toggle is on
        const destinationName = end.trim();
        const nearest =
          isToggleOn && destinationName
            ? findOptimalNearestBusStop(latitude, longitude, destinationName)
            : findNearestBusStop(latitude, longitude, destinationName || null);

        if (nearest) {
          setNearestStop(nearest);
          setStart(nearest.name);

          // Add red marker to map if window function exists
          if (window.addNearestStopMarker) {
            window.addNearestStopMarker(nearest);
          }

          // Show toast to inform user about location source
          toast({
            title: "Using your custom location",
            description: `Found nearest stop: ${nearest.name}`,
            variant: "default",
          });
        } else {
          // If no stop found, show message
          toast({
            title: "No bus stops found",
            description: "No bus stops found near your location.",
            variant: "destructive",
          });
          setIsToggleOn(false);
        }
      };

      processCustomLocation(lat, lng);
      return;
    }

    // Fall back to GPS or static location if no custom location
    const fallbackLocation = {
      latitude: 27.686262,
      longitude: 85.303635,
    };

    const processLocation = (latitude, longitude, isFromGPS = true) => {
      setUserLocation({ lat: latitude, lon: longitude });

      // Pass destination to find optimal nearest stop when toggle is on
      const destinationName = end.trim();
      const nearest =
        isToggleOn && destinationName
          ? findOptimalNearestBusStop(latitude, longitude, destinationName)
          : findNearestBusStop(latitude, longitude, destinationName || null);

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
        } else {
          toast({
            title: "Using GPS location",
            description: `Found nearest stop: ${nearest.name}`,
            variant: "default",
          });
        }
      } else {
        // If no stop found, show message
        toast({
          title: "No bus stops found",
          description: "No bus stops found near your location.",
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
  }, [isToggleOn, customUserLocation]); // Add customUserLocation as dependency

  // Re-detect nearest stop when destination changes while toggle is on
  useEffect(() => {
    if (isToggleOn && end.trim()) {
      getUserLocationAndNearestStop();
    }
  }, [end, isToggleOn, customUserLocation]); // Add customUserLocation as dependency

  // Function to calculate route distance (total distance of all stops in route)
  const calculateRouteDistance = (route) => {
    if (!route || route.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 0; i < route.length - 1; i++) {
      totalDistance += calculateDistance(
        route[i].lat,
        route[i].lon,
        route[i + 1].lat,
        route[i + 1].lon
      );
    }
    return totalDistance;
  };

  // Function to calculate total travel time estimation
  const calculateRouteTime = (route, hasTransfer = false) => {
    if (!route || route.length < 2) return 0;

    const distance = calculateRouteDistance(route);
    const avgSpeed = 20; // km/h average bus speed
    const baseTime = (distance / avgSpeed) * 60; // Convert to minutes

    // Add waiting time for each stop (average 2 minutes per stop)
    const stopWaitTime = (route.length - 1) * 2;

    // Add transfer penalty if applicable (10 minutes for transfer)
    const transferPenalty = hasTransfer ? 10 : 0;

    return baseTime + stopWaitTime + transferPenalty;
  };

  // Enhanced optimal route finding function
  const findOptimalRoute = (startName, endName) => {
    const routes = [];

    // 1. Find all possible direct routes
    routesData.forEach((route) => {
      const directRoute = findDirectRouteFromData(startName, endName, route);
      if (directRoute) {
        routes.push({
          route: directRoute,
          type: "direct",
          distance: calculateRouteDistance(directRoute),
          estimatedTime: calculateRouteTime(directRoute, false),
          transfers: 0,
          routeNumbers: [route.routeNumber || "N/A"],
        });
      }
    });

    // 2. Find all possible circular routes
    routesData.forEach((route) => {
      const circularRoute = findCircularRouteFromData(
        startName,
        endName,
        route
      );
      if (circularRoute) {
        routes.push({
          route: circularRoute,
          type: "circular",
          distance: calculateRouteDistance(circularRoute),
          estimatedTime: calculateRouteTime(circularRoute, false),
          transfers: 0,
          routeNumbers: [route.routeNumber || "N/A"],
        });
      }
    });

    // 3. Find all possible transfer routes
    transferData.forEach((transfer) => {
      // Try route1: start → transfer1, transfer2 → end
      const route1 = findDirectRoute(startName, transfer.transfer1);
      const route2 = findDirectRoute(transfer.transfer2, endName);

      if (route1 && route2) {
        const transferConnection =
          findDirectRoute(transfer.transfer1, transfer.transfer2) ||
          [getAllStops().find((s) => s.name === transfer.transfer2)].filter(
            Boolean
          );

        const combinedRoute = [
          ...route1,
          ...transferConnection.slice(1),
          ...route2.slice(1),
        ].filter(Boolean);

        routes.push({
          route: combinedRoute,
          type: "transfer",
          distance: calculateRouteDistance(combinedRoute),
          estimatedTime: calculateRouteTime(combinedRoute, true),
          transfers: 1,
          transferPoints: [transfer.transfer1, transfer.transfer2],
          routeNumbers: ["Mixed Routes"],
        });
      }

      // Try reverse: start → transfer2, transfer1 → end
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
        ].filter(Boolean);

        routes.push({
          route: combinedRoute,
          type: "transfer",
          distance: calculateRouteDistance(combinedRoute),
          estimatedTime: calculateRouteTime(combinedRoute, true),
          transfers: 1,
          transferPoints: [transfer.transfer2, transfer.transfer1],
          routeNumbers: ["Mixed Routes"],
        });
      }
    });

    // 4. Sort routes by optimization criteria when toggle is ON
    if (isToggleOn && routes.length > 1) {
      // Optimal sorting: prioritize by transfers (fewer better), then by time, then by distance
      routes.sort((a, b) => {
        // First priority: fewer transfers
        if (a.transfers !== b.transfers) {
          return a.transfers - b.transfers;
        }
        // Second priority: shorter time
        if (Math.abs(a.estimatedTime - b.estimatedTime) > 2) {
          // 2 minute tolerance
          return a.estimatedTime - b.estimatedTime;
        }
        // Third priority: shorter distance
        return a.distance - b.distance;
      });

      // Log optimal route selection for admin users
      if (userRole === "admin") {
        console.log("=== OPTIMAL ROUTE ANALYSIS ===");
        console.log(`Found ${routes.length} possible routes:`);
        routes.forEach((r, index) => {
          console.log(`Route ${index + 1} (${r.type}): 
            Distance: ${r.distance.toFixed(2)}km, 
            Time: ${r.estimatedTime.toFixed(1)}min, 
            Transfers: ${r.transfers},
            Route Numbers: ${r.routeNumbers.join(", ")}`);
        });
        console.log(
          `Selected optimal route: ${routes[0].type} with ${routes[0].transfers} transfers`
        );
      }

      // Show optimization info to user
      if (routes.length > 1) {
        const optimalRoute = routes[0];
        toast({
          title: "Optimal Route Selected",
          description: `Found ${routes.length} routes. Selected ${
            optimalRoute.type
          } route (${optimalRoute.estimatedTime.toFixed(
            1
          )}min, ${optimalRoute.distance.toFixed(1)}km, ${
            optimalRoute.transfers
          } transfers)`,
          variant: "default",
        });
      }
    }

    return routes.length > 0 ? routes[0].route : null;
  };

  // Helper function to find direct route from specific route data
  const findDirectRouteFromData = (startName, endName, routeData) => {
    const stops = routeData.stops;
    const startIndex = stops.findIndex(
      (stop) => stop.name.toLowerCase() === startName.toLowerCase()
    );
    const endIndex = stops.findIndex(
      (stop) => stop.name.toLowerCase() === endName.toLowerCase()
    );

    if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
      return stops.slice(startIndex, endIndex + 1);
    }
    return null;
  };

  // Helper function to find circular route from specific route data
  const findCircularRouteFromData = (startName, endName, routeData) => {
    const stops = routeData.stops;
    const startIndex = stops.findIndex(
      (stop) => stop.name.toLowerCase() === startName.toLowerCase()
    );
    const endIndex = stops.findIndex(
      (stop) => stop.name.toLowerCase() === endName.toLowerCase()
    );

    if (startIndex !== -1 && endIndex !== -1 && startIndex > endIndex) {
      const firstStop = stops[0];
      const lastStop = stops[stops.length - 1];

      const isCircular =
        firstStop.name.toLowerCase() === lastStop.name.toLowerCase() ||
        (Math.abs(firstStop.lat - lastStop.lat) < 0.001 &&
          Math.abs(firstStop.lon - lastStop.lon) < 0.001);

      if (isCircular) {
        return [...stops.slice(startIndex), ...stops.slice(1, endIndex + 1)];
      }
    }
    return null;
  };

  // Original function for backward compatibility
  const findNearestBusStop = (userLat, userLon, destinationName = null) => {
    let nearest = null;
    let minDistance = Infinity;

    // Filter stops that have routes to the destination (if destination is provided)
    // If no destination, use all stops
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
      : allStops; // Use all stops if no destination specified

    candidateStops.forEach((stop) => {
      const distance = calculateDistance(userLat, userLon, stop.lat, stop.lon);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = stop;
      }
    });

    return nearest;
  };

  return (
    <nav className="flex-col flex gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {/* Toggle Button */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <span className="text-sm font-medium">On For Nearest BusStop</span>
          </div>
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
        <div className="">
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
