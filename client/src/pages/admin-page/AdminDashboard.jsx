import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserCount,
  fetchBusStatistics,
  fetchUserRegistrationStats,
  fetchDashboardStats,
  fetchBusRouteStats,
  fetchBusStopStats,
  fetchTransferStats,
  fetchBusNameStats,
  fetchFareConfigStats,
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
  const {
    userCount,
    busStatistics,
    userRegistrationStats,
    busRouteStats,
    busStopStats,
    transferStats,
    busNameStats,
    fareConfigStats,
    dashboardStats,
    isLoading,
  } = useSelector((state) => state.admin);

  // State for year and month selection - separate for each chart
  const [userFilters, setUserFilters] = useState({
    year: new Date().getFullYear().toString(),
    month: "all",
  });
  const [busRouteFilters, setBusRouteFilters] = useState({
    year: new Date().getFullYear().toString(),
    month: "all",
  });
  const [busStopFilters, setBusStopFilters] = useState({
    year: new Date().getFullYear().toString(),
    month: "all",
  });
  const [transferFilters, setTransferFilters] = useState({
    year: new Date().getFullYear().toString(),
    month: "all",
  });
  const [busNameFilters, setBusNameFilters] = useState({
    year: new Date().getFullYear().toString(),
    month: "all",
  });
  const [fareConfigFilters, setFareConfigFilters] = useState({
    year: new Date().getFullYear().toString(),
    month: "all",
  });

  // Toggle state for each chart visibility
  const [chartVisibility, setChartVisibility] = useState({
    userRegistration: true,
    busRoutes: false,
    busStops: false,
    transfers: false,
    busNames: false,
    fareConfig: false,
  });

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
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // Separate useEffect for each chart's data fetching
  useEffect(() => {
    const params = { year: userFilters.year };
    if (userFilters.month !== "all") {
      params.month = userFilters.month;
    }
    dispatch(fetchUserRegistrationStats(params));
  }, [dispatch, userFilters.year, userFilters.month]);

  useEffect(() => {
    const params = { year: busRouteFilters.year };
    if (busRouteFilters.month !== "all") {
      params.month = busRouteFilters.month;
    }
    dispatch(fetchBusRouteStats(params));
  }, [dispatch, busRouteFilters.year, busRouteFilters.month]);

  useEffect(() => {
    const params = { year: busStopFilters.year };
    if (busStopFilters.month !== "all") {
      params.month = busStopFilters.month;
    }
    dispatch(fetchBusStopStats(params));
  }, [dispatch, busStopFilters.year, busStopFilters.month]);

  useEffect(() => {
    const params = { year: transferFilters.year };
    if (transferFilters.month !== "all") {
      params.month = transferFilters.month;
    }
    dispatch(fetchTransferStats(params));
  }, [dispatch, transferFilters.year, transferFilters.month]);

  useEffect(() => {
    const params = { year: busNameFilters.year };
    if (busNameFilters.month !== "all") {
      params.month = busNameFilters.month;
    }
    dispatch(fetchBusNameStats(params));
  }, [dispatch, busNameFilters.year, busNameFilters.month]);

  useEffect(() => {
    const params = { year: fareConfigFilters.year };
    if (fareConfigFilters.month !== "all") {
      params.month = fareConfigFilters.month;
    }
    dispatch(fetchFareConfigStats(params));
  }, [dispatch, fareConfigFilters.year, fareConfigFilters.month]);

  // Toggle chart visibility
  const toggleChart = (chartName) => {
    setChartVisibility((prev) => ({
      ...prev,
      [chartName]: !prev[chartName],
    }));
  };

  // Dynamic summary data
  const stats = [
    {
      label: "Total Users",
      value: isLoading ? "Loading..." : dashboardStats.users || userCount,
    },
    {
      label: "Total Bus Stops",
      value: isLoading
        ? "Loading..."
        : dashboardStats.busStops || busStatistics.totalBusStops,
    },
    {
      label: "Total Bus Routes",
      value: isLoading
        ? "Loading..."
        : dashboardStats.busRoutes || busStatistics.totalRoutes,
    },
    {
      label: "Total Transfers",
      value: isLoading ? "Loading..." : dashboardStats.transfers,
    },
    {
      label: "Total Bus Names",
      value: isLoading ? "Loading..." : dashboardStats.busNames,
    },
    {
      label: "Fare Configs",
      value: isLoading ? "Loading..." : dashboardStats.fareConfigs,
    },
  ];

  // Reusable Statistics Chart Component
  const StatisticsChart = ({
    title,
    data,
    color,
    icon,
    entityName,
    filters,
    setFilters,
  }) => {
    const graphData = data.length > 0 ? data : [];

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
                                } else if (
                                  data.date &&
                                  data.date.includes("-")
                                ) {
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

  return (
    <div className="w-full bg-gray-50 min-h-screen p-3 pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-2">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Dashboard</h1>
          <p className="text-gray-600">Welcome to the admin dashboard</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-2">
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
                        : index === 2
                        ? "text-purple-600"
                        : index === 3
                        ? "text-orange-600"
                        : index === 4
                        ? "text-red-600"
                        : "text-teal-600"
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
                      : index === 2
                      ? "bg-purple-100"
                      : index === 3
                      ? "bg-orange-100"
                      : index === 4
                      ? "bg-red-100"
                      : "bg-teal-100"
                  }`}
                >
                  <span className="text-xl">
                    {index === 0
                      ? "👥"
                      : index === 1
                      ? "🚏"
                      : index === 2
                      ? "🚌"
                      : index === 3
                      ? "🔄"
                      : index === 4
                      ? "🏷️"
                      : "💰"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chart Toggle Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Statistics Charts
              </h3>
            </div>
            <div className="w-full flex justify-end pr-0">
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setChartVisibility({
                      userRegistration: true,
                      busRoutes: true,
                      busStops: true,
                      transfers: true,
                      busNames: true,
                      fareConfig: true,
                    })
                  }
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  Show All
                </button>
                <button
                  onClick={() =>
                    setChartVisibility({
                      userRegistration: false,
                      busRoutes: false,
                      busStops: false,
                      transfers: false,
                      busNames: false,
                      fareConfig: false,
                    })
                  }
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                >
                  Hide All
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            <button
              onClick={() => toggleChart("userRegistration")}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                chartVisibility.userRegistration
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600"
              }`}
            >
              <span className="text-xl">👥</span>
              <span className="font-medium">User Registration</span>
              {chartVisibility.userRegistration && (
                <span className="text-xs bg-blue-200 px-2 py-1 rounded">
                  Visible
                </span>
              )}
            </button>
            <button
              onClick={() => toggleChart("busStops")}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                chartVisibility.busStops
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600"
              }`}
            >
              <span className="text-xl">🚏</span>
              <span className="font-medium">Bus Stops</span>
              {chartVisibility.busStops && (
                <span className="text-xs bg-green-200 px-2 py-1 rounded">
                  Visible
                </span>
              )}
            </button>
            <button
              onClick={() => toggleChart("busRoutes")}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                chartVisibility.busRoutes
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600"
              }`}
            >
              <span className="text-xl">🚌</span>
              <span className="font-medium">Bus Routes</span>
              {chartVisibility.busRoutes && (
                <span className="text-xs bg-purple-200 px-2 py-1 rounded">
                  Visible
                </span>
              )}
            </button>
            <button
              onClick={() => toggleChart("transfers")}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                chartVisibility.transfers
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600"
              }`}
            >
              <span className="text-xl">🔄</span>
              <span className="font-medium">Transfers</span>
              {chartVisibility.transfers && (
                <span className="text-xs bg-orange-200 px-2 py-1 rounded">
                  Visible
                </span>
              )}
            </button>
            <button
              onClick={() => toggleChart("busNames")}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                chartVisibility.busNames
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600"
              }`}
            >
              <span className="text-xl">🏷️</span>
              <span className="font-medium">Bus Names</span>
              {chartVisibility.busNames && (
                <span className="text-xs bg-red-200 px-2 py-1 rounded">
                  Visible
                </span>
              )}
            </button>
            <button
              onClick={() => toggleChart("fareConfig")}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                chartVisibility.fareConfig
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600"
              }`}
            >
              <span className="text-xl">💰</span>
              <span className="font-medium">Fare Configuration</span>
              {chartVisibility.fareConfig && (
                <span className="text-xs bg-teal-200 px-2 py-1 rounded">
                  Visible
                </span>
              )}
            </button>
          </div>
        </div>
        {chartVisibility.userRegistration && (
          <StatisticsChart
            title="User Registration Statistics"
            data={userRegistrationStats}
            color="bg-blue-500"
            icon="👥"
            entityName="users"
            filters={userFilters}
            setFilters={setUserFilters}
          />
        )}

        {/* Bus Routes Chart */}
        {chartVisibility.busRoutes && (
          <StatisticsChart
            title="Bus Routes Statistics"
            data={busRouteStats}
            color="bg-purple-500"
            icon="🚌"
            entityName="bus routes"
            filters={busRouteFilters}
            setFilters={setBusRouteFilters}
          />
        )}

        {/* Bus Stops Chart */}
        {chartVisibility.busStops && (
          <StatisticsChart
            title="Bus Stops Statistics"
            data={busStopStats}
            color="bg-green-500"
            icon="🚏"
            entityName="bus stops"
            filters={busStopFilters}
            setFilters={setBusStopFilters}
          />
        )}

        {/* Transfers Chart */}
        {chartVisibility.transfers && (
          <StatisticsChart
            title="Transfer Statistics"
            data={transferStats}
            color="bg-orange-500"
            icon="🔄"
            entityName="transfers"
            filters={transferFilters}
            setFilters={setTransferFilters}
          />
        )}

        {/* Bus Names Chart */}
        {chartVisibility.busNames && (
          <StatisticsChart
            title="Bus Names Statistics"
            data={busNameStats}
            color="bg-red-500"
            icon="🏷️"
            entityName="bus names"
            filters={busNameFilters}
            setFilters={setBusNameFilters}
          />
        )}

        {/* Fare Configuration Chart */}
        {chartVisibility.fareConfig && (
          <StatisticsChart
            title="Fare Configuration Statistics"
            data={fareConfigStats}
            color="bg-teal-500"
            icon="💰"
            entityName="fare configurations"
            filters={fareConfigFilters}
            setFilters={setFareConfigFilters}
          />
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
