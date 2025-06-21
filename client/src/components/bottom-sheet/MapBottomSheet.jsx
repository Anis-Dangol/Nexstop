import { HandCoins, BusFront, ArrowLeftRight } from "lucide-react";
import transferData from "@/assets/transfer.json";

export default function MapBottomSheet({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  fareData,
  route = [],
  getRouteNumberForSegment,
}) {
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
            <div className="mb-2 text-orange-500 font-semibold">
              {route.slice(0, -1).map((stop, idx) => {
                const nextStop = route[idx + 1];
                const transfer = transferData.find(
                  (t) =>
                    t.Transfer1 === stop.name && t.Transfer2 === nextStop.name
                );
                return transfer ? (
                  <div key={idx}>
                    Transfer Serial: {transfer.transferNumber + 1}
                  </div>
                ) : null;
              })}
            </div>
          )}
          {route.length > 1 ? (
            <ol className="list-decimal ml-6">
              {route.slice(0, -1).map((stop, idx) => {
                const nextStop = route[idx + 1];
                // Check for transfer
                const transfer = transferData.find(
                  (t) =>
                    t.Transfer1 === stop.name && t.Transfer2 === nextStop.name
                );
                // If the next stop is the transfer's Transfer1, make it red
                const isNextStopTransferFrom = transferData.some(
                  (t) => t.Transfer1 === nextStop.name
                );
                if (transfer) {
                  // Show transfer serial and green next stop, with orange label
                  return (
                    <li key={idx} className="mb-2">
                      <span
                        style={{ color: "orange", fontWeight: 600 }}
                      >{`Next Bus stop is :`}</span>{" "}
                      <b style={{ color: "green" }}>{nextStop.name}</b>
                    </li>
                  );
                } else if (isNextStopTransferFrom) {
                  // If the next stop is a transfer-from, make label orange and stop red
                  return (
                    <li key={idx} className="mb-2">
                      <span
                        style={{ color: "orange", fontWeight: 600 }}
                      >{`Next Bus stop is :`}</span>{" "}
                      <b style={{ color: "red" }}>{nextStop.name}</b>
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
