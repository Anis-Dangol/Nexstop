import React from "react";
import RouteStopInputField from "./RouteStopInputField";

const EditRouteModal = ({
  isOpen,
  onClose,
  editRoute,
  setEditRoute,
  submitLoading,
  draggedIndex,
  dragOverIndex,
  onSubmit,
  onAutoRouteNumber,
  onAddStopAfter,
  onRemoveStop,
  onUpdateStop,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-600">Edit Route</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={onSubmit}>
            {/* Route Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Route Number:
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={editRoute.routeNumber}
                    onChange={(e) =>
                      setEditRoute((prev) => ({
                        ...prev,
                        routeNumber: e.target.value,
                      }))
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1"
                    required
                  />
                  <button
                    type="button"
                    onClick={onAutoRouteNumber}
                    className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
                    title="Auto-generate next available route number"
                  >
                    Auto
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Route Name:
                </label>
                <input
                  type="text"
                  value={editRoute.name}
                  onChange={(e) =>
                    setEditRoute((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ratnapark and Kirtipur"
                  required
                />
              </div>
            </div>

            {/* Bus Stops Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-blue-600">Bus Stops</h3>
                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  💡 Drag the ⋮⋮ button to reorder stops
                </div>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                {editRoute.stops.map((stop, index) => (
                  <RouteStopInputField
                    key={index}
                    stop={stop}
                    index={index}
                    formType="edit"
                    draggedIndex={draggedIndex}
                    dragOverIndex={dragOverIndex}
                    onUpdateStop={onUpdateStop}
                    onAddStopAfter={onAddStopAfter}
                    onRemoveStop={onRemoveStop}
                    onDragStart={onDragStart}
                    onDragEnd={onDragEnd}
                    onDragOver={onDragOver}
                    onDragEnter={onDragEnter}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    totalStops={editRoute.stops.length}
                  />
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {submitLoading ? "Updating Route..." : "Update Route"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditRouteModal;
