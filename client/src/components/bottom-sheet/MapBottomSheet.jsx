import { HandCoins, BusFront, ArrowLeftRight } from "lucide-react";
import transferData from "@/assets/transfer.json";

export default function MapBottomSheet({
  activeTab,
  setActiveTab,
  fareData,
  route = [],
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
    <div>
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
      {activeTab === "fare" && (
        <div>
          <h2 className="text-lg font-bold">Fare Estimation</h2>
          {fareData ? (
            <>
              <p>Fare: ₹ {fareData.fare}</p>
              <p>Distance: {fareData.totalDistance} km</p>
            </>
          ) : (
            <p className="text-gray-500">No fare data available.</p>
          )}
        </div>
      )}
      {activeTab === "bus" && (
        <div>
          <h2 className="text-lg font-bold">Bus Info</h2>
          <p>Bus 1, Bus 2, Bus 3.</p>
        </div>
      )}
      {activeTab === "direction" && (
        <div style={{ maxHeight: 300, overflowY: "auto" }}>
          <h2 className="text-lg font-bold">Follow this Direction</h2>
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
          {route.length > 1 ? (
            <ol className="list-decimal ml-6">
              {route.slice(0, -1).map((stop, idx) => {
                const nextStop = route[idx + 1];
                // Check for transfer at this segment
                const transfer = transferData.find(
                  (t) =>
                    t.Transfer1 === stop.name && t.Transfer2 === nextStop.name
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
                      isValidTransferInRoute(t.Transfer1, t.Transfer2, route)
                  );

                // If the next stop is a transfer-from, show 'Get off at ...' in red
                if (isGetOffStop) {
                  return (
                    <li key={idx} className="mb-2">
                      <span style={{ color: "orange", fontWeight: 600 }}>
                        Get off at Bus Stop :
                      </span>{" "}
                      <b style={{ color: "red" }}>{nextStop.name}</b>
                    </li>
                  );
                } else if (prevTransfer) {
                  // If this is the first stop after a transfer, show 'take another bus from ...' in green
                  return (
                    <li key={idx} className="mb-2">
                      <span style={{ color: "orange", fontWeight: 600 }}>
                        take another bus from Bus Stop :
                      </span>{" "}
                      <b style={{ color: "green" }}>{nextStop.name}</b>
                    </li>
                  );
                } else {
                  return (
                    <li key={idx} className="mb-2">
                      Next Bus stop is : <b>{nextStop.name}</b>
                    </li>
                  );
                }
              })}
            </ol>
          ) : (
            <p className="text-gray-500">No route data available.</p>
          )}
        </div>
      )}
    </div>
  );
}
