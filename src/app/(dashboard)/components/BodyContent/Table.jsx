"use client";

import { useState } from "react";

const Table = ({ data = [], columns = [], itemsPerPage }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // --- Pagination Logic ---
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const MAX_VISIBLE_PAGES = 5;
  const getVisiblePages = () => {
    let start = Math.max(currentPage - Math.floor(MAX_VISIBLE_PAGES / 2), 1);
    let end = start + MAX_VISIBLE_PAGES - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - MAX_VISIBLE_PAGES + 1, 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="w-full text-dark">
      <div className="relative overflow-x-auto min-h-137.5">
        <table className="text-left border-collapse min-w-250 w-full">
          <thead>
            <tr className="text-gray-500 text-sm border-b border-gray-100 bg-gray-50/50 *:p-4 *:font-medium truncate">
              {columns.map((col, idx) => (
                <th key={idx} className={col.className || ""}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 bg-white">
            {currentItems.map((item, rowIndex) => (
              <tr
                key={item.id || rowIndex}
                className="hover:bg-gray-50 transition-colors"
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={colIndex}
                    className={`p-4 text-sm ${col.cellClassName || ""}`}
                  >
                    {/* If a custom render function is provided, use it, otherwise show raw data */}
                    {col.render
                      ? col.render(item, rowIndex, {
                          openDropdownId,
                          setOpenDropdownId,
                        })
                      : item[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination (Your Exact Design) */}
      <div className="flex flex-wrap justify-center md:justify-end mt-6 gap-2 pb-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-md transition-all ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
          }`}
        >
          <span className="text-xs font-medium">Prev</span>
        </button>

        <div className="flex gap-1">
          {getVisiblePages()[0] > 1 && (
            <button className="w-9 h-9 md:w-10 md:h-10 rounded-md border bg-white text-gray-500 hover:bg-gray-50">
              ...
            </button>
          )}
          {getVisiblePages().map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 md:w-10 md:h-10 rounded-md text-sm font-medium border transition-colors ${
                currentPage === page
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
          {getVisiblePages().slice(-1)[0] < totalPages && (
            <button className="w-9 h-9 md:w-10 md:h-10 rounded-md border bg-white text-gray-500 hover:bg-gray-50">
              ...
            </button>
          )}
        </div>

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-md transition-all ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm"
          }`}
        >
          <span className="text-xs font-medium">Next</span>
        </button>
      </div>
    </div>
  );
};

export default Table;
