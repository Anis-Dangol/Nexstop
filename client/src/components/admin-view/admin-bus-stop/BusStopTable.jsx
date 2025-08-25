import React from "react";
import BusStopRow from "./BusStopRow";

const BusStopTable = ({
  busStops,
  searchTerm,
  editingStop,
  editForm,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onInputChange,
  formatCoordinate,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="sticky top-0 bg-gray-50 z-50 border-b border-gray-200">
            <tr>
              <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                ID
              </th>
              <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                Bus Stop Name
              </th>
              <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                Latitude
              </th>
              <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                Longitude
              </th>
              <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {busStops.map((stop, index) => (
              <BusStopRow
                key={stop.id}
                stop={stop}
                index={index}
                editingStop={editingStop}
                editForm={editForm}
                onEdit={onEdit}
                onSave={onSave}
                onCancel={onCancel}
                onDelete={onDelete}
                onInputChange={onInputChange}
                formatCoordinate={formatCoordinate}
              />
            ))}
          </tbody>
        </table>

        {busStops.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm.trim()
              ? `No bus stops found matching "${searchTerm}".`
              : "No bus stops found in the routes data."}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusStopTable;
