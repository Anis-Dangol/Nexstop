import React from "react";

const ImportBusNameModal = ({
  isOpen,
  onClose,
  onImport,
  onFileUpload,
  selectedFile,
  replaceExisting,
  onReplaceExistingChange,
  importLoading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Import Bus Names</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Import bus names from a JSON file. Ensure the file is in the correct
            format with "busname" and "stops" fields.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select JSON File
            </label>
            <input
              type="file"
              accept=".json"
              onChange={onFileUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="replaceExisting"
              checked={replaceExisting}
              onChange={(e) => onReplaceExistingChange(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="replaceExisting" className="text-sm text-gray-700">
              Replace existing data (clear all current bus names)
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onImport}
            disabled={!selectedFile || importLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {importLoading ? "Importing..." : "Import"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportBusNameModal;
