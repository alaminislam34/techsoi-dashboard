"use client";

import React, { useState, useEffect } from "react";
import { Upload, Loader2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  PRODUCT_API,
  CATEGORY_API,
  SUB_CATEGORY_API,
  BRAND_API,
} from "@/api/apiEndPoint";
import apiService from "@/api/api";

const UpdateCategoryForm = () => {
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Independent loading states
  const [loadingCategory, setLoadingCategory] = useState(false);
  const [loadingSubCategory, setLoadingSubCategory] = useState(false);
  const [loadingBrand, setLoadingBrand] = useState(false);

  // Category state
  const [categoryName, setCategoryName] = useState("");
  const [categoryFile, setCategoryFile] = useState(null);

  // Subcategory state
  const [selectedParentId, setSelectedParentId] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [subCategoryFile, setSubCategoryFile] = useState(null);

  // Brand state
  const [brandName, setBrandName] = useState("");
  const [brandFile, setBrandFile] = useState(null);

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    setLoadingData(true);
    try {
      const res = await apiService.get(CATEGORY_API);
      setCategories(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load categories");
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!categoryName.trim() || !categoryFile) {
      return toast.error("Missing fields for Category");
    }

    setLoadingCategory(true);
    try {
      const formData = new FormData();
      formData.append("name", categoryName);
      formData.append("image", categoryFile);

      await apiService.post(CATEGORY_API, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Category created!");
      setCategoryName("");
      setCategoryFile(null);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create category");
    } finally {
      setLoadingCategory(false);
    }
  };

  const handleCreateSubCategory = async () => {
    if (!selectedParentId || !subCategoryName.trim() || !subCategoryFile) {
      return toast.error("Missing fields for Subcategory");
    }

    setLoadingSubCategory(true);
    try {
      const formData = new FormData();
      formData.append("category_id", selectedParentId);
      formData.append("name", subCategoryName);
      formData.append("image", subCategoryFile);

      await apiService.post(SUB_CATEGORY_API, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Subcategory created!");
      setSubCategoryName("");
      setSubCategoryFile(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create subcategory",
      );
    } finally {
      setLoadingSubCategory(false);
    }
  };

  const handleCreateBrand = async () => {
    if (!brandName.trim() || !brandFile) {
      return toast.error("Missing fields for Brand");
    }

    setLoadingBrand(true);
    try {
      const formData = new FormData();
      formData.append("name", brandName);
      formData.append("image", brandFile);
      formData.append("special", "1");

      await apiService.post(BRAND_API, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Brand created!");
      setBrandName("");
      setBrandFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create brand");
    } finally {
      setLoadingBrand(false);
    }
  };

  return (
    <div className="bg-white space-y-6 p-2 md:p-4">
      <section>
        <h2 className="text-lg font-semibold text-dark mb-4">Main Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-6">
            <label className="block text-sm md:text-base text-dark mb-2">
              Category Name
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
              className="w-full px-4 py-3 rounded-xl border border-primary focus:outline-none placeholder-gray-400 text-gray-600"
            />
          </div>
          <div className="md:col-span-4">
            <label className="block text-sm md:text-base text-dark mb-2">
              Upload Icon
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="category-upload"
                onChange={(e) =>
                  e.target.files.length && setCategoryFile(e.target.files[0])
                }
              />
              <label
                htmlFor="category-upload"
                className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-primary cursor-pointer text-gray-400 bg-white"
              >
                <Upload size={18} className="text-primary shrink-0" />
                <span className="truncate text-sm">
                  {categoryFile ? categoryFile.name : "Choose icon"}
                </span>
              </label>
            </div>
          </div>
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={handleCreateCategory}
              disabled={loadingCategory}
              className="w-full flex justify-center items-center bg-primary hover:bg-[#2591be] text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {loadingCategory ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Create"
              )}
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-dark mb-4">Sub Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-3">
            <label className="block text-sm md:text-base text-dark mb-2">
              Select Parent
            </label>
            <select
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-primary focus:outline-none text-gray-600 bg-white appearance-none text-sm"
            >
              <option value="">
                {loadingData ? "Loading..." : "Select Category"}
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-4">
            <label className="block text-sm md:text-base text-dark mb-2">
              Sub Category Name
            </label>
            <input
              type="text"
              value={subCategoryName}
              onChange={(e) => setSubCategoryName(e.target.value)}
              placeholder="Enter sub name"
              className="w-full px-4 py-3 rounded-xl border border-primary focus:outline-none placeholder-gray-400 text-gray-600"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-sm md:text-base text-dark mb-2">
              Sub Icon
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="subcategory-upload"
                onChange={(e) =>
                  e.target.files.length && setSubCategoryFile(e.target.files[0])
                }
              />
              <label
                htmlFor="subcategory-upload"
                className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-primary cursor-pointer text-gray-400 bg-white"
              >
                <Upload size={18} className="text-primary shrink-0" />
                <span className="truncate text-sm">
                  {subCategoryFile ? subCategoryFile.name : "Choose icon"}
                </span>
              </label>
            </div>
          </div>
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={handleCreateSubCategory}
              disabled={loadingSubCategory}
              className="w-full flex justify-center items-center bg-primary hover:bg-[#2591be] text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {loadingSubCategory ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Create"
              )}
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-dark mb-4">Brands</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-6">
            <label className="block text-sm md:text-base text-dark mb-2">
              Brand Name
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Enter brand name"
              className="w-full px-4 py-3 rounded-xl border border-primary focus:outline-none placeholder-gray-400 text-gray-600"
            />
          </div>
          <div className="md:col-span-4">
            <label className="block text-sm md:text-base text-dark mb-2">
              Brand Image
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="brand-upload"
                onChange={(e) =>
                  e.target.files.length && setBrandFile(e.target.files[0])
                }
              />
              <label
                htmlFor="brand-upload"
                className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-primary cursor-pointer text-gray-400 bg-white"
              >
                <Upload size={18} className="text-primary shrink-0" />
                <span className="truncate text-sm">
                  {brandFile ? brandFile.name : "Choose image"}
                </span>
              </label>
            </div>
          </div>
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={handleCreateBrand}
              disabled={loadingBrand}
              className="w-full flex justify-center items-center bg-primary hover:bg-[#2591be] text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {loadingBrand ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Create"
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UpdateCategoryForm;
