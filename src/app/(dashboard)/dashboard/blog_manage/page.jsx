"use client";

import React, { useState, useEffect } from "react";
import { Eye, Trash2, Search, ChevronDown } from "lucide-react";
import productsData from "@/app/FakeData/products.json";
import Table from "../../components/BodyContent/Table";
import Link from "next/link";

const BlogManage = () => {
  const [data, setData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState(""); // সর্টিং অপশন সেভ করার জন্য

  useEffect(() => {
    setData(productsData);
  }, []);

  // --- Delete Logic ---
  const handleDelete = (id) => {
    const filteredData = data.filter((item) => item.order_info.id !== id);
    setData(filteredData);
  };

  // --- Sorting Logic ---
  const handleSort = (type) => {
    setSortConfig(type);
    let sortedData = [...data];

    if (type === "name") {
      sortedData.sort((a, b) => a.product.name.localeCompare(b.product.name));
    } else if (type === "rating") {
      sortedData.sort((a, b) => b.review.rating - a.review.rating); // High to Low
    } else if (type === "newest") {
      sortedData.sort(
        (a, b) =>
          new Date(b.order_info.order_date) - new Date(a.order_info.order_date)
      );
    }

    setData(sortedData);
  };

  // --- Filtered Data (Search + Sorting handled) ---
  const filteredData = data.filter(
    (item) =>
      item.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      header: "Product",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F2F4F7] rounded shrink-0 overflow-hidden border border-gray-100">
            <img
              src={item.product.image_url}
              alt={item.product.name}
              className="w-full h-full object-contain p-1"
            />
          </div>
          <span className="text-dark text-sm font-normal line-clamp-1 max-w-62.5">
            {item.product.name}
          </span>
        </div>
      ),
    },
    {
      header: "Customer",
      render: (item) => (
        <span className="text-sm text-dark font-medium">
          {item.customer.name}
        </span>
      ),
    },
    {
      header: "Rating",
      render: (item) => (
        <div className="flex items-center gap-1 text-sm font-medium">
          {item.review.rating}
          <span className="text-yellow-400">★</span>
        </div>
      ),
    },
    {
      header: "Review",
      render: (item) => (
        <p className="text-sm text-gray-500 line-clamp-1 max-w-87.5">
          {item.review.feedback_bn}
        </p>
      ),
    },
    {
      header: "Action",
      className: "text-center",
      render: (item) => (
        <div className="flex items-center justify-center gap-4">
          <button className="text-primary hover:opacity-80 transition-opacity">
            <Eye size={18} />
          </button>
          <button
            onClick={() => handleDelete(item.order_info.id)}
            className="text-primary_red hover:scale-110 transition-transform"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-6 p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 lg:mt-0">
        <Link
          href={"/dashboard/blog_manage/add_blog"}
          className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium shadow-sm hover:opacity-90 transition-all w-fit"
        >
          Publish New Blog
        </Link>

        <div className="flex items-center gap-4 flex-1 md:max-w-2xl justify-end">
          <div className="relative w-full max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search Blogs"
              className="w-full pl-10 pr-4 py-2 bg-secondary/30 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* --- Updated Sort Dropdown --- */}
          <div className="relative group">
            <button className="flex items-center truncate gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 capitalize">
              {sortConfig ? `Sort by: ${sortConfig}` : "Sort By"}{" "}
              <ChevronDown size={16} />
            </button>

            {/* Simple CSS Dropdown on Hover/Click */}
            <div className="absolute right-0 w-40 bg-white border border-gray-100 rounded-lg shadow-xl hidden group-hover:block z-50">
              <button
                onClick={() => handleSort("name")}
                className="w-full text-left px-4 py-2 text-sm hover:bg-secondary/20 transition-colors"
              >
                Name
              </button>
              <button
                onClick={() => handleSort("rating")}
                className="w-full text-left px-4 py-2 text-sm hover:bg-secondary/20 transition-colors"
              >
                Rating
              </button>
              <button
                onClick={() => handleSort("newest")}
                className="w-full text-left px-4 py-2 text-sm hover:bg-secondary/20 transition-colors"
              >
                Newest
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <Table data={filteredData} columns={columns} itemsPerPage={10} />
      </div>
    </div>
  );
};

export default BlogManage;
