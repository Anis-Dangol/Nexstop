import React from "react";

const UserPagination = ({
  totalPages,
  currentPage,
  goToPage,
  setCurrentPage,
  setDateSort,
  setSelectedYear,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6 px-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-300 hover:bg-gray-400 text-gray-700"
          }`}
        >
          Previous
        </button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((page) => {
            // Show first page, last page, current page, and pages around current
            return (
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 1
            );
          })
          .map((page, index, array) => {
            // Add ellipsis if there's a gap
            const showEllipsis = index > 0 && page - array[index - 1] > 1;

            return (
              <React.Fragment key={page}>
                {showEllipsis && (
                  <span className="px-2 text-gray-400">...</span>
                )}
                <button
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    page === currentPage
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  {page}
                </button>
              </React.Fragment>
            );
          })}

        {/* Next Button */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded text-sm transition-colors ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-300 hover:bg-gray-400 text-gray-700"
          }`}
        >
          Next
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Go to page:</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={currentPage}
          onChange={(e) => {
            const page = parseInt(e.target.value);
            if (page >= 1 && page <= totalPages) {
              goToPage(page);
            }
          }}
          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
};

export default UserPagination;
