import { useState, useEffect } from "react";
import { fetchTransfers } from "../../services/transfers";

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
}) {
  const [transferData, setTransferData] = useState([]);

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

  const handleDeleteFavourite = (idx) => {
    const routeToDelete = favourites[idx];
    if (removeFromFavourites) {
      removeFromFavourites(routeToDelete);
    } else {
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
    for (const transfer of transferData) {
      // Check route: start -> transfer1 -> transfer2 -> end
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
        ];
        return combinedRoute.filter(Boolean);
      }

      // Check route: start -> transfer2 -> transfer1 -> end
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
        if (startIndex < endIndex) {
          return stops.slice(startIndex, endIndex + 1);
        } else if (startIndex > endIndex) {
          // Check if it's a circular route
          const firstStop = stops[0];
          const lastStop = stops[stops.length - 1];
          const isCircular =
            firstStop.name.toLowerCase() === lastStop.name.toLowerCase() ||
            (Math.abs(firstStop.lat - lastStop.lat) < 0.001 &&
              Math.abs(firstStop.lon - lastStop.lon) < 0.001);

          if (isCircular) {
            return [
              ...stops.slice(startIndex),
              ...stops.slice(1, endIndex + 1),
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

      // Try to find a direct route
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

      // Force a new array reference to ensure React detects the change
      setRoute(foundRoute ? [...foundRoute] : []);
    }
    // Close sidebar after route selection
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
