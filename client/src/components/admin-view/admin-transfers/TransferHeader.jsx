import React from "react";

const TransferHeader = ({
  setShowAddModal,
  handleFileImport,
  exportTransfersToJSON,
  selectedTransfers,
  handleBulkDelete,
  bulkDeleteLoading,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-2 mb-2 border border-gray-200">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Bus Transfers
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            + Add New Transfer
          </button>
          <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 cursor-pointer">
            📤 Import Transfers
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
          <button
            onClick={exportTransfersToJSON}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            📥 Export Transfers
          </button>
          {selectedTransfers.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleteLoading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              title={`Delete ${selectedTransfers.length} selected transfer${
                selectedTransfers.length > 1 ? "s" : ""
              }`}
            >
              {bulkDeleteLoading
                ? "Deleting..."
                : `🗑️ Delete ${selectedTransfers.length}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferHeader;
