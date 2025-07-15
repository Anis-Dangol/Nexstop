import React from "react";

const RouteCard = ({
  route,
  index,
  isSelected,
  sortOrder,
  draggedIndex,
  dragOverIndex,
  onSelectRoute,
  onEditRoute,
  onDeleteRoute,
  onRoutesDragStart,
  onRoutesDragOver,
  onRoutesDragEnter,
  onRoutesDragLeave,
  onRoutesDrop,
  onRoutesDragEnd,
}) => {
  const isDragDisabled = sortOrder !== "none";
  const isDragging = draggedIndex === index;
  const isDropTarget = dragOverIndex === index;

  return (
    <tr
      className={`routes-drag-container hover:bg-gray-50 transition-all duration-200 ${
        isDragDisabled ? "cursor-default" : "cursor-move"
      } ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} ${
        isDropTarget && !isDragDisabled
          ? "border-t-4 border-blue-500 shadow-lg transform scale-[1.02]"
          : ""
      } ${
        isDragging && !isDragDisabled
          ? "opacity-50 transform rotate-1 shadow-2xl"
          : ""
      }`}
      draggable={!isDragDisabled}
      onDragStart={
        !isDragDisabled ? (e) => onRoutesDragStart(e, index) : undefined
      }
      onDragOver={!isDragDisabled ? onRoutesDragOver : undefined}
      onDragEnter={
        !isDragDisabled ? (e) => onRoutesDragEnter(e, index) : undefined
      }
      onDragLeave={!isDragDisabled ? onRoutesDragLeave : undefined}
      onDrop={!isDragDisabled ? (e) => onRoutesDrop(e, index) : undefined}
      onDragEnd={!isDragDisabled ? onRoutesDragEnd : undefined}
      style={{
        transition: "all 0.2s ease",
        ...(isDragging &&
          !isDragDisabled && {
            transform: "rotate(2deg) scale(1.05)",
            zIndex: 1000,
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          }),
        ...(isDropTarget &&
          !isDragDisabled && {
            borderTopColor: "#3b82f6",
            borderTopWidth: "4px",
          }),
      }}
    >
      <td className="py-4 px-6 text-sm font-medium text-gray-900">
        <div className="flex items-center space-x-3">
          <div
            className={`drag-handle group p-1 rounded transition-colors ${
              !isDragDisabled
                ? "cursor-grab active:cursor-grabbing hover:bg-gray-200"
                : "cursor-not-allowed opacity-50"
            }`}
          >
            <svg
              className={`w-4 h-4 ${
                !isDragDisabled
                  ? "text-gray-400 group-hover:text-gray-600"
                  : "text-gray-300"
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M6 2a1 1 0 000 2h8a1 1 0 100-2H6zM6 7a1 1 0 000 2h8a1 1 0 100-2H6zM6 12a1 1 0 000 2h8a1 1 0 100-2H6zM6 17a1 1 0 000 2h8a1 1 0 100-2H6z" />
            </svg>
          </div>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelectRoute(route._id)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </td>
      <td className="py-4 px-6 text-sm font-medium text-gray-900">
        <span className="font-bold text-blue-600">{route.routeNumber}</span>
      </td>
      <td className="py-4 px-6 text-sm text-gray-900">{route.name}</td>
      <td className="py-4 px-6 text-sm text-gray-700">{route.totalStops}</td>
      <td className="py-4 px-6 text-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex space-x-2">
          <button
            onClick={() => onEditRoute(route)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDeleteRoute(route)}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
};

export default RouteCard;
