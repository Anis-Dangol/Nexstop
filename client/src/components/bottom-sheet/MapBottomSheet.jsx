import { HandCoins, BusFront } from "lucide-react";

export default function MapBottomSheet({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  fareData,
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
    </div>
  );
}
