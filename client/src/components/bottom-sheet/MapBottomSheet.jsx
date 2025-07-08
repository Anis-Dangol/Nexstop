import { HandCoins, BusFront, ArrowLeftRight } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchTransfers } from "../../services/transfers";
import { getBusNamesForStop } from "../../utils/mapUtils";

export default function MapBottomSheet({
  activeTab,
  setActiveTab,
  fareData,
  route = [],
}) {
  const [transferData, setTransferData] = useState([]);
  const [busNamesData, setBusNamesData] = useState({});

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

  // Load bus names for all stops in the route
  useEffect(() => {
    const loadBusNamesForRoute = async () => {
      const busNamesMap = {};
      for (const stop of route) {
        try {
          const busNames = await getBusNamesForStop(stop.name);
          busNamesMap[stop.name] = busNames || [];
        } catch (error) {
          console.error(`Error loading bus names for ${stop.name}:`, error);
          busNamesMap[stop.name] = [];
        }
      }
      setBusNamesData(busNamesMap);
    };

    if (route.length > 0) {
      loadBusNamesForRoute();
    }
  }, [route]);

  // Helper function to check if a transfer is valid (both transfer points exist in route)
  const isValidTransferInRoute = (transfer1, transfer2, routeStops) => {
    const transfer1Index = routeStops.findIndex(
      (stop) => stop.name === transfer1
    );
    const transfer2Index = routeStops.findIndex(
      (stop) => stop.name === transfer2
    );
    return transfer1Index !== -1 && transfer2Index !== -1;
  };
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-around items-center border-t border-b border-gray-200 py-2 mb-4">
        <button
          className={`flex flex-col items-center focus:outline-none ${
            activeTab === "fare" ? "text-blue-600" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("fare")}
        >
          <HandCoins size={24} />
          <span className="text-xs mt-1">Fare</span>
        </button>
        <button
          className={`flex flex-col items-center focus:outline-none ${
            activeTab === "bus" ? "text-blue-600" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("bus")}
        >
          <BusFront size={24} />
          <span className="text-xs mt-1">Buses</span>
        </button>
        <button
          className={`flex flex-col items-center focus:outline-none ${
            activeTab === "direction" ? "text-blue-600" : "text-gray-600"
          }`}
          onClick={() => setActiveTab("direction")}
        >
          <ArrowLeftRight size={24} />
          <span className="text-xs mt-1">Direction</span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === "fare" && (
          <div className="h-full flex flex-col">
            <h2 className="text-lg font-bold mb-1">Fare Estimation</h2>
            <div className="flex-1">
              {fareData ? (
                <div className="space-y-2">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-lg font-semibold text-green-800">
                      <span className="font-bold">Fare:</span> Rs.{" "}
                      {fareData.fare}
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-lg font-semibold text-blue-800">
                      <span className="font-bold">Route Distance:</span>{" "}
                      {fareData.totalDistance} km
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-gray-500">No fare data available.</p>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === "bus" && (
          <div className="flex-1 overflow-y-auto">
            <h2 className="text-lg font-bold mb-1">Bus Info</h2>
            {route && route.length > 0 ? (
              <>
                {/* Summary at top */}
                {route.some(
                  (stop) =>
                    busNamesData[stop.name] &&
                    busNamesData[stop.name].length > 0
                ) && (
                  <div className="mb-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-800 font-bold">
                      Total Stops:{" "}
                      <span className="font-semibold">
                        {
                          route.filter(
                            (stop) =>
                              busNamesData[stop.name] &&
                              busNamesData[stop.name].length > 0
                          ).length
                        }
                      </span>
                    </div>
                    <div className="text-xs font-bold text-blue-600 mt-1">
                      Available Buses:{" "}
                      <span className="font-semibold">
                        {[
                          ...new Set(
                            route
                              .flatMap((stop) => busNamesData[stop.name] || [])
                              .filter(Boolean)
                          ),
                        ].join(", ")}
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {(() => {
                    const busNameMap = {};
                    route.forEach((stop, idx) => {
                      const busNames = busNamesData[stop.name] || [];
                      if (!busNames || busNames.length === 0) return;
                      busNames.forEach((busName) => {
                        if (!busNameMap[busName]) {
                          busNameMap[busName] = [];
                        }
                        busNameMap[busName].push({
                          stop,
                          originalIndex: idx,
                        });
                      });
                    });

                    const groupedStops = Object.entries(busNameMap).map(
                      ([busName, stops]) => ({
                        busName,
                        stops,
                        coverage: stops.length, // Number of stops this bus covers
                      })
                    );

                    // Sort by coverage (most stops first)
                    groupedStops.sort((a, b) => b.coverage - a.coverage);

                    // Find overlapping stops between buses
                    const getOverlappingStops = (currentGroup, allGroups) => {
                      const currentStopNames = currentGroup.stops.map(
                        (s) => s.stop.name
                      );
                      const overlaps = new Set();

                      allGroups.forEach((otherGroup) => {
                        if (otherGroup.busName !== currentGroup.busName) {
                          const otherStopNames = otherGroup.stops.map(
                            (s) => s.stop.name
                          );
                          currentStopNames.forEach((stopName) => {
                            if (otherStopNames.includes(stopName)) {
                              overlaps.add(stopName);
                            }
                          });
                        }
                      });

                      return overlaps;
                    };

                    return groupedStops.map((group, groupIdx) => {
                      const overlappingStops = getOverlappingStops(
                        group,
                        groupedStops
                      );
                      const isBestCoverage = groupIdx === 0; // First bus has best coverage

                      return (
                        <div
                          key={groupIdx}
                          className={`p-3 rounded-lg border ${
                            isBestCoverage
                              ? "bg-green-50 border-green-300 ring-2 ring-green-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div
                                className={`font-bold text-base ${
                                  isBestCoverage
                                    ? "text-green-800"
                                    : "text-gray-800"
                                }`}
                              >
                                {group.busName}
                              </div>
                              {isBestCoverage && (
                                <span className="ml-2 px-2 py-1 bg-green-200 text-green-800 text-xs font-bold rounded-full">
                                  BEST ROUTE
                                </span>
                              )}
                            </div>
                            <div className="flex items-center">
                              <div
                                className={`w-3 h-3 rounded-full mr-2 ${
                                  isBestCoverage
                                    ? "bg-green-500"
                                    : "bg-blue-500"
                                }`}
                              ></div>
                              <span className="text-xs font-bold text-gray-500">
                                {group.coverage} Stop
                                {group.coverage > 1 ? "s" : ""}
                                {": "}
                                {group.stops
                                  .map((s) => s.originalIndex + 1)
                                  .join(", ")}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm">
                            {group.stops.map((stopData, stopIdx) => {
                              const isOverlapping = overlappingStops.has(
                                stopData.stop.name
                              );
                              return (
                                <span
                                  key={stopIdx}
                                  className={
                                    isOverlapping
                                      ? "bg-yellow-200 text-yellow-800 px-1 rounded font-semibold"
                                      : "text-gray-600"
                                  }
                                >
                                  {stopData.stop.name}
                                  {stopIdx < group.stops.length - 1 && " -> "}
                                </span>
                              );
                            })}
                          </div>
                          {isBestCoverage && (
                            <div className="mt-2 text-xs text-green-700 font-medium">
                              🎯 This bus covers the most stops on your route
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}

                  {/* Show message if no buses found */}
                  {route.every(
                    (stop) =>
                      !busNamesData[stop.name] ||
                      busNamesData[stop.name].length === 0
                  ) && (
                    <div className="text-center py-4 text-gray-500">
                      No bus information available for this route.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-32">
                <p className="text-gray-500">
                  No route selected. Please select a route to view bus
                  information.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "direction" && (
          <div className="h-full flex flex-col">
            <h2 className="text-lg font-bold mb-0">Follow this Direction</h2>
            {/* Show serial numbers of transfers below the heading */}
            {route.length > 1 && (
              <div className="mb-2 text-black font-semibold">
                {(() => {
                  const transfers = [];
                  route.slice(0, -1).forEach((stop, idx) => {
                    const nextStop = route[idx + 1];
                    const transfer = transferData.find(
                      (t) =>
                        t.transfer1 === stop.name &&
                        t.transfer2 === nextStop.name
                    );
                    if (
                      transfer &&
                      isValidTransferInRoute(
                        transfer.transfer1,
                        transfer.transfer2,
                        route
                      )
                    ) {
                      transfers.push({
                        transfer,
                        getOffStep: idx + 1, // Step number where to get off
                        boardStep: idx + 2, // Step number where to board next bus
                      });
                    }
                  });

                  return transfers.map((item, transferIdx) => (
                    <div key={transferIdx}>
                      Transfer Serial:
                      <span className="text-red-500">
                        {" "}
                        {item.getOffStep - 1}{" "}
                      </span>
                      -
                      <span className="text-green-500">
                        {" "}
                        {item.boardStep - 1}
                      </span>
                    </div>
                  ));
                })()}
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {route.length > 1 ? (
                <ol className="list-decimal ml-6 space-y-2">
                  {route.slice(0, -1).map((stop, idx) => {
                    const nextStop = route[idx + 1];
                    // Check for transfer at this segment
                    const transfer = transferData.find(
                      (t) =>
                        t.transfer1 === stop.name &&
                        t.transfer2 === nextStop.name
                    );

                    // Check if this stop is the transfer-from (where to get off)
                    const isGetOffStop = transferData.some(
                      (t) =>
                        t.transfer1 === nextStop.name &&
                        isValidTransferInRoute(t.transfer1, t.transfer2, route)
                    );

                    // Check if previous segment was a transfer (for take another bus)
                    const prevTransfer =
                      idx > 0 &&
                      transferData.find(
                        (t) =>
                          t.transfer1 === route[idx].name &&
                          t.transfer2 === route[idx + 1].name &&
                          isValidTransferInRoute(
                            t.transfer1,
                            t.transfer2,
                            route
                          )
                      );

                    // If the next stop is a transfer-from, show 'Get off at ...' in red
                    if (isGetOffStop) {
                      return (
                        <li
                          key={idx}
                          className="mb-2 p-2 bg-red-50 rounded border border-red-200"
                        >
                          <span style={{ color: "orange", fontWeight: 600 }}>
                            Get off at Bus Stop :
                          </span>{" "}
                          <b style={{ color: "red" }}>{nextStop.name}</b>
                        </li>
                      );
                    } else if (prevTransfer) {
                      // If this is the first stop after a transfer, show 'take another bus from ...' in green
                      return (
                        <li
                          key={idx}
                          className="mb-2 p-2 bg-green-50 rounded border border-green-200"
                        >
                          <span style={{ color: "orange", fontWeight: 600 }}>
                            take another bus from Bus Stop :
                          </span>{" "}
                          <b style={{ color: "green" }}>{nextStop.name}</b>
                        </li>
                      );
                    } else {
                      return (
                        <li
                          key={idx}
                          className="mb-2 p-2 bg-gray-50 rounded border border-gray-200"
                        >
                          Next Bus stop is : <b>{nextStop.name}</b>
                        </li>
                      );
                    }
                  })}
                </ol>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <p className="text-gray-500">No route data available.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
