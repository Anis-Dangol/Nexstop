import React from "react";
import BusNameCard from "./BusNameCard";

const BusNameList = ({
  busNames,
  selectedBusNames,
  onSelectBusName,
  onSelectAll,
  selectAll,
  onEdit,
  onDelete,
  searchTerm,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Bus Names</h3>
          {busNames.length > 0 && (
            <button
              onClick={onSelectAll}
              className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md transition-colors"
            >
              {selectAll ? "Deselect All" : "Select All"}
            </button>
          )}
        </div>

        {busNames.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchTerm.trim()
              ? `No bus names found matching "${searchTerm}".`
              : "No bus names found. Add your first bus name to get started."}
          </div>
        ) : (
          <div className="space-y-4">
            {busNames.map((busName) => (
              <BusNameCard
                key={busName._id}
                busName={busName}
                isSelected={selectedBusNames.includes(busName._id)}
                onSelect={onSelectBusName}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusNameList;
