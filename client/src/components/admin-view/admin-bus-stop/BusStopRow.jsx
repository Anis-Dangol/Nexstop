import React from "react";

const BusStopRow = ({
  stop,
  index,
  editingStop,
  editForm,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onInputChange,
  formatCoordinate,
}) => {
  const isEditing = editingStop === stop.id;

  return (
    <tr
      className={`hover:bg-gray-50 transition-colors ${
        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
      }`}
    >
      <td className="py-4 px-6 text-sm font-medium text-gray-900">{stop.id}</td>
      <td className="py-4 px-6 text-sm">
        {isEditing ? (
          <input
            type="text"
            value={editForm.name}
            onChange={(e) => onInputChange("name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Bus stop name"
          />
        ) : (
          <span className="font-medium text-gray-900">{stop.name}</span>
        )}
      </td>
      <td className="py-4 px-6 text-sm text-gray-700 font-mono">
        {isEditing ? (
          <input
            type="number"
            step="0.000001"
            value={editForm.latitude}
            onChange={(e) => onInputChange("latitude", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
            placeholder="Latitude"
          />
        ) : (
          formatCoordinate(stop.latitude)
        )}
      </td>
      <td className="py-4 px-6 text-sm text-gray-700 font-mono">
        {isEditing ? (
          <input
            type="number"
            step="0.000001"
            value={editForm.longitude}
            onChange={(e) => onInputChange("longitude", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
            placeholder="Longitude"
          />
        ) : (
          formatCoordinate(stop.longitude)
        )}
      </td>
      <td className="py-4 px-6">
        {isEditing ? (
          <div className="flex space-x-2">
            <button
              onClick={onSave}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Save
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(stop)}
              disabled={editingStop !== null}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                editingStop !== null
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-yellow-500 hover:bg-yellow-600 text-white"
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(stop.id)}
              disabled={editingStop !== null}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                editingStop !== null
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600 text-white"
              }`}
            >
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default BusStopRow;
