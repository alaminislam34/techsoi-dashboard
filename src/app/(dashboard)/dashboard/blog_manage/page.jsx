"use client";

import React, { useState } from "react";
import { Eye, Trash2, Search, ChevronDown, Loader2 } from "lucide-react";
import Table from "../../components/BodyContent/Table";
import Link from "next/link";
import { BLOG_API, BLOG_SINGLE_API } from "@/api/apiEndPoint";
import toast from "react-hot-toast";
import apiService from "@/api/api";
import Swal from "sweetalert2";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BlogManage = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState("");

  // ১. ব্লগ ফেচ করা (TanStack Query)
  const { data: blogs = [], isLoading } = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const res = await apiService.get(BLOG_API);
      return res.data.data || res.data;
    },
    onError: () => toast.error("Failed to fetch blogs"),
  });

  // ২. ব্লগ ডিলিট করা (TanStack Mutation)
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await apiService.delete(`${BLOG_SINGLE_API(id)}`);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.status) {
        Swal.fire({
          title: "Deleted!",
          text: "The blog has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        // ডিলিট সফল হলে লিস্ট রি-ফেচ করবে
        queryClient.invalidateQueries(["blogs"]);
      }
    },
    onError: (error) => {
      Swal.fire({
        title: "Error!",
        text:
          error.response?.data?.message ||
          "Something went wrong while deleting.",
        icon: "error",
      });
    },
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Delete!",
      cancelButtonText: "No, cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  // ৩. সর্টিং এবং ফিল্টারিং লজিক
  const getSortedData = () => {
    let sortedData = [...blogs];
    if (sortConfig === "title") {
      sortedData.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortConfig === "status") {
      sortedData.sort((a, b) => b.status - a.status);
    } else if (sortConfig === "newest") {
      sortedData.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at),
      );
    }
    return sortedData;
  };

  const filteredData = getSortedData().filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const columns = [
    {
      header: "Blog Info",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-10 bg-[#F2F4F7] rounded shrink-0 overflow-hidden border border-gray-100">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-dark text-sm font-medium line-clamp-1 max-w-xs">
              {item.title}
            </span>
            <span className="text-xs text-gray-400">{item.created_at}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Short Description",
      render: (item) => (
        <p className="text-sm text-gray-500 line-clamp-1 max-w-md">
          {item.short_description}
        </p>
      ),
    },
    {
      header: "Status",
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
            item.status === 1
              ? "bg-green-100 text-green-600"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {item.status === 1 ? "Published" : "Draft"}
        </span>
      ),
    },
    {
      header: "Action",
      className: "text-center",
      render: (item) => (
        <div className="flex items-center justify-center gap-4">
          <Link
            href={`/dashboard/blog_manage/`}
            className="text-primary hover:opacity-80"
          >
            <Eye size={18} />
          </Link>
          <button
            onClick={() => handleDelete(item.id)}
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
              placeholder="Search by title..."
              className="w-full pl-10 pr-4 py-2 bg-secondary/30 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative group">
            <button className="flex items-center truncate gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 capitalize">
              {sortConfig ? `Sort by: ${sortConfig}` : "Sort By"}{" "}
              <ChevronDown size={16} />
            </button>
            <div className="absolute right-0 w-40 bg-white border border-gray-100 rounded-lg shadow-xl hidden group-hover:block z-50">
              {["title", "status", "newest"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSortConfig(type)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-secondary/20 capitalize"
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : (
          <Table data={filteredData} columns={columns} itemsPerPage={10} />
        )}
      </div>
    </div>
  );
};

export default BlogManage;
