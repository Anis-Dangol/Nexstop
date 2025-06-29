import React, { useState } from "react";

function AdminBusRoutes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("none");

  // Placeholder data - replace with actual data from your routes.json
  const busRoutes = [
    {
      id: 1,
      routeNumber: 1,
      name: "Kalanki to Lagankhel",
      color: "blue",
      totalStops: 14,
      status: "Active",
    },
    {
      id: 2,
      routeNumber: 2,
      name: "Koteshwor to Ratna Park",
      color: "red",
      totalStops: 18,
      status: "Active",
    },
    {
      id: 3,
      routeNumber: 3,
      name: "Kirtipur to New Baneshwor",
      color: "green",
      totalStops: 22,
      status: "Maintenance",
    },
    {
      id: 4,
      routeNumber: 4,
      name: "Thankot to Bhaktapur",
      color: "orange",
      totalStops: 16,
      status: "Active",
    },
  ];

  // Filter routes based on search term
  const filteredRoutes = busRoutes.filter(
    (route) =>
      route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.routeNumber.toString().includes(searchTerm)
  );

  // Sort routes
  const sortedRoutes = [...filteredRoutes].sort((a, b) => {
    if (sortOrder === "asc") return a.name.localeCompare(b.name);
    if (sortOrder === "desc") return b.name.localeCompare(a.name);
    return 0;
  });

  return (
    <div className="w-full bg-gray-50 min-h-screen p-2">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Bus Routes
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                + Add New Route
              </button>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                📥 Import Routes
              </button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Routes
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by route name or number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort by Name
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="none">No Sort</option>
                <option value="asc">A-Z</option>
                <option value="desc">Z-A</option>
              </select>
            </div>
            <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
              Showing {sortedRoutes.length} of {busRoutes.length} routes
            </div>
          </div>
        </div>

        {/* Routes Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                    S.N.
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                    Route Name
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                    Color
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                    Total Stops
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedRoutes.map((route, index) => (
                  <tr
                    key={route.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="py-4 px-6 text-sm font-medium text-gray-900">
                      {route.routeNumber}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-900">
                      {route.name}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border-2 border-white shadow-sm`}
                          style={{ backgroundColor: route.color }}
                        ></div>
                        <span className="text-gray-700 capitalize">
                          {route.color}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-700">
                      {route.totalStops}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          route.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {route.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <div className="flex space-x-2">
                        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors">
                          Edit
                        </button>
                        <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedRoutes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {searchTerm
                  ? `No routes found matching "${searchTerm}"`
                  : "No routes available"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminBusRoutes;
