import React from "react";

// Static summary data
const stats = [
  { label: "Total Users", value: 120 },
  { label: "Total Bus Stops", value: 15 },
  { label: "Total Bus Routes", value: 7 },
];

// Static graph data (users registered per month)
const userGraphData = [
  { month: "Jan", users: 10 },
  { month: "Feb", users: 15 },
  { month: "Mar", users: 20 },
  { month: "Apr", users: 18 },
  { month: "May", users: 25 },
  { month: "Jun", users: 32 },
];

function AdminDashboard() {
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
            <div className="text-3xl font-bold text-blue-600">{stat.value}</div>
            <div className="text-gray-500 mt-2">{stat.label}</div>
          </div>
        ))}
      </div>
      {/* Users Registered Graph */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">
          Users Registered Per Month
        </h3>
        <div className="flex items-end h-40 space-x-2">
          {userGraphData.map((data) => (
            <div key={data.month} className="flex flex-col items-center flex-1">
              <div
                className="bg-blue-500 w-6 rounded-t"
                style={{ height: `${data.users * 3}px` }}
                title={`${data.users} users`}
              ></div>
              <span className="mt-1 text-xs text-gray-600">{data.month}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1 px-1 text-xs text-gray-400">
          {userGraphData.map((data) => (
            <span key={data.month}>{data.users}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
