"use client";

import React from "react";
import { useParams } from "next/navigation";
import productsData from "@/app/FakeData/products.json";
import { Pencil, Plus, Trash2, Upload, ChevronDown, X } from "lucide-react";

const ManageProduct = () => {
  const params = useParams();
  const productId = params.id;

  // Find the specific product based on the ID in the URL
  const item = productsData.find(
    (p) => p.order_info.id.toString() === productId
  );

  if (!item) {
    return (
      <div className="p-10 text-center text-dark font-medium">
        Product not found...
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen">
      <div className="space-y-6">
        {/* --- Category & Brand Row --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500">
              Select Main Category
            </label>
            <div className="relative">
              <select
                defaultValue={item.product.category}
                className="w-full p-3 bg-white border border-primary/50 rounded-lg appearance-none text-dark focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                <option value={item.product.category}>
                  {item.product.category}
                </option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={18}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500">
              Select Sub Category
            </label>
            <div className="relative">
              <select className="w-full p-3 bg-white border border-primary/50 rounded-lg appearance-none text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30">
                <option>Select Sub Category</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={18}
              />
            </div>
          </div>
        </div>

        {/* --- Brands & Quantity --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500">
              Select Brands
            </label>
            <div className="relative">
              <select className="w-full p-3 bg-white border border-primary/50 rounded-lg appearance-none text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30">
                <option>Select brands</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={18}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500">
              Quantity
            </label>
            <input
              type="text"
              defaultValue={item.product.quantity}
              className="w-full p-3 bg-white border border-primary/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 text-dark"
            />
          </div>
        </div>

        {/* --- Text Inputs --- */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500">
              Products Name
            </label>
            <div className="relative">
              <input
                type="text"
                defaultValue={item.product.name}
                className="w-full p-3 bg-white border border-primary/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 text-dark"
              />
              <Pencil
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500">
              Short Details
            </label>
            <div className="relative">
              <input
                type="text"
                defaultValue={`${item.product.name} - Premium Edition`}
                className="w-full p-3 bg-white border border-primary/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 text-dark"
              />
              <Pencil
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500">
              Products Description
            </label>
            <div className="relative">
              <textarea
                rows={4}
                defaultValue="Type your detailed product description here..."
                className="w-full p-3 bg-white border border-primary/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 text-dark resize-none"
              />
              <Pencil
                className="absolute right-3 top-4 text-gray-400"
                size={16}
              />
            </div>
          </div>
        </div>

        {/* --- Pricing Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500 truncate">
              Price (BDT)
            </label>
            <div className="relative">
              <input
                type="text"
                defaultValue={item.product.net_price}
                className="w-full p-3 bg-white border border-primary/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 text-dark"
              />
              <Pencil
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500 truncate">
              Discount (%)
            </label>
            <div className="relative">
              <input
                type="text"
                defaultValue={item.order_info.discount || "10%"}
                className="w-full p-3 bg-white border border-primary/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 text-dark"
              />
              <Pencil
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500 truncate">
              EMI
            </label>
            <input
              type="text"
              defaultValue="1200"
              className="w-full p-3 bg-white border border-primary/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 text-dark"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500 truncate">
              Display Amount (BDT)
            </label>
            <input
              type="text"
              defaultValue="250"
              className="w-full p-3 bg-white border border-primary/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 text-dark"
            />
          </div>
        </div>

        {/* --- Technical Specs (Dynamic Design) --- */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-500">
                Technical Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  defaultValue="Height"
                  className="w-full p-3 bg-white border border-primary/50 rounded-lg focus:outline-none text-dark"
                />
                <Pencil
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  defaultValue="5.5 ft"
                  className="w-full p-3 bg-white border border-primary/50 rounded-lg focus:outline-none text-dark"
                />
                <Pencil
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
              </div>
              <button className="p-3 bg-red-500 text-white rounded-lg hover:opacity-90 shrink-0">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div className="relative">
              <input
                type="text"
                placeholder="Type here"
                className="w-full p-3 bg-white border border-primary/50 rounded-lg focus:outline-none text-dark"
              />
              <Pencil
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
            </div>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Type here"
                  className="w-full p-3 bg-white border border-primary/50 rounded-lg focus:outline-none text-dark"
                />
                <Pencil
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
              </div>
              <button className="p-3 bg-primary text-white rounded-lg hover:opacity-90 shrink-0">
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* --- Image Upload Section --- */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-500">
            Upload images (upto 4)
          </label>
          <div className="w-full p-3 bg-white border border-primary/50 border-dashed rounded-lg flex items-center gap-2 text-primary cursor-pointer hover:bg-gray-50 transition-colors">
            <Upload size={18} />
            <span className="font-medium">Choose a file</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white border border-gray-100 rounded-lg p-3 shadow-sm"
              >
                <div className="flex items-center gap-2 text-primary font-medium truncate">
                  <div className="w-8 h-8 rounded bg-gray-100 overflow-hidden shrink-0">
                    <img
                      src={item.product.image_url}
                      alt="product"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm underline cursor-pointer truncate">
                    Image_product_0{i}.png
                  </span>
                </div>
                <button className="text-red-500 hover:scale-110 transition-transform">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* --- Submit Button --- */}
        <div className="pt-6">
          <button className="w-full md:w-auto bg-[#38bdf8] hover:bg-primary text-white px-12 py-3.5 rounded-lg font-semibold transition-all shadow-md active:scale-95">
            Update Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageProduct;
