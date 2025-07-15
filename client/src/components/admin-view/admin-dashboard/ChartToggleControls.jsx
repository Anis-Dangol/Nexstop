import React from "react";

const ChartToggleControls = ({
  chartVisibility,
  setChartVisibility,
  toggleChart,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Statistics Charts
          </h3>
        </div>
        <div className="w-full flex justify-end pr-0">
          <div className="flex gap-2">
            <button
              onClick={() =>
                setChartVisibility({
                  userRegistration: true,
                  busRoutes: true,
                  busStops: true,
                  transfers: true,
                  busNames: true,
                  fareConfig: true,
                })
              }
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              Show All
            </button>
            <button
              onClick={() =>
                setChartVisibility({
                  userRegistration: false,
                  busRoutes: false,
                  busStops: false,
                  transfers: false,
                  busNames: false,
                  fareConfig: false,
                })
              }
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
            >
              Hide All
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        <button
          onClick={() => toggleChart("userRegistration")}
          className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
            chartVisibility.userRegistration
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600"
          }`}
        >
          <span className="text-xl">👥</span>
          <span className="font-medium">User Registration</span>
          {chartVisibility.userRegistration && (
            <span className="text-xs bg-blue-200 px-2 py-1 rounded">
              Visible
            </span>
          )}
        </button>
        <button
          onClick={() => toggleChart("busStops")}
          className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
            chartVisibility.busStops
              ? "border-green-500 bg-green-50 text-green-700"
              : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600"
          }`}
        >
          <span className="text-xl">🚏</span>
          <span className="font-medium">Bus Stops</span>
          {chartVisibility.busStops && (
            <span className="text-xs bg-green-200 px-2 py-1 rounded">
              Visible
            </span>
          )}
        </button>
        <button
          onClick={() => toggleChart("busRoutes")}
          className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
            chartVisibility.busRoutes
              ? "border-purple-500 bg-purple-50 text-purple-700"
              : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600"
          }`}
        >
          <span className="text-xl">🚌</span>
          <span className="font-medium">Bus Routes</span>
          {chartVisibility.busRoutes && (
            <span className="text-xs bg-purple-200 px-2 py-1 rounded">
              Visible
            </span>
          )}
        </button>
        <button
          onClick={() => toggleChart("transfers")}
          className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
            chartVisibility.transfers
              ? "border-orange-500 bg-orange-50 text-orange-700"
              : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600"
          }`}
        >
          <span className="text-xl">🔄</span>
          <span className="font-medium">Transfers</span>
          {chartVisibility.transfers && (
            <span className="text-xs bg-orange-200 px-2 py-1 rounded">
              Visible
            </span>
          )}
        </button>
        <button
          onClick={() => toggleChart("busNames")}
          className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
            chartVisibility.busNames
              ? "border-red-500 bg-red-50 text-red-700"
              : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600"
          }`}
        >
          <span className="text-xl">🏷️</span>
          <span className="font-medium">Bus Names</span>
          {chartVisibility.busNames && (
            <span className="text-xs bg-red-200 px-2 py-1 rounded">
              Visible
            </span>
          )}
        </button>
        <button
          onClick={() => toggleChart("fareConfig")}
          className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
            chartVisibility.fareConfig
              ? "border-teal-500 bg-teal-50 text-teal-700"
              : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600"
          }`}
        >
          <span className="text-xl">💰</span>
          <span className="font-medium">Fare Configuration</span>
          {chartVisibility.fareConfig && (
            <span className="text-xs bg-teal-200 px-2 py-1 rounded">
              Visible
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default ChartToggleControls;
