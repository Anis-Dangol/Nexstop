import React from "react";
import RouteCard from "./RouteCard";

const RouteList = ({
  routes,
  loading,
  searchTerm,
  sortOrder,
  selectedRoutes,
  selectAll,
  draggedIndex,
  dragOverIndex,
  dragUpdateLoading,
  onSelectAll,
  onSelectRoute,
  onEditRoute,
  onDeleteRoute,
  onRoutesDragStart,
  onRoutesDragOver,
  onRoutesDragEnter,
  onRoutesDragLeave,
  onRoutesDrop,
  onRoutesDragEnd,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Drag and Drop Instructions */}
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="text-blue-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 2a1 1 0 000 2h1v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2V4h1a1 1 0 100-2H5zM8 4v3h4V4H8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-blue-700">
                <span className="font-medium">💡 Tip:</span> Drag and drop
                routes using the drag handle (☰) to reorder them. Route numbers
                will be automatically updated based on the new order.
                {sortOrder !== "none" && (
                  <span className="block mt-1 text-orange-600">
                    ⚠️ Note: Disable sorting to use drag and drop functionality.
                  </span>
                )}
              </p>
            </div>
          </div>
          {dragUpdateLoading && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-600 font-medium">
                Updating database...
              </span>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading routes...</div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-3 px-6 text-sm font-medium text-gray-900">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={onSelectAll}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                  S.N.
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                  Route Name
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                  Total Stops
                </th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {routes.map((route, index) => (
                <RouteCard
                  key={route._id}
                  route={route}
                  index={index}
                  isSelected={selectedRoutes.includes(route._id)}
                  sortOrder={sortOrder}
                  draggedIndex={draggedIndex}
                  dragOverIndex={dragOverIndex}
                  onSelectRoute={onSelectRoute}
                  onEditRoute={onEditRoute}
                  onDeleteRoute={onDeleteRoute}
                  onRoutesDragStart={onRoutesDragStart}
                  onRoutesDragOver={onRoutesDragOver}
                  onRoutesDragEnter={onRoutesDragEnter}
                  onRoutesDragLeave={onRoutesDragLeave}
                  onRoutesDrop={onRoutesDrop}
                  onRoutesDragEnd={onRoutesDragEnd}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && routes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {searchTerm
              ? `No routes found matching "${searchTerm}"`
              : "No routes available"}
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteList;
