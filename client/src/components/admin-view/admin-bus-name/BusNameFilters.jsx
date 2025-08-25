import React from "react";

const BusNameFilters = ({
  searchTerm,
  onSearchChange,
  sortOrder,
  onSortChange,
  totalCount,
  filteredCount,
  selectedCount,
  onSelectAll,
  selectAll,
  hasFiltered,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search bus names or stops..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <div>
          <select
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="none">No Sort</option>
            <option value="asc">A-Z</option>
            <option value="desc">Z-A</option>
          </select>
        </div>
        <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 whitespace-nowrap">
          {hasFiltered ? (
            <>
              Showing {filteredCount} of {totalCount} bus names
            </>
          ) : (
            <>Total Bus Names: {totalCount}</>
          )}
        </div>
        <div>
          {selectedCount > 0 && (
            <div className="text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200 whitespace-nowrap">
              {selectedCount} bus name{selectedCount > 1 ? "s" : ""} selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusNameFilters;
