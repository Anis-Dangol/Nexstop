import React, { useEffect, useState } from "react";
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

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Admin Dashboard</h2>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow p-4 flex flex-col items-center"
          >
            <div
              className={`text-3xl font-bold ${
                isLoading ? "text-gray-400" : "text-blue-600"
              }`}
            >
              {stat.value}
            </div>
            <div className="text-gray-500 mt-2">{stat.label}</div>
          </div>
        ))}
      </div>
      {/* Users Registered Graph */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Users Registered{" "}
            {selectedMonth === "all" ? "Per Month" : "for Selected Month"} (
            {selectedYear})
          </h3>
          <div className="flex space-x-3">
            {/* Year Selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-600">Year:</label>
              <Select value={selectedYear} onValueChange={handleYearChange}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Year" />
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

            {/* Month Selector */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-600">
                Month:
              </label>
              <Select value={selectedMonth} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Month" />
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
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <span className="text-gray-400">Loading chart data...</span>
          </div>
        ) : userGraphData.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <span className="text-gray-400">
              No registration data available for {selectedYear}
              {selectedMonth !== "all" &&
                ` - ${
                  monthOptions.find((m) => m.value === selectedMonth)?.label
                }`}
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-end h-40 space-x-2">
              {userGraphData.map((data) => {
                const maxUsers = Math.max(...userGraphData.map((d) => d.users));
                const heightRatio =
                  maxUsers > 0 ? (data.users / maxUsers) * 120 : 0;
                return (
                  <div
                    key={`${data.month || data.day || data.date}`}
                    className="flex flex-col items-center flex-1"
                  >
                    <div
                      className="bg-blue-500 w-6 rounded-t min-h-[4px]"
                      style={{ height: `${Math.max(heightRatio, 4)}px` }}
                      title={`${data.users} users`}
                    ></div>
                    <span className="mt-1 text-xs text-gray-600">
                      {selectedMonth === "all"
                        ? data.month
                        : data.day || data.date}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-1 px-1 text-xs text-gray-400">
              {userGraphData.map((data) => (
                <span key={`count-${data.month || data.day || data.date}`}>
                  {data.users}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
