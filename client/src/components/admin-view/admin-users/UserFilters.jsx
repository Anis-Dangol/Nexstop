import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../../ui/dropdown-menu";
import { Settings, ChevronDown } from "lucide-react";

const UserFilters = ({
  visibleColumns,
  columnConfig,
  toggleColumn,
  resetColumns,
  dateSort,
  setDateSort,
  selectedYear,
  setSelectedYear,
  availableYears,
  startIndex,
  endIndex,
  filteredAndSortedUsers,
  currentPage,
  totalPages,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-2 mb-4 border border-gray-200">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Display Options Section */}
        <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
          <div className="flex items-center">
            <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wide border-b-2 border-blue-300 pb-1">
              Display Options
            </h4>
          </div>
          {/* Column Visibility Dropdown */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-600">
              Show Columns:
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                  <Settings size={16} />
                  <span className="text-sm">Columns</span>
                  <ChevronDown size={16} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>Visible Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columnConfig.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.key}
                    checked={visibleColumns[column.key]}
                    onCheckedChange={() => toggleColumn(column.key)}
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
                <div className="p-2">
                  <button
                    onClick={resetColumns}
                    className="w-full text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded transition-colors"
                  >
                    Reset to Default
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Vertical Divider - Only show if Created Date column is visible */}
        {visibleColumns.createdDate && (
          <div className="flex items-center justify-center lg:mx-2">
            <div className="h-16 w-px bg-blue-400 shadow-sm"></div>
          </div>
        )}

        {/* Filter Options Section - Only show if Created Date column is visible */}
        {visibleColumns.createdDate && (
          <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
            <div className="flex items-center">
              <h4 className="text-sm font-bold text-blue-800 uppercase tracking-wide border-b-2 border-blue-300 pb-1">
                Filter Options
              </h4>
            </div>

            {/* Date Sort */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-600">
                Sort by Date:
              </label>
              <Select value={dateSort} onValueChange={setDateSort}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Sort order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Newest First</SelectItem>
                  <SelectItem value="asc">Oldest First</SelectItem>
                  <SelectItem value="none">No Sorting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Year Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-600">
                Filter by Year:
              </label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reset Date Filters */}
            <button
              onClick={() => {
                setDateSort("desc");
                setSelectedYear("all");
              }}
              className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="flex flex-col items-end ml-auto gap-2">
          <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-md border border-gray-200">
            Showing {startIndex + 1}-
            {Math.min(endIndex, filteredAndSortedUsers.length)} of{" "}
            {filteredAndSortedUsers.length} users
            {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserFilters;
