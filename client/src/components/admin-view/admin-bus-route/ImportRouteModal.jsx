import React from "react";

const ImportRouteModal = ({
  isOpen,
  onClose,
  selectedFile,
  replaceExisting,
  setReplaceExisting,
  importLoading,
  onFileSelect,
  onImportRoutes,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-blue-600">
            Import Bus Routes
          </h2>
          <p className="text-sm text-gray-500">
            Import bus routes from a JSON file. Ensure the file is in the
            correct format.
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select JSON File:
          </label>
          <input
            type="file"
            accept=".json"
            onChange={onFileSelect}
            className="w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={replaceExisting}
              onChange={(e) => setReplaceExisting(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              Replace existing routes with the same number
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onImportRoutes}
            disabled={importLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed"
          >
            {importLoading ? "Importing..." : "Import Routes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportRouteModal;
