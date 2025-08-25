import React from "react";

const BusNameHeader = ({
  onAddNew,
  onImport,
  onExport,
  onBulkDelete,
  selectedCount,
  bulkDeleteLoading,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bus Names</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
          <button
            onClick={onAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Add New Bus Name
          </button>
          <button
            onClick={onImport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            📥 Import Bus Names
          </button>
          <button
            onClick={onExport}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            title="Export bus names to JSON file"
          >
            📤 Export Bus Names
          </button>
          {selectedCount > 0 && (
            <button
              onClick={onBulkDelete}
              disabled={bulkDeleteLoading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              title={`Delete ${selectedCount} selected bus name${
                selectedCount > 1 ? "s" : ""
              }`}
            >
              {bulkDeleteLoading ? "Deleting..." : `🗑️ Delete ${selectedCount}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusNameHeader;
