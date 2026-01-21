"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";

const Table = ({ data = [], columns = [], itemsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const router = useRouter();

  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const totalPages = Math.max(1, Math.ceil(safeData.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = safeData.slice(indexOfFirstItem, indexOfLastItem);

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
      <div className="relative overflow-x-auto min-h-100">
        <table className="text-left border-collapse min-w-250 w-full overflow-y-auto">
          <thead>
            <tr className="text-gray-500 text-base border-b border-gray-100 bg-gray-50/50 *:p-4 lg:*:py-6 *:font-medium truncate">
              {columns.map((col, idx) => (
                <th key={idx} className={col.className || ""}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50 bg-white">
            {currentItems.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-6 text-center text-gray-400 text-sm"
                >
                  No data found
                </td>
              </tr>
            ) : (
              currentItems.map((item, rowIndex) => {
                const linkId = item?.id ?? item?.order_info?.id ?? item?.product?.id ?? null;
                const rowKey = linkId ?? rowIndex;
                return (
                  <tr
                    key={rowKey}
                    className={`hover:bg-gray-50 transition-colors ${linkId ? 'cursor-pointer' : ''}`}
                    onClick={linkId ? () => router.push(`/dashboard/products_manage/${linkId}`) : undefined}
                    role={linkId ? 'button' : undefined}
                    tabIndex={linkId ? 0 : undefined}
                    onKeyDown={linkId ? (e) => { if (e.key === 'Enter') router.push(`/dashboard/products_manage/${linkId}`); } : undefined}
                  >
                    {columns.map((col, colIndex) => (
                      <td
                        key={colIndex}
                        className={`p-4 text-sm ${col.cellClassName || ""}`}
                      >
                        {col.render
                          ? col.render(item ?? {}, rowIndex, {
                              openDropdownId,
                              setOpenDropdownId,
                            })
                          : (item?.[col.key] ?? "-")}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap justify-center md:justify-end mt-6 gap-2 pb-4">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
        </div>

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
