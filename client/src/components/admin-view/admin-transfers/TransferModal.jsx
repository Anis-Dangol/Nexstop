import React from "react";

const TransferModal = ({
  showAddModal,
  closeAddModal,
  handleAddTransfer,
  newTransfer,
  setNewTransfer,
  submitLoading,
}) => {
  if (!showAddModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-600">
              Add New Transfer
            </h2>
            <button
              onClick={closeAddModal}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleAddTransfer}>
            {/* Transfer Basic Info */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTransfer.name}
                  onChange={(e) =>
                    setNewTransfer((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter transfer connection name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer-1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTransfer.transfer1}
                  onChange={(e) =>
                    setNewTransfer((prev) => ({
                      ...prev,
                      transfer1: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Transfer-1 stop name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer-2 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTransfer.transfer2}
                  onChange={(e) =>
                    setNewTransfer((prev) => ({
                      ...prev,
                      transfer2: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter Transfer-2 stop name"
                  required
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeAddModal}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={submitLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitLoading}
              >
                {submitLoading ? "Adding..." : "Add Transfer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TransferModal;
