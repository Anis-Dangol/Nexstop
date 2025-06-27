import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserCount,
  fetchBusStatistics,
  fetchUserRegistrationStats,
} from "../../map/admin-slice/AdminSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

function AdminDashboard() {
  const dispatch = useDispatch();
  const { userCount, busStatistics, userRegistrationStats, isLoading } =
    useSelector((state) => state.admin);

  // State for year and month selection
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState("all");

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

  useEffect(() => {
    dispatch(fetchUserCount());
    dispatch(fetchBusStatistics());
    // Fetch registration stats with year and month parameters
    const params = { year: selectedYear };
    if (selectedMonth !== "all") {
      params.month = selectedMonth;
    }
    dispatch(fetchUserRegistrationStats(params));
  }, [dispatch, selectedYear, selectedMonth]);

  // Handle year change
  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  // Handle month change
  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  // Dynamic summary data
  const stats = [
    { label: "Total Users", value: isLoading ? "Loading..." : userCount },
    {
      label: "Total Bus Stops",
      value: isLoading ? "Loading..." : busStatistics.totalBusStops,
    },
    {
      label: "Total Bus Routes",
      value: isLoading ? "Loading..." : busStatistics.totalRoutes,
    },
  ];

  // Use real user registration data or fallback to empty array
  const userGraphData =
    userRegistrationStats.length > 0 ? userRegistrationStats : [];

  // Add debug logging to see what data we're getting
  console.log("userRegistrationStats:", userRegistrationStats);
  console.log("selectedMonth:", selectedMonth);
  console.log("userGraphData:", userGraphData);

  return (
    <div className="w-full bg-gray-50 min-h-screen p-3 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-2">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Dashboard</h1>
          <p className="text-gray-600">Welcome to the admin dashboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-2">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-600 mb-1">
                    {stat.label}
                  </p>
                  <div
                    className={`text-3xl font-bold ${
                      index === 0
                        ? "text-blue-600"
                        : index === 1
                        ? "text-green-600"
                        : "text-purple-600"
                    }`}
                  >
                    {stat.value}
                  </div>
                </div>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    index === 0
                      ? "bg-blue-100"
                      : index === 1
                      ? "bg-green-100"
                      : "bg-purple-100"
                  }`}
                >
                  <span className="text-xl">
                    {index === 0 ? "👥" : index === 1 ? "🚏" : "🚌"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* User Registration Chart */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                User Registration Statistics
              </h3>
              <p className="text-gray-600">
                Track user registrations over time
              </p>
            </div>
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:mt-0">
              <div className="flex flex-col">
                <label className="text-sm font-semibold text-gray-700 mb-1">
                  Year
                </label>
                <Select value={selectedYear} onValueChange={handleYearChange}>
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
                <Select value={selectedMonth} onValueChange={handleMonthChange}>
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
            ) : userGraphData.length > 0 ? (
              <>
                <div className="overflow-x-auto pb-8">
                  <div
                    className="flex items-end h-64 space-x-2 mb-8"
                    style={{
                      minWidth:
                        selectedMonth === "all"
                          ? userGraphData.length > 12
                            ? `${userGraphData.length * 60}px`
                            : "100%"
                          : userGraphData.length > 20
                          ? `${userGraphData.length * 40}px`
                          : "100%",
                    }}
                  >
                    {userGraphData.map((data, index) => {
                      const maxUsers = Math.max(
                        ...userGraphData.map((d) => d.users)
                      );
                      const heightRatio =
                        maxUsers > 0 ? (data.users / maxUsers) * 200 : 0;
                      return (
                        <div
                          key={`${data.month || data.day || data.date}`}
                          className="flex flex-col items-center flex-shrink-0"
                          style={{
                            minWidth: selectedMonth === "all" ? "60px" : "40px",
                          }}
                        >
                          <div className="text-xs text-gray-600 mb-1 font-medium">
                            {data.users}
                          </div>
                          <div
                            className="bg-blue-500 w-8 rounded-t min-h-[8px] hover:bg-blue-600 transition-colors"
                            style={{ height: `${Math.max(heightRatio, 8)}px` }}
                            title={`${data.users} users`}
                          ></div>
                          <span className="mt-3 text-xs text-gray-600 font-medium whitespace-nowrap">
                            {selectedMonth === "all"
                              ? data.month ||
                                data.monthName ||
                                `Month ${
                                  data.monthNumber || data.date?.split("-")[1]
                                }`
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
                  No registration data available for {selectedYear}
                  {selectedMonth !== "all" &&
                    ` - ${
                      monthOptions.find((m) => m.value === selectedMonth)?.label
                    }`}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
