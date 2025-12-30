"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
// JSON data import
import productsData from "@/app/FakeData/products.json";

const Table = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // --- Pagination Logic ---
  const itemsPerPage = 7; // Ekta page-e koita data dekhabe
  const totalPages = Math.ceil(productsData.length / itemsPerPage);

  // Current page-er data slice kora
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = productsData.slice(indexOfFirstItem, indexOfLastItem);

  const getStatusStyles = (status) => {
    switch (status) {
      case "Cancelled":
        return "text-primary_red border-primary_red bg-red-50";
      case "Pending":
        return "text-orange-500 border-orange-500 bg-orange-50";
      case "Delivered":
        return "text-green-600 border-green-600 bg-green-50";
      default:
        return "text-primary border-primary bg-secondary";
    }
  };

  const handleStatusChange = (orderId, newStatus) => {
    console.log(`Updating Order ${orderId} to ${newStatus}`);
    setOpenDropdownId(null);
  };

  const statusOptions = ["New Order", "Pending", "Delivered", "Cancelled"];

  return (
    <div className="w-full text-dark">
      <div className="overflow-x-auto min-h-137.5">
        {" "}
        {/* Height fixed jate pagination jump na kore */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-500 text-sm border-b border-gray-100">
              <th className="p-4 font-medium">Order ID</th>
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Qty</th>
              <th className="p-4 font-medium">Discount</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Action</th>
              <th className="p-4 font-medium">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentItems.map((item, index) => (
              <tr
                key={item.order_info.id}
                className="hover:bg-gray-100 ring ring-gray-200 transition-colors"
              >
                <td className="p-4 text-sm font-medium">
                  {item.order_info.id}
                </td>
                <td className="p-4 text-sm flex items-center gap-3">
                  <img
                    src={item.product.image_url}
                    alt=""
                    className="w-10 h-10 bg-gray-100 rounded-md shrink-0 object-cover"
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/40")
                    }
                  />
                  <span className="truncate max-w-62">{item.product.name}</span>
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {item.product.category}
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {item.product.quantity}
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {item.order_info.discount || "0%"}
                </td>
                <td className="p-4 text-sm text-gray-600">
                  {item.product.net_price} {item.product.currency}
                </td>
                <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                  {item.customer.name}
                </td>
                <td className="p-4 relative">
                  <button
                    onClick={() =>
                      setOpenDropdownId(openDropdownId === index ? null : index)
                    }
                    className={`flex items-center justify-between w-32 px-3 py-2 border rounded-md text-xs font-medium transition-all ${getStatusStyles(
                      item.order_info.status
                    )}`}
                  >
                    {item.order_info.status}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${
                        openDropdownId === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {openDropdownId === index && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setOpenDropdownId(null)}
                      />
                      <div
                        className={`absolute left-4 w-32 bg-white border border-gray-200 rounded-md shadow-xl z-50 py-1 
                        ${index < 4 ? "top-full mt-1" : "bottom-full mb-1"}`}
                      >
                        {statusOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() =>
                              handleStatusChange(item.order_info.id, option)
                            }
                            className="w-full text-left px-3 py-2 text-xs hover:bg-secondary hover:text-primary transition-colors text-dark"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </td>
                <td className="p-4">
                  <Link
                    href={`/dashboard/${item.order_info.id}`}
                    className="text-primary w-full flex items-center justify-center border border-primary/20 bg-secondary px-4 py-2 rounded-md text-xs font-medium hover:bg-primary hover:text-white transition-all"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Container */}
      <div className="flex justify-end mt-6 gap-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-md transition-all ${
            currentPage === 1
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span className="text-xs font-medium">Prev</span>
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`w-10 h-10 rounded-md text-sm font-medium border transition-colors ${
              currentPage === page
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        ))}

        {totalPages > 6 && (
          <button className="w-10 h-10 rounded-md border border-gray-200 bg-white flex items-center justify-center text-gray-400">
            --
          </button>
        )}

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-md transition-all ${
            currentPage === totalPages
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <span className="text-xs font-medium">Next</span>
        </button>
      </div>
    </div>
  );
};

export default Table;
