"use client";

import React, { Suspense, useState } from "react"; // Added Suspense
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Table from "@/app/(dashboard)/components/BodyContent/Table";
import { Edit3, Trash2, Search, ChevronDown, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Link from "next/link";
import ProductsSkeleton from "@/app/components/skeletons/ProductsSkeleton";
import { PRODUCT_API } from "@/api/apiEndPoint";
import apiService from "@/api/api";
import { useRouter, useSearchParams } from "next/navigation";

// I renamed this to Content to wrap it in Suspense below
const ProductsManageContent = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const searchParams = useSearchParams();
  const q = searchParams?.get("q") || "";

  // sort state: empty | newest | price_asc | price_desc
  const [sort, setSort] = useState("");
  const handleSortChange = (e) => setSort(e.target.value);

  const {
    data: products = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["products", q, sort],
    queryFn: async () => {
      const params = {};
      if (q) params.q = q;
      if (sort) params.sort = sort;

      const res = await apiService.get(PRODUCT_API, {
        params,
      });

      if (res.data?.status === true && Array.isArray(res.data.data)) {
        // Server-side sorting would be ideal, but if the API ignores the sort param
        // we apply client-side sorting as a fallback so the UI responds immediately.
        let items = res.data.data;

        if (sort) {
          if (sort === "newest") {
            items = items.slice().sort((a, b) => {
              const ta = new Date(a.created_at || a.createdAt || 0).getTime() || a.id || 0;
              const tb = new Date(b.created_at || b.createdAt || 0).getTime() || b.id || 0;
              return tb - ta;
            });
          } else if (sort === "price_asc") {
            items = items.slice().sort((a, b) => Number(a.sale_price || 0) - Number(b.sale_price || 0));
          } else if (sort === "price_desc") {
            items = items.slice().sort((a, b) => Number(b.sale_price || 0) - Number(a.sale_price || 0));
          }
        }

        return items.map((product) => ({
          product: {
            id: product.id,
            slug: product.slug,
            name: product.name,
            image_url: product.main_image,
            category: product.category_id,
            quantity: product.stock,
            net_price: product.sale_price,
          },
          order_info: {
            id: product.id,
            slug: product.slug,
            discount: "10%",
          },
        }));
      }

      return [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiService.delete(`${PRODUCT_API}/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["products"]);
      toast.success("Product has been deleted.");
    },
    onError: (error) => {
      // Detect foreign key / integrity constraint errors and show user-friendly message
      const serverMsg = error?.response?.data?.message || error?.message || "Failed to delete product";
      const fkRegex = /foreign key|constraint|SQLSTATE\[23000\]|1451|product_details_product_id_foreign/i;
      const isForeignKeyErr = fkRegex.test(String(serverMsg)) || fkRegex.test(String(error?.message || ""));

      if (isForeignKeyErr) {
        // Non-technical message for admins
        Swal.fire({
          title: "Cannot delete product",
          text: "This product cannot be deleted because related records exist (for example, product details). Please remove or reassign those related items first, or contact technical support.",
          icon: "warning",
          confirmButtonColor: "#ef4444",
          confirmButtonText: "OK",
        });
      } else {
        toast.error(serverMsg);
      }
    },
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete!",
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

  const productColumns = [
    {
      header: "Product Title",
      render: (item) => (
        <div
          onClick={() => {
            const slug = item?.product?.slug;
            if (!slug) return toast.error("Product slug is missing");
            router.push(`/dashboard/products_manage/${slug}`);
          }}
          className="flex items-center gap-3 cursor-pointer"
        >
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
          {item.product.quantity?.toString().padStart(2, "0")}
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
          <Link
            href={`/dashboard/products_manage/${item.order_info.slug}`}
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
      <div>
        <ProductsSkeleton rows={6} />
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
        <Link
          href={"/dashboard/products_manage/add_product"}
          className="w-full md:w-auto bg-[#32afe2] hover:bg-[#2a9ac9] text-white px-10 py-3.5 rounded-2xl font-medium text-lg transition-colors shadow-sm active:scale-95 text-center"
        >
          Add New Product
        </Link>

        <div className="w-full md:w-auto relative min-w-40">
          <select
            value={sort}
            onChange={handleSortChange}
            className="w-full appearance-none bg-white border border-[#32afe2]/40 rounded-2xl px-6 py-3.5 pr-12 text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#32afe2] cursor-pointer"
            aria-label="Sort products"
          >
            <option value="">Sort By</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
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

// Main Export with Suspense wrapper to fix the build error
export default function ProductsManage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-[#32afe2] mb-2" size={40} />
          <p className="text-gray-500">Initializing...</p>
        </div>
      }
    >
      <ProductsManageContent />
    </Suspense>
  );
}
