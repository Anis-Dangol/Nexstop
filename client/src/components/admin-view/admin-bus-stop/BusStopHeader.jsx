import React from "react";

const BusStopHeader = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bus Stops</h1>
        </div>
      </div>
    </div>
  );
};

export default BusStopHeader;
