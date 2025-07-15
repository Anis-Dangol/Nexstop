import React from "react";

const TransferTable = ({
  sortedAndFilteredTransfers,
  transfers,
  selectedTransfers,
  selectAll,
  handleSelectAll,
  handleSelectTransfer,
  editingTransfer,
  editForm,
  handleEdit,
  handleInputChange,
  handleSaveEdit,
  handleCancelEdit,
  handleDelete,
  searchTerm,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left">
          <thead className="sticky top-0 bg-gray-50 z-50 border-b border-gray-200">
            <tr>
              <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50 w-12">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </th>
              <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                S.N.
              </th>
              <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                Transfer Name
              </th>
              <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                Transfer-1
              </th>
              <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                Transfer-2
              </th>
              <th className="py-3 px-6 font-semibold text-gray-700 bg-gray-50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedAndFilteredTransfers.map((transfer, index) => (
              <tr
                key={transfer.id}
                className={`hover:bg-gray-50 transition-colors ${
                  selectedTransfers.includes(transfer.id)
                    ? "bg-blue-50 border-blue-200"
                    : index % 2 === 0
                    ? "bg-white"
                    : "bg-gray-50/50"
                }`}
              >
                <td className="py-4 px-6">
                  <input
                    type="checkbox"
                    checked={selectedTransfers.includes(transfer.id)}
                    onChange={() => handleSelectTransfer(transfer.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-4 px-6 text-sm font-medium text-gray-900">
                  {transfer.number}
                </td>
                <td className="py-4 px-6 text-sm">
                  {editingTransfer === transfer.id ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Transfer name"
                    />
                  ) : (
                    <span className="font-medium text-gray-900">
                      {transfer.name}
                    </span>
                  )}
                </td>
                <td className="py-4 px-6 text-sm">
                  {editingTransfer === transfer.id ? (
                    <input
                      type="text"
                      value={editForm.transfer1}
                      onChange={(e) =>
                        handleInputChange("transfer1", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Transfer-1"
                    />
                  ) : (
                    <span className="text-gray-700">{transfer.transfer1}</span>
                  )}
                </td>
                <td className="py-4 px-6 text-sm">
                  {editingTransfer === transfer.id ? (
                    <input
                      type="text"
                      value={editForm.transfer2}
                      onChange={(e) =>
                        handleInputChange("transfer2", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Transfer-2"
                    />
                  ) : (
                    <span className="text-gray-700">{transfer.transfer2}</span>
                  )}
                </td>
                <td className="py-4 px-6">
                  {editingTransfer === transfer.id ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSaveEdit}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(transfer)}
                        disabled={editingTransfer !== null}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          editingTransfer !== null
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-yellow-500 hover:bg-yellow-600 text-white"
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(transfer)}
                        disabled={editingTransfer !== null}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          editingTransfer !== null
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
            ))}
          </tbody>
        </table>

        {sortedAndFilteredTransfers.length === 0 && transfers.length > 0 && (
          <div className="text-center py-12 text-gray-500">
            No transfers found matching "{searchTerm}".
          </div>
        )}

        {transfers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No transfer data found.
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferTable;
