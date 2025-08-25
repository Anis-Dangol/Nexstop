import React from "react";

const RouteStopInputField = ({
  stop,
  index,
  formType,
  draggedIndex,
  dragOverIndex,
  onUpdateStop,
  onAddStopAfter,
  onRemoveStop,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  totalStops,
}) => {
  const isDragging = draggedIndex === index;
  const isDropTarget = dragOverIndex === index;

  return (
    <div key={index}>
      {/* Drop zone before each item */}
      <div
        className={`h-3 transition-all duration-200 flex items-center justify-center ${
          draggedIndex !== null && draggedIndex !== index && isDropTarget
            ? "bg-green-300 rounded-full opacity-100"
            : "opacity-0"
        }`}
        onDragOver={onDragOver}
        onDragEnter={(e) => onDragEnter(e, index)}
        onDragLeave={onDragLeave}
        onDrop={(e) => onDrop(e, index, formType)}
      >
        {draggedIndex !== null && draggedIndex !== index && isDropTarget && (
          <span className="text-xs text-green-700 font-medium">Drop here</span>
        )}
      </div>

      <div
        className={`drag-container flex items-center gap-4 p-3 rounded-lg transition-all duration-200 ${
          isDragging
            ? "bg-blue-100 opacity-60 transform scale-95 border-2 border-blue-400 shadow-lg"
            : "bg-white border-2 border-transparent hover:bg-gray-50 shadow-sm"
        }`}
      >
        {/* Stop Number */}
        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full text-lg font-bold">
          {index + 1}
        </div>

        {/* Add and Drag Controls */}
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => onAddStopAfter(index, formType)}
            className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-green-600 transition-colors"
            title="Add new stop after this one"
          >
            +
          </button>
          <div
            draggable="true"
            onDragStart={(e) => onDragStart(e, index)}
            onDragEnd={onDragEnd}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm cursor-grab active:cursor-grabbing transition-all duration-200 select-none ${
              isDragging
                ? "bg-blue-500 text-white shadow-lg transform scale-110"
                : "bg-gray-300 text-gray-600 hover:bg-gray-400 hover:text-gray-700 hover:scale-105"
            }`}
            title="Drag to reorder stops"
          >
            <span className="text-sm font-bold">⋮⋮</span>
          </div>
        </div>

        {/* Stop Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bus Stop Name (Stop #{index + 1})
            </label>
            <input
              type="text"
              value={stop.name}
              onChange={(e) =>
                onUpdateStop(index, "name", e.target.value, formType)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={index === 0 ? "Ratnapark" : "Enter Busstop Name"}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="text"
              step="any"
              value={stop.lat}
              onChange={(e) =>
                onUpdateStop(index, "lat", e.target.value, formType)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={
                index === 0 ? "27.7025617421252824" : "Enter Latitude"
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="text"
              step="any"
              value={stop.lon}
              onChange={(e) =>
                onUpdateStop(index, "lon", e.target.value, formType)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={
                index === 0 ? "85.31361099960553" : "Enter Longitude"
              }
              required
            />
          </div>
        </div>

        {/* Remove Button */}
        {totalStops > 1 && (
          <button
            type="button"
            onClick={() => onRemoveStop(index, formType)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-3 rounded text-sm font-medium transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Drop zone after the last item */}
      {index === totalStops - 1 && (
        <div
          className={`h-3 transition-all duration-200 flex items-center justify-center ${
            draggedIndex !== null && dragOverIndex === totalStops
              ? "bg-green-300 rounded-full opacity-100"
              : "opacity-0"
          }`}
          onDragOver={onDragOver}
          onDragEnter={(e) => onDragEnter(e, totalStops)}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, totalStops, formType)}
        >
          {draggedIndex !== null && dragOverIndex === totalStops && (
            <span className="text-xs text-green-700 font-medium">
              Drop here
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default RouteStopInputField;
