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
import DashboardHeader from "../../components/admin-view/admin-dashboard/DashboardHeader";
import DashboardStats from "../../components/admin-view/admin-dashboard/DashboardStats";
import ChartToggleControls from "../../components/admin-view/admin-dashboard/ChartToggleControls";
import StatisticsChart from "../../components/admin-view/admin-dashboard/StatisticsChart";

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

  return (
    <div className="w-full bg-gray-50 min-h-screen p-3 pb-8">
      <div className="max-w-7xl mx-auto">
        <DashboardHeader />

        <DashboardStats stats={stats} isLoading={isLoading} />

        <ChartToggleControls
          chartVisibility={chartVisibility}
          setChartVisibility={setChartVisibility}
          toggleChart={toggleChart}
        />

        {chartVisibility.userRegistration && (
          <StatisticsChart
            title="User Registration Statistics"
            data={userRegistrationStats}
            color="bg-blue-500"
            icon="👥"
            entityName="users"
            filters={userFilters}
            setFilters={setUserFilters}
            isLoading={isLoading}
          />
        )}

        {chartVisibility.busRoutes && (
          <StatisticsChart
            title="Bus Routes Statistics"
            data={busRouteStats}
            color="bg-purple-500"
            icon="🚌"
            entityName="bus routes"
            filters={busRouteFilters}
            setFilters={setBusRouteFilters}
            isLoading={isLoading}
          />
        )}

        {chartVisibility.busStops && (
          <StatisticsChart
            title="Bus Stops Statistics"
            data={busStopStats}
            color="bg-green-500"
            icon="🚏"
            entityName="bus stops"
            filters={busStopFilters}
            setFilters={setBusStopFilters}
            isLoading={isLoading}
          />
        )}

        {chartVisibility.transfers && (
          <StatisticsChart
            title="Transfer Statistics"
            data={transferStats}
            color="bg-orange-500"
            icon="🔄"
            entityName="transfers"
            filters={transferFilters}
            setFilters={setTransferFilters}
            isLoading={isLoading}
          />
        )}

        {chartVisibility.busNames && (
          <StatisticsChart
            title="Bus Names Statistics"
            data={busNameStats}
            color="bg-red-500"
            icon="🏷️"
            entityName="bus names"
            filters={busNameFilters}
            setFilters={setBusNameFilters}
            isLoading={isLoading}
          />
        )}

        {chartVisibility.fareConfig && (
          <StatisticsChart
            title="Fare Configuration Statistics"
            data={fareConfigStats}
            color="bg-teal-500"
            icon="💰"
            entityName="fare configurations"
            filters={fareConfigFilters}
            setFilters={setFareConfigFilters}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
