import React from "react";

const DashboardStats = ({ stats, isLoading }) => {
  return (
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
  );
};

export default DashboardStats;
