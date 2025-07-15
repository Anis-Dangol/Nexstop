import React from "react";

const BusNameCard = ({ busName, isSelected, onSelect, onEdit, onDelete }) => {
  return (
    <div
      className={`border border-gray-200 rounded-lg p-4 transition-colors ${
        isSelected ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(busName._id)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mt-1"
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {busName.busname}
            </h3>
            <p className="text-sm text-gray-600">
              {busName.stops.length} stops
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(busName)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(busName._id)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="text-sm text-gray-700">
        <strong>Stops:</strong>{" "}
        <span className="italic">{busName.stops.join(" → ")}</span>
      </div>
    </div>
  );
};

export default BusNameCard;
