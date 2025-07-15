import React from "react";

const RouteHeader = ({
  onAddRoute,
  onImportRoute,
  onExportRoute,
  selectedRoutes,
  onBulkDelete,
  bulkDeleteLoading,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bus Routes</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
          <button
            onClick={onAddRoute}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            + Add New Route
          </button>
          <button
            onClick={onImportRoute}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            📥 Import Routes
          </button>
          <button
            onClick={onExportRoute}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            title="Export routes to JSON file"
          >
            📤 Export Routes
          </button>
          {selectedRoutes.length > 0 && (
            <button
              onClick={onBulkDelete}
              disabled={bulkDeleteLoading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              title={`Delete ${selectedRoutes.length} selected route${
                selectedRoutes.length > 1 ? "s" : ""
              }`}
            >
              {bulkDeleteLoading
                ? "Deleting..."
                : `🗑️ Delete ${selectedRoutes.length}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteHeader;
