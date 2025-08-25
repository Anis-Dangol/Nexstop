import React from "react";
import StopInputField from "./StopInputField";

const EditBusNameModal = ({
  isOpen,
  onClose,
  busName,
  onBusNameChange,
  onSave,
  onAddStop,
  // Stop management
  stops,
  onStopChange,
  onAddStopAfter,
  onRemoveStop,
  // Drag and drop
  draggedIndex,
  dragOverIndex,
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
      <div className="bg-white rounded-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Edit Bus Name</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-3">
              Bus Name *
            </label>
            <input
              type="text"
              placeholder="Enter bus name"
              value={busName}
              onChange={(e) => onBusNameChange(e.target.value)}
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-lg font-medium text-gray-700">
                Stops *
              </label>
              <button
                type="button"
                onClick={onAddStop}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-lg font-medium transition-colors"
              >
                + Add Stop
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
              {stops.map((stop, index) => (
                <StopInputField
                  key={index}
                  stop={stop}
                  index={index}
                  onStopChange={onStopChange}
                  onAddStopAfter={onAddStopAfter}
                  onRemoveStop={onRemoveStop}
                  draggedIndex={draggedIndex}
                  dragOverIndex={dragOverIndex}
                  onDragStart={onDragStart}
                  onDragEnd={onDragEnd}
                  onDragOver={onDragOver}
                  onDragEnter={onDragEnter}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  formType="edit"
                  totalStops={stops.length}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors text-lg"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-lg"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditBusNameModal;
