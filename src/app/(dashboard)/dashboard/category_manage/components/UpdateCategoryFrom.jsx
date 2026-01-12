"use client";

import React, { useState, useEffect } from "react";
import { Upload, ChevronDown } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  CREATE_BRAND_API,
  CREATE_CATEGORY_API,
  CREATE_SUB_CATEGORY_API,
  GET_CATEGORY_API,
} from "@/api/apiEndPoint";

const UpdateCategoryFrom = () => {
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [categoryFile, setCategoryFile] = useState(null);

  const [selectedParentId, setSelectedParentId] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");

  const [brandName, setBrandName] = useState("");

  // --- Fetch Categories for the Dropdown ---
  const fetchCategories = async () => {
    try {
      const res = await axios.get(GET_CATEGORY_API);
      setCategories(res.data.data || res.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async () => {
    if (!categoryName) return toast.error("Please enter a category name");

    try {
      const payload = {
        name: categoryName,
        image: "https://placeholder.com/image.png",
      };

      const res = await axios.post(CREATE_CATEGORY_API, payload);
      if (res.status === 200 || res.status === 201) {
        toast.success("Category created successfully!");
        setCategoryName("");
        fetchCategories();
      }
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  const handleCreateSubCategory = async () => {
    if (!selectedParentId || !subCategoryName) {
      return toast.error(
        "Please select a main category and enter sub-category name"
      );
    }

    try {
      const payload = {
        category_id: selectedParentId,
        name: subCategoryName,
        image: "https://placeholder.com/image.png",
      };

      await axios.post(CREATE_SUB_CATEGORY_API, payload);
      toast.success("Sub Category created!");
      setSubCategoryName("");
    } catch (error) {
      toast.error("Failed to create sub category");
    }
  };

  const handleCreateBrand = async () => {
    if (!brandName) return toast.error("Please enter brand name");

    try {
      const payload = {
        name: brandName,
        image: "https://placeholder.com/image.png",
        special: 1,
      };

      await axios.post(CREATE_BRAND_API, payload);
      toast.success("Brand created!");
      setBrandName("");
    } catch (error) {
      toast.error("Failed to create brand");
    }
  };

  return (
    <div className="bg-white space-y-8 p-2">
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
              Upload icon
            </label>
            <div className="relative">
              <input
                type="file"
                id="cat-upload"
                className="hidden"
                onChange={(e) => setCategoryFile(e.target.files[0])}
              />
              <label
                htmlFor="cat-upload"
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
              className="w-full bg-primary hover:bg-[#2591be] text-white py-3 rounded-xl font-medium transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      </section>

      {/* --- Create Sub Category Section --- */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-base md:text-lg text-dark mb-2">
              Select Main Category
            </label>
            <div className="relative">
              <select
                value={selectedParentId}
                onChange={(e) => setSelectedParentId(e.target.value)}
                className="w-full appearance-none px-4 py-3 rounded-xl border border-primary focus:outline-none text-gray-600 bg-white"
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
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <ChevronDown size={20} />
              </div>
            </div>
          </div>
          <div className="md:col-span-5">
            <label className="block text-base md:text-lg text-dark mb-2">
              Create Sub Category
            </label>
            <input
              type="text"
              value={subCategoryName}
              onChange={(e) => setSubCategoryName(e.target.value)}
              placeholder="Enter sub category name"
              className="w-full px-4 py-3 rounded-xl border border-primary focus:outline-none placeholder-gray-400 text-gray-600"
            />
          </div>
          <div className="md:col-span-2">
            <button
              onClick={handleCreateSubCategory}
              className="w-full bg-primary hover:bg-[#2591be] text-white py-3 rounded-xl font-medium transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      </section>

      {/* --- Add Brands Section --- */}
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
              className="w-full bg-primary hover:bg-[#2591be] text-white py-3 rounded-xl font-medium transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UpdateCategoryFrom;
