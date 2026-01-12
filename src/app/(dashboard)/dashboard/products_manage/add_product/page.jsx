"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Upload, ChevronDown, X, Loader2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  GET_CATEGORY_API,
  GET_SUB_CATEGORY_API,
  GET_BRAND_API,
  CREATE_PRODUCT_API,
} from "@/api/apiEndPoint";

const AddProduct = () => {
  // --- Data States for Dropdowns ---
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // --- Form State ---
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    sub_category_id: "",
    brand_id: "",
    stock: "",
    regular_price: "", // Added to match sample API
    sale_price: "",
    discount: "0",
    description: "",
    short_description: "", // Renamed to match sample API
    emi: "",
    display_amount: "",
    sku: `prod-${Date.now()}`, // Auto-generated SKU
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Fetch Dynamic Data ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catRes, subRes, brandRes] = await Promise.all([
          axios.get(GET_CATEGORY_API),
          axios.get(GET_SUB_CATEGORY_API),
          axios.get(GET_BRAND_API),
        ]);
        setCategories(catRes.data?.data || catRes.data || []);
        setSubCategories(subRes.data?.data || subRes.data || []);
        setBrands(brandRes.data?.data || brandRes.data || []);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error("Failed to load categories/brands");
      }
    };
    fetchInitialData();
  }, []);

  // Filter sub-categories based on selected category
  const filteredSubCategories = subCategories.filter(
    (sub) => Number(sub.category_id) === Number(formData.category_id)
  );

  // --- Handle Input Change ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Handle Image Change ---
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 4) {
      return toast.error("Max 4 images allowed");
    }
    setImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  // --- Handle Submit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0)
      return toast.error("Please upload at least one image");
    setLoading(true);

    try {
      const data = new FormData();

      // Append all form fields
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Append images (Matches standard "main_image" or array upload)
      // Usually the first image is the main_image
      data.append("main_image", images[0]);
      images.forEach((image, index) => {
        data.append(`images[${index}]`, image);
      });

      const res = await axios.post(CREATE_PRODUCT_API, data, {
        headers: { "Content-Type": "application/json" },
      });

      toast.success("Product added successfully!");
      // Reset logic
      setFormData({
        name: "",
        category_id: "",
        sub_category_id: "",
        brand_id: "",
        stock: "",
        regular_price: "",
        sale_price: "",
        discount: "0",
        description: "",
        short_description: "",
        emi: "",
        display_amount: "",
        sku: `prod-${Date.now()}`,
      });
      setImages([]);
      setPreviews([]);
    } catch (error) {
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
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
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
                className="w-full p-3 bg-white border border-primary/50 rounded-lg appearance-none text-dark focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                <option value="">Select Sub Category</option>
                {filteredSubCategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
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
                className="w-full p-3 bg-white border border-primary/50 rounded-lg appearance-none text-dark focus:outline-none focus:ring-1 focus:ring-primary/30"
              >
                <option value="">Select brands</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
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
                name="short_description"
                value={formData.short_description}
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
              Regular Price (BDT)
            </label>
            <input
              type="number"
              name="regular_price"
              value={formData.regular_price}
              placeholder="0.00"
              onChange={handleChange}
              className="w-full p-3 bg-white border border-primary/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/30 text-dark"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-500 truncate">
              Sale Price (BDT)
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
        </div>

        {/* --- Image Upload Section --- */}
        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-500">
            Upload images (upto 4)
          </label>
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
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
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
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#38bdf8] hover:bg-primary text-white px-12 py-3.5 rounded-lg font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Adding Product...
              </>
            ) : (
              "Add Product"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
