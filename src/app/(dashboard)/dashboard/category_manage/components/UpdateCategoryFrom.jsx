"use client";

import React, { useState, useEffect } from "react";
import { Upload, Loader2, ChevronDown } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  CREATE_BRAND_API,
  CREATE_CATEGORY_API,
  CREATE_SUB_CATEGORY_API,
  GET_CATEGORY_API,
} from "@/api/apiEndPoint";

const UpdateCategoryForm = () => {
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingType, setLoadingType] = useState(null);

  // Category state
  const [categoryName, setCategoryName] = useState("");
  const [categoryFile, setCategoryFile] = useState(null);

  // Subcategory state
  const [selectedParentId, setSelectedParentId] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");

  // Brand state
  const [brandName, setBrandName] = useState("");

  // Fetch categories for dropdown
  const fetchCategories = async () => {
    setLoadingData(true);
    try {
      const res = await axios.get(GET_CATEGORY_API);
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

  // --- Handlers ---
  const handleCreateCategory = async () => {
    if (!categoryName.trim() || !categoryFile)
      return toast.error("Missing fields");
    setLoadingType("category");

    try {
      const formData = new FormData();
      formData.append("name", categoryName);
      formData.append("image", categoryFile);

      await axios.post(CREATE_CATEGORY_API, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Category created!");
      setCategoryName("");
      setCategoryFile(null);
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create category");
    } finally {
      setLoadingType(null);
    }
  };

  const handleCreateSubCategory = async () => {
    if (!selectedParentId || !subCategoryName.trim())
      return toast.error("Missing fields");
    setLoadingType("subcategory");

    try {
      await axios.post(CREATE_SUB_CATEGORY_API, {
        category_id: selectedParentId,
        name: subCategoryName,
      });
      toast.success("Subcategory created!");
      setSubCategoryName("");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to create subcategory"
      );
    } finally {
      setLoadingType(null);
    }
  };

  const handleCreateBrand = async () => {
    if (!brandName.trim()) return toast.error("Missing fields");
    setLoadingType("brand");

    try {
      await axios.post(CREATE_BRAND_API, {
        name: brandName,
        special: 1,
      });
      toast.success("Brand created!");
      setBrandName("");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create brand");
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="bg-white space-y-8 p-2">
      {/* Category */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-7">
            <label className="block text-base md:text-lg text-dark mb-2">
              Create Main Category
            </label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
              className="w-full px-4 py-3 rounded-xl border border-primary focus:outline-none placeholder-gray-400 text-gray-600"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-base md:text-lg text-dark mb-2">
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
                className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border border-primary cursor-pointer text-gray-400"
              >
                <Upload size={20} className="text-primary" />
                <span className="truncate">
                  {categoryFile ? categoryFile.name : "Choose a file"}
                </span>
              </label>
            </div>
          </div>
          <div className="md:col-span-2">
            <button
              onClick={handleCreateCategory}
              disabled={loadingType !== null}
              className="w-full flex justify-center items-center bg-primary hover:bg-[#2591be] text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {loadingType === "category" ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Create"
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Subcategory */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-base md:text-lg text-dark mb-2">
              Select Main Category
            </label>
            <select
              value={selectedParentId}
              onChange={(e) => setSelectedParentId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-primary focus:outline-none text-gray-600 bg-white appearance-none"
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
          <div className="md:col-span-5">
            <label className="block text-base md:text-lg text-dark mb-2">
              Create Sub Category
            </label>
            <input
              type="text"
              value={subCategoryName}
              onChange={(e) => setSubCategoryName(e.target.value)}
              placeholder="Enter subcategory name"
              className="w-full px-4 py-3 rounded-xl border border-primary focus:outline-none placeholder-gray-400 text-gray-600"
            />
          </div>
          <div className="md:col-span-2">
            <button
              onClick={handleCreateSubCategory}
              disabled={loadingType !== null}
              className="w-full flex justify-center items-center bg-primary hover:bg-[#2591be] text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {loadingType === "subcategory" ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Create"
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Brand */}
      <section>
        <label className="block text-base md:text-lg text-dark mb-2">
          Add Brands
        </label>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-10">
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Enter brand name"
              className="w-full px-4 py-3 rounded-xl border border-primary focus:outline-none placeholder-gray-400 text-gray-600"
            />
          </div>
          <div className="md:col-span-2">
            <button
              onClick={handleCreateBrand}
              disabled={loadingType !== null}
              className="w-full flex justify-center items-center bg-primary hover:bg-[#2591be] text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {loadingType === "brand" ? (
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
