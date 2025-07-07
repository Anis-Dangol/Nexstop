import transferData from "../../assets/transfer.json";

export default function FavouriteMenu({
  favourites,
  setFavourites,
  removeFromFavourites,
  setStart,
  setEnd,
  setRoute,
  setOpen,
  isLoading,
  routesData = [],
  routesLoading = false,
}) {
  const handleDeleteFavourite = (idx) => {
    const routeToDelete = favourites[idx];
    if (removeFromFavourites) {
      // Use the API-aware remove function
      removeFromFavourites(routeToDelete);
    } else {
      // Fallback to old method
      setFavourites(favourites.filter((_, i) => i !== idx));
    }
  };
  // Helper function to get all stops
  const getAllStops = () => {
    const stopSet = new Set();
    const stops = [];
    routesData.forEach((route) => {
      route.stops.forEach((stop) => {
        const key = `${stop.lat},${stop.lon}`;
        if (!stopSet.has(key)) {
          stopSet.add(key);
          stops.push(stop);
        }
      });
    });
    return stops;
  };

  // Function to find route with transfers using transfer.json data
  const findRouteWithTransfers = (startName, endName) => {
    // Try to find if there's a transfer route
    for (const transfer of transferData) {
      // Check if we need to go from start to transfer point 1, then transfer point 1 to transfer point 2, then to destination
      const route1 = findDirectRoute(startName, transfer.Transfer1);
      const route2 = findDirectRoute(transfer.Transfer2, endName);

      if (route1 && route2) {
        // Combine routes: start -> Transfer1, Transfer1 -> Transfer2 (transfer), Transfer2 -> end
        const transferConnection =
          findDirectRoute(transfer.Transfer1, transfer.Transfer2) ||
          [getAllStops().find((s) => s.name === transfer.Transfer2)].filter(
            Boolean
          );
        const combinedRoute = [
          ...route1,
          ...transferConnection.slice(1), // Remove duplicate transfer point
          ...route2.slice(1), // Remove duplicate transfer point
        ];
        console.log(
          `Transfer route found via ${transfer.Transfer1} -> ${transfer.Transfer2}`
        );
        return combinedRoute.filter(Boolean); // Remove any null/undefined stops
      }

      // Also try the reverse: start -> Transfer2, Transfer2 -> Transfer1, Transfer1 -> end
      const route3 = findDirectRoute(startName, transfer.Transfer2);
      const route4 = findDirectRoute(transfer.Transfer1, endName);

      if (route3 && route4) {
        const transferConnection =
          findDirectRoute(transfer.Transfer2, transfer.Transfer1) ||
          [getAllStops().find((s) => s.name === transfer.Transfer1)].filter(
            Boolean
          );
        const combinedRoute = [
          ...route3,
          ...transferConnection.slice(1),
          ...route4.slice(1),
        ];
        console.log(
          `Transfer route found via ${transfer.Transfer2} -> ${transfer.Transfer1}`
        );
        return combinedRoute.filter(Boolean);
      }
    }

    return null;
  };

  // Helper function to find direct route between two stops (supports circular routes)
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
            // Create circular route: from start to end of array, then from beginning to end index
            return [
              ...stops.slice(startIndex), // From start to end of route
              ...stops.slice(1, endIndex + 1), // From beginning to destination (skip first to avoid duplicate)
            ];
          }
        }
      }
    }
    return null;
  };

  const handleFavouriteClick = (item) => {
    const [s, d] = item.split(" → ");
    if (setStart) setStart(s);
    if (setEnd) setEnd(d);
    if (setRoute) {
      const trimmedStart = s.trim();
      const trimmedEnd = d.trim();

      // First, try to find a direct route using the improved logic
      let foundRoute = findDirectRoute(trimmedStart, trimmedEnd);

      // If no direct route found, try to find route with transfers
      if (!foundRoute) {
        foundRoute = findRouteWithTransfers(trimmedStart, trimmedEnd);
      }

      // Last resort: create simple route if both stops exist
      if (!foundRoute) {
        const all = getAllStops();
        const startStop = all.find(
          (stop) => stop.name.toLowerCase() === trimmedStart.toLowerCase()
        );
        const endStop = all.find(
          (stop) => stop.name.toLowerCase() === trimmedEnd.toLowerCase()
        );
        if (startStop && endStop) foundRoute = [startStop, endStop];
      }

      setRoute(foundRoute || []);
    }
    // Close sidebar after route selection (like the search functionality)
    if (setOpen) setOpen(false);
  };

  return (
    <div className="flex-col flex gap-4">
      <div className="font-bold text-lg">Favourites</div>
      <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="text-center text-gray-500 py-4">
            Loading favourites...
          </div>
        ) : favourites.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            No favourites yet. Add some routes to favourites.
          </div>
        ) : (
          favourites.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-gray-100 rounded px-3 py-2 cursor-pointer hover:bg-blue-200"
              onClick={() => handleFavouriteClick(item)}
            >
              <div className="flex-1">{item}</div>
              <button
                className="ml-2 text-red-500 hover:text-red-700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFavourite(idx);
                }}
                title="Remove from favourites"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
