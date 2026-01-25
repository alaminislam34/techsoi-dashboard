"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Loader2, Trash2, ArrowLeft } from "lucide-react";
import apiService from "@/api/api";
import { PRODUCT_API, PRODUCT_SLUG_API } from "@/api/apiEndPoint";
import InputWrapper from "../add_product/components/InputWrapper";

export default function ManageProduct() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const productSlug = params?.slug;

  const [productId, setProductId] = useState(null);

  // 1. Fetch Product Data
  const {
    data: product,
    isLoading: isProductLoading,
    isError: isProductError,
  } = useQuery({
    queryKey: ["product", productSlug],
    queryFn: async () => {
      const productRes = await apiService.get(PRODUCT_SLUG_API(productSlug));
      const p = productRes.data.data;
      setProductId(p.id);
      return p;
    },
    enabled: !!productSlug,
  });

  // 2. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!confirm("Are you sure you want to permanently delete this product?"))
        return;
      return await apiService.delete(`${PRODUCT_API}/${productId}`);
    },
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries(["products"]);
      router.push("/dashboard/products_manage");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete product");
    },
  });

  if (isProductLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#32afe2] mb-2" size={40} />
        <p className="text-gray-500">Loading product information...</p>
      </div>
    );
  }

  if (isProductError) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 font-medium mb-4">Error loading product.</p>
        <button
          onClick={() => router.push("/dashboard/products_manage")}
          className="bg-[#32afe2] text-white px-6 py-2 rounded-lg"
        >
          Back to List
        </button>
      </div>
    );
  }

  const p = product || {};
  const d = p.details || {};

  // Helper to safely parse JSON or return the object/array as is
  const safeParse = (data) => {
    if (!data) return [];
    if (typeof data !== "string") return data;
    try {
      return JSON.parse(data);
    } catch (e) {
      // If it fails to parse, it might be a single URL or malformed string
      return typeof data === "string" && data.startsWith("http") ? [data] : [];
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">View Product</h1>
          <p className="text-sm text-gray-500">ID: {productId}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/dashboard/products_manage")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-lg transition-all"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Trash2 size={18} />
            )}
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Basic Information
          </h2>

          <InputWrapper label="Product Name">
            <input
              type="text"
              value={p.name || ""}
              readOnly
              className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg outline-none cursor-default"
            />
          </InputWrapper>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputWrapper label="Regular Price">
              <input
                type="text"
                value={p.regular_price || "0"}
                readOnly
                className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg outline-none cursor-default"
              />
            </InputWrapper>
            <InputWrapper label="Discount (%)">
              <input
                type="text"
                value={p.discount || "0"}
                readOnly
                className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg outline-none cursor-default"
              />
            </InputWrapper>
            <InputWrapper label="Sale Price">
              <input
                type="text"
                value={p.sale_price || "0"}
                readOnly
                className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg outline-none cursor-default"
              />
            </InputWrapper>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWrapper label="Category">
              <input
                type="text"
                value={p.category?.name || "N/A"}
                readOnly
                className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg outline-none cursor-default"
              />
            </InputWrapper>
            <InputWrapper label="Stock Status">
              <input
                type="text"
                value={p.stock || "0"}
                readOnly
                className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg outline-none cursor-default"
              />
            </InputWrapper>
          </div>

          <InputWrapper label="Short Description">
            <textarea
              value={p.short_description || ""}
              readOnly
              rows={2}
              className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg outline-none cursor-default"
            />
          </InputWrapper>

          <InputWrapper label="Full Description">
            <div className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-700 min-h-25">
              {d.full_description || "No description provided."}
            </div>
          </InputWrapper>
        </div>

        {/* Specifications Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {(() => {
              const specs = safeParse(d.specifications);
              return Array.isArray(specs) && specs.length > 0 ? (
                specs.map((spec, i) => (
                  <div
                    key={i}
                    className="py-2 flex justify-between border-b border-gray-50"
                  >
                    <span className="font-medium text-gray-500">
                      {spec.name || spec.key}:
                    </span>
                    <span className="text-gray-900">{spec.value}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 italic">No specifications found.</p>
              );
            })()}
          </div>
        </div>

        {/* Images Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
            Product Images
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Main Image */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#32afe2] uppercase tracking-wider">
                Main Image
              </p>
              <div className="border rounded-lg overflow-hidden bg-gray-50 aspect-square">
                <img
                  src={
                    p.main_image || "https://placehold.co/400x400?text=No+Image"
                  }
                  alt="Main"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Extra Images */}
            {(() => {
              const extraImgs = safeParse(d.extra_images);
              return Array.isArray(extraImgs)
                ? extraImgs.map((img, index) => (
                    <div key={index} className="space-y-2">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Extra {index + 1}
                      </p>
                      <div className="border rounded-lg overflow-hidden bg-gray-50 aspect-square">
                        <img
                          src={typeof img === "string" ? img : img.url}
                          alt={`Extra ${index}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  ))
                : null;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
