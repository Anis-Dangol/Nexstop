import { HandCoins, BusFront, ArrowLeftRight } from "lucide-react";
import transferData from "@/assets/transfer.json";

export default function MapBottomSheet({
  activeTab,
  setActiveTab,
  fareData,
  route = [],
  getBusNamesForStop,
}) {
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
            <h2 className="text-lg font-bold mb-3">Fare Estimation</h2>
            <div className="flex-1">
              {fareData ? (
                <div className="space-y-2">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-lg font-semibold text-green-800">
                      Fare: ₹ {fareData.fare}
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm text-blue-800">
                      Distance: {fareData.totalDistance} km
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
            <div className="p-4">
              <h2 className="text-lg font-bold mb-3">Bus Info</h2>
              {route && route.length > 0 ? (
                <>
                  {/* Summary at top */}
                  {route.some(
                    (stop) =>
                      getBusNamesForStop && getBusNamesForStop(stop.name)
                  ) && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-sm text-blue-800 font-medium">
                        Total Stops with Bus Service:{" "}
                        {
                          route.filter(
                            (stop) =>
                              getBusNamesForStop &&
                              getBusNamesForStop(stop.name)
                          ).length
                        }
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        Available Buses:{" "}
                        {[
                          ...new Set(
                            route
                              .flatMap((stop) =>
                                getBusNamesForStop
                                  ? getBusNamesForStop(stop.name)
                                  : []
                              )
                              .filter(Boolean)
                          ),
                        ].join(", ")}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {(() => {
                      const busNameMap = {};
                      route.forEach((stop, idx) => {
                        const busNames = getBusNamesForStop
                          ? getBusNamesForStop(stop.name)
                          : [];
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
                        })
                      );

                      return groupedStops.map((group, groupIdx) => (
                        <div
                          key={groupIdx}
                          className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-gray-800 text-base">
                              {group.busName}
                            </div>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                              <span className="text-xs text-gray-500">
                                Stop{group.stops.length > 1 ? "s" : ""}{" "}
                                {group.stops
                                  .map((s) => s.originalIndex + 1)
                                  .join(", ")}
                              </span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600">
                            {group.stops.map((stopData, stopIdx) => (
                              <span key={stopIdx}>
                                {stopData.stop.name}
                                {stopIdx < group.stops.length - 1 && " -> "}
                              </span>
                            ))}
                          </div>
                        </div>
                      ));
                    })()}

                    {/* Show message if no buses found */}
                    {route.every(
                      (stop) =>
                        !getBusNamesForStop || !getBusNamesForStop(stop.name)
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
          </div>
        )}

        {activeTab === "direction" && (
          <div className="h-full flex flex-col">
            <h2 className="text-lg font-bold mb-3">Follow this Direction</h2>
            {/* Show serial numbers of transfers below the heading */}
            {route.length > 1 && (
              <div className="mb-2 text-black font-semibold">
                {route.slice(0, -1).map((stop, idx) => {
                  const nextStop = route[idx + 1];
                  const transfer = transferData.find(
                    (t) =>
                      t.Transfer1 === stop.name && t.Transfer2 === nextStop.name
                  );
                  // Only show transfer colors if both transfer points are valid in the route
                  return transfer &&
                    isValidTransferInRoute(
                      transfer.Transfer1,
                      transfer.Transfer2,
                      route
                    ) ? (
                    <div key={idx}>
                      Transfer Serial:
                      <span className="text-red-500">
                        {" "}
                        {transfer.transferNumber}{" "}
                      </span>
                      -
                      <span className="text-green-500">
                        {" "}
                        {transfer.transferNumber + 1}
                      </span>
                    </div>
                  ) : null;
                })}
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
                        t.Transfer1 === stop.name &&
                        t.Transfer2 === nextStop.name
                    );

                    // Check if this stop is the transfer-from (where to get off)
                    const isGetOffStop = transferData.some(
                      (t) =>
                        t.Transfer1 === nextStop.name &&
                        isValidTransferInRoute(t.Transfer1, t.Transfer2, route)
                    );

                    // Check if previous segment was a transfer (for take another bus)
                    const prevTransfer =
                      idx > 0 &&
                      transferData.find(
                        (t) =>
                          t.Transfer1 === route[idx].name &&
                          t.Transfer2 === route[idx + 1].name &&
                          isValidTransferInRoute(
                            t.Transfer1,
                            t.Transfer2,
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
