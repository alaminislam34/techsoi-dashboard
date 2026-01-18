"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Table from "@/app/(dashboard)/components/BodyContent/Table";
import {
  Eye,
  Edit3,
  Trash2,
  EyeOff,
  Search,
  ChevronDown,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Link from "next/link";
import { PRODUCT_API } from "@/api/apiEndPoint";
import apiService from "@/api/api";

const ProductsManage = () => {
  const queryClient = useQueryClient();

  // --- 1. Fetch Products using useQuery ---
  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await apiService.get(PRODUCT_API);

      // Data Formatting logic remains same
      if (res.data?.status === true && Array.isArray(res.data.data)) {
        return res.data.data.map((product) => ({
          product: {
            id: product.id,
            name: product.name,
            image_url: product.main_image,
            category: product.category_id,
            quantity: product.stock,
            net_price: product.sale_price,
          },
          order_info: {
            id: product.id,
            discount: "10%",
          },
        }));
      }
      return [];
    },
  });

  // --- 2. Delete Mutation ---
  const deleteMutation = useMutation({
    mutationFn: (id) => apiService.delete(`${PRODUCT_API}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.error("Product has been deleted.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  // --- Action Handlers ---
  const handleToggleVisibility = (id) => {
    toast.success(`Product visibility updated`, {
      icon: "👁️",
      style: { borderRadius: "10px", background: "#333", color: "#fff" },
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel",
      background: "#ffffff",
      customClass: {
        title: "text-xl font-semibold text-dark",
        confirmButton: "px-4 py-2 rounded-md text-sm font-medium",
        cancelButton: "px-4 py-2 rounded-md text-sm font-medium",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  // --- Table Columns (Design same to same) ---
  const productColumns = [
    {
      header: "All Products",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-md shrink-0 overflow-hidden">
            <img
              src={item.product.image_url}
              alt={item.product.name}
              className="w-full h-full object-cover"
              onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
            />
          </div>
          <span className="truncate max-w-50 lg:max-w-75 block text-dark font-normal">
            {item.product.name}
          </span>
        </div>
      ),
    },
    {
      header: "Category",
      render: (item) => (
        <span className="text-gray-600">{item.product.category}</span>
      ),
    },
    {
      header: "Stock",
      render: (item) => (
        <span className="text-gray-600">
          {item.product.quantity.toString().padStart(2, "0")}
        </span>
      ),
    },
    {
      header: "Discount",
      render: (item) => (
        <span className="text-gray-600">
          {item.order_info.discount || "10%"}
        </span>
      ),
    },
    {
      header: "Price",
      render: (item) => (
        <span className="text-gray-600">{item.product.net_price}</span>
      ),
    },
    {
      header: "Action",
      className: "text-center",
      render: (item, index) => (
        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={() => handleToggleVisibility(item.order_info.id)}
            className="text-[#3b82f6] hover:opacity-70 transition-opacity"
          >
            {[2, 3].includes(index % 10) ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>

          <Link
            href={`/dashboard/products_manage/${item.order_info.id}`}
            className="text-slate-500 hover:text-dark transition-colors"
          >
            <Edit3 size={18} />
          </Link>

          <button
            onClick={() => handleDelete(item.order_info.id)}
            disabled={deleteMutation.isPending}
            className="text-red-500 hover:opacity-70 transition-opacity disabled:opacity-30"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#32afe2] mb-2" size={40} />
        <p className="text-gray-500">Loading products...</p>
      </div>
    );

  if (isError)
    return (
      <p className="text-center py-10 text-red-500 font-medium">
        Failed to load products. Please try again.
      </p>
    );

  return (
    <div className="w-full">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 py-4">
        {/* Add Button */}
        <Link
          href={"/dashboard/products_manage/add_product"}
          className="w-full md:w-auto bg-[#32afe2] hover:bg-[#2a9ac9] text-white px-10 py-3.5 rounded-2xl font-medium text-lg transition-colors shadow-sm active:scale-95 text-center"
        >
          Add New Product
        </Link>

        {/* Search Bar */}
        <div className="flex-1 w-full max-w-2xl relative">
          <input
            type="text"
            placeholder="Search products"
            className="w-full pl-6 pr-12 py-3.5 bg-white border border-[#32afe2]/40 rounded-2xl text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#32afe2] placeholder:text-gray-400"
          />
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#32afe2]"
            size={24}
          />
        </div>

        {/* Sort Dropdown */}
        <div className="w-full md:w-auto relative min-w-40">
          <select className="w-full appearance-none bg-white border border-[#32afe2]/40 rounded-2xl px-6 py-3.5 pr-12 text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#32afe2] cursor-pointer">
            <option>Sort By</option>
            <option>Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
          <ChevronDown
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            size={20}
          />
        </div>
      </div>

      <Table data={products} columns={productColumns} itemsPerPage={10} />
    </div>
  );
};

export default ProductsManage;
