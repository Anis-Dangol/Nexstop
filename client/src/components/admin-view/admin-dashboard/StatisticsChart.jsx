import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";

const StatisticsChart = ({
  title,
  data,
  color,
  icon,
  entityName,
  filters,
  setFilters,
  isLoading,
}) => {
  const graphData = data.length > 0 ? data : [];

  // Generate year options (current year and previous 4 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = 0; i < 5; i++) {
    yearOptions.push((currentYear - i).toString());
  }

  // Month options
  const monthOptions = [
    { value: "all", label: "All Months" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  // Debug logging to see data structure
  console.log(`${title} data:`, graphData);

  const handleYearChange = (year) => {
    setFilters((prev) => ({ ...prev, year }));
  };

  const handleMonthChange = (month) => {
    setFilters((prev) => ({ ...prev, month }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            {title}
          </h3>
          <p className="text-gray-600">Track {entityName} over time</p>
        </div>
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Year
            </label>
            <Select value={filters.year} onValueChange={handleYearChange}>
              <SelectTrigger className="w-32 bg-white border-gray-300">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-gray-700 mb-1">
              Month
            </label>
            <Select value={filters.month} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-40 bg-white border-gray-300">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Chart Content */}
      <div className="bg-gray-50 rounded-lg p-6 min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading chart data...</div>
          </div>
        ) : graphData.length > 0 ? (
          <>
            <div className="overflow-x-auto pb-8">
              <div
                className="flex items-end h-64 space-x-2 mb-8"
                style={{
                  minWidth:
                    filters.month === "all"
                      ? graphData.length > 12
                        ? `${graphData.length * 60}px`
                        : "100%"
                      : graphData.length > 20
                      ? `${graphData.length * 40}px`
                      : "100%",
                }}
              >
                {graphData.map((data, index) => {
                  const maxCount = Math.max(
                    ...graphData.map((d) => d.count || d.users || 0)
                  );
                  const value = data.count || data.users || 0;
                  const heightRatio =
                    maxCount > 0 ? (value / maxCount) * 200 : 0;

                  return (
                    <div
                      key={`${data.month || data.day || data.date || index}`}
                      className="flex flex-col items-center flex-shrink-0"
                      style={{
                        minWidth: filters.month === "all" ? "60px" : "40px",
                      }}
                    >
                      <div className="text-xs text-gray-600 mb-1 font-medium">
                        {value}
                      </div>
                      <div
                        className={`w-8 rounded-t min-h-[8px] hover:opacity-80 transition-colors ${color}`}
                        style={{ height: `${Math.max(heightRatio, 8)}px` }}
                        title={`${value} ${entityName}`}
                      ></div>
                      <span className="mt-3 text-xs text-gray-600 font-medium whitespace-nowrap">
                        {filters.month === "all"
                          ? (() => {
                              const monthNames = [
                                "Jan",
                                "Feb",
                                "Mar",
                                "Apr",
                                "May",
                                "Jun",
                                "Jul",
                                "Aug",
                                "Sep",
                                "Oct",
                                "Nov",
                                "Dec",
                              ];
                              let monthIndex;

                              if (data.month && !isNaN(data.month)) {
                                monthIndex = data.month - 1;
                              } else if (
                                data.monthNumber &&
                                !isNaN(data.monthNumber)
                              ) {
                                monthIndex = data.monthNumber - 1;
                              } else if (data.date && data.date.includes("-")) {
                                const monthFromDate = parseInt(
                                  data.date.split("-")[1]
                                );
                                monthIndex = !isNaN(monthFromDate)
                                  ? monthFromDate - 1
                                  : index;
                              } else {
                                monthIndex = index;
                              }

                              // Ensure monthIndex is within valid range
                              if (
                                monthIndex < 0 ||
                                monthIndex > 11 ||
                                isNaN(monthIndex)
                              ) {
                                monthIndex = index % 12;
                              }

                              return monthNames[monthIndex];
                            })()
                          : data.day ||
                            data.date?.split("-")[2] ||
                            `Day ${data.dayNumber || index + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">
              No {entityName} data available for {filters.year}
              {filters.month !== "all" &&
                ` - ${
                  monthOptions.find((m) => m.value === filters.month)?.label
                }`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsChart;
