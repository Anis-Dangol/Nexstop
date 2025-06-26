import React from "react";

function AdminBusRoutes() {
  // Placeholder data
  const busRoutes = [
    { id: 1, name: "Route 1", from: "Central Station", to: "North Avenue" },
    { id: 2, name: "Route 2", from: "East Park", to: "West End" },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-700">Bus Routes</h2>
      <table className="min-w-full text-left">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">From</th>
            <th className="py-2 px-4 border-b">To</th>
          </tr>
        </thead>
        <tbody>
          {busRoutes.map((route) => (
            <tr key={route.id}>
              <td className="py-2 px-4 border-b">{route.id}</td>
              <td className="py-2 px-4 border-b">{route.name}</td>
              <td className="py-2 px-4 border-b">{route.from}</td>
              <td className="py-2 px-4 border-b">{route.to}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminBusRoutes;
