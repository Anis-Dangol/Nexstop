import React from "react";

function AdminBusStops() {
  // Placeholder data
  const busStops = [
    { id: 1, name: "Central Station", location: "Downtown" },
    { id: 2, name: "North Avenue", location: "Uptown" },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-700">Bus Stops</h2>
      <table className="min-w-full text-left">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Location</th>
          </tr>
        </thead>
        <tbody>
          {busStops.map((stop) => (
            <tr key={stop.id}>
              <td className="py-2 px-4 border-b">{stop.id}</td>
              <td className="py-2 px-4 border-b">{stop.name}</td>
              <td className="py-2 px-4 border-b">{stop.location}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminBusStops;
