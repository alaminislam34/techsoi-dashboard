"use client";

import React, { useState } from "react";
import { Pencil, Plus, Trash2, Upload, ChevronDown, X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const AddProduct = () => {
  // --- Form State ---
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    sub_category_id: "",
    brand_id: "",
    stock: "",
    sale_price: "",
    discount: "0",
    description: "",
    short_details: "",
    emi: "",
    display_amount: "",
  });

  const [images, setImages] = useState([]); // To store actual File objects
  const [previews, setPreviews] = useState([]); // To store URL previews
  const [loading, setLoading] = useState(false);

  // --- Handle Input Change ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Handle Image Change ---
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 4) {
      return toast.error("You can only upload up to 4 images");
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setImages(updatedImages);
    setPreviews(updatedPreviews);
  };

  // --- Handle Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Use FormData to handle both text and files
      const data = new FormData();

      // Append text fields
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Append images
      images.forEach((image) => {
        data.append("images[]", image); // Using 'images[]' as a standard array key for APIs
      });

      const res = await axios.post(
        "https://api.techsoibd.com/api/product/store",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data?.status) {
        toast.success("Product added successfully!");
        // Reset state after success
        setFormData({
          name: "",
          category_id: "",
          sub_category_id: "",
          brand_id: "",
          stock: "",
          sale_price: "",
          discount: "0",
          description: "",
          short_details: "",
          emi: "",
          display_amount: "",
        });
        setImages([]);
        setPreviews([]);
      }
    } catch (error) {
      console.error("Add product error:", error);
      toast.error(error.response?.data?.message || "Failed to add product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* --- Category & Brand Row --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500">
              Select Main Category
            </label>
            <div className="relative">
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="w-full p-3 bg-white border border-primary/50 rounded-lg appearance-none text-dark focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                <option value="">Select Category</option>
                <option value="1">Electronics</option>
                <option value="2">Gadgets</option>
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
              <select
                name="sub_category_id"
                value={formData.sub_category_id}
                onChange={handleChange}
                className="w-full p-3 bg-white border border-primary/50 rounded-lg appearance-none text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                <option value="">Select Sub Category</option>
                <option value="1">HeadPhone</option>
                <option value="2">Watch</option>
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
              <select
                name="brand_id"
                value={formData.brand_id}
                onChange={handleChange}
                className="w-full p-3 bg-white border border-primary/50 rounded-lg appearance-none text-gray-400 focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                <option value="">Select brands</option>
                <option value="1">Apple</option>
                <option value="2">Oraimo</option>
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
              type="number"
              name="stock"
              value={formData.stock}
              placeholder="0"
              onChange={handleChange}
              className="w-full p-3 bg-white border border-primary/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 text-dark"
            />
          </div>
        </div>

        {/* --- Product Name & Short Description --- */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500">
              Product Name
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                required
                placeholder="Enter product name"
                onChange={handleChange}
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
                name="short_details"
                value={formData.short_details}
                placeholder="Brief highlight (e.g. 2024 Edition)"
                onChange={handleChange}
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
              Product Description
            </label>
            <div className="relative">
              <textarea
                name="description"
                value={formData.description}
                rows={4}
                placeholder="Type your detailed product description here..."
                onChange={handleChange}
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
            <input
              type="number"
              name="sale_price"
              value={formData.sale_price}
              placeholder="0.00"
              onChange={handleChange}
              className="w-full p-3 bg-white border border-primary/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 text-dark"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500 truncate">
              Discount (%)
            </label>
            <input
              type="text"
              name="discount"
              value={formData.discount}
              placeholder="0%"
              onChange={handleChange}
              className="w-full p-3 bg-white border border-primary/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 text-dark"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500 truncate">
              EMI
            </label>
            <input
              type="text"
              name="emi"
              value={formData.emi}
              placeholder="Monthly EMI"
              onChange={handleChange}
              className="w-full p-3 bg-white border border-primary/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 text-dark"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500 truncate">
              Display Amount
            </label>
            <input
              type="text"
              name="display_amount"
              value={formData.display_amount}
              placeholder="Showroom display"
              onChange={handleChange}
              className="w-full p-3 bg-white border border-primary/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 text-dark"
            />
          </div>
        </div>

        {/* --- Image Upload Section --- */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-500">
            Upload images (upto 4)
          </label>

          {/* Image Previews */}
          <div className="flex flex-wrap gap-4">
            {previews.map((src, index) => (
              <div
                key={index}
                className="relative w-24 h-24 border border-primary/30 rounded-lg overflow-hidden"
              >
                <img
                  src={src}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}

            {previews.length < 4 && (
              <label className="w-24 h-24 p-3 bg-white border border-primary/50 border-dashed rounded-lg flex flex-col items-center justify-center text-primary cursor-pointer hover:bg-gray-50 transition-colors">
                <Upload size={18} />
                <span className="text-[10px] mt-1 font-medium">Add Image</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* --- Submit Button --- */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto bg-[#38bdf8] hover:bg-primary text-white px-12 py-3.5 rounded-lg font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
