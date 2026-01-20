"use client";

import React, { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CATEGORY_API, SUB_CATEGORY_API, BRAND_API } from "@/api/apiEndPoint";
import apiService from "@/api/api";

const UpdateCategoryForm = () => {
  const queryClient = useQueryClient();

  // --- States for Input Fields (Design Remains Same) ---
  const [categoryName, setCategoryName] = useState("");
  const [categoryFile, setCategoryFile] = useState(null);

  const [selectedParentId, setSelectedParentId] = useState("");
  const [subCategoryName, setSubCategoryName] = useState("");
  const [subCategoryFile, setSubCategoryFile] = useState(null);

  const [brandName, setBrandName] = useState("");
  const [brandFile, setBrandFile] = useState(null);

  // --- 1. Fetch Categories using useQuery ---
  const { data: categories = [], isLoading: loadingData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiService.get(CATEGORY_API);
      return res.data.data || [];
    },
  });

  const categoryMutation = useMutation({
    mutationFn: (formData) =>
      apiService.post(CATEGORY_API, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    onSuccess: (res) => {
      const ok = res?.data?.status === true;
      if (ok) {
        toast.success("Category created!");
        setCategoryName("");
        setCategoryFile(null);
        queryClient.invalidateQueries(["categories"]);
      } else {
        toast.error(res?.data?.message || "Failed to create category");
      }
    },
    onError: (error) => toast.error(error.message || "Failed to create category"),
  });

  const subCategoryMutation = useMutation({
    mutationFn: (formData) =>
      apiService.post(SUB_CATEGORY_API, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
    onSuccess: (res) => {
      const ok = res?.data?.status === true;
      if (ok) {
        toast.success("Subcategory created!");
        setSubCategoryName("");
        setSubCategoryFile(null);
        queryClient.invalidateQueries(["subCategories", "categories"]);
      } else {
        toast.error(res?.data?.message || "Failed to create subcategory");
      }
    },
    onError: (error) => toast.error(error.message || "Failed to create subcategory"),
  });

  const brandMutation = useMutation({
    mutationFn: (formData) => apiService.post(BRAND_API, formData),
    onSuccess: (res) => {
      const ok = res?.data?.status === true;
      if (ok) {
        toast.success("Brand created!");
        setBrandName("");
        setBrandFile(null);
        queryClient.invalidateQueries(["brands"]);
      } else {
        toast.error(res?.data?.message || "Failed to create brand");
      }
    },
    onError: (error) => toast.error(error.message || "Failed to create brand"),
  });

  const handleCreateCategory = () => {
    if (!categoryName.trim() || !categoryFile)
      return toast.error("Missing fields for Category");
    const formData = new FormData();
    formData.append("name", categoryName);
    formData.append("image", categoryFile);
    categoryMutation.mutate(formData);
  };

  const handleCreateSubCategory = () => {
    if (!selectedParentId || !subCategoryName.trim() || !subCategoryFile)
      return toast.error("Missing fields for Subcategory");

    // Prevent duplicate subcategory under same parent (client-side check)
    try {
      const parent = categories.find((c) => String(c.id) === String(selectedParentId));
      const existing = parent?.subcategory || [];
      const dup = existing.some(
        (s) => String(s.name).trim().toLowerCase() === subCategoryName.trim().toLowerCase(),
      );
      if (dup) return toast.error("Subcategory with this name already exists for the selected category");
    } catch (e) {
      // ignore - categories may not be loaded
    }
    const formData = new FormData();
    formData.append("category_id", Number(selectedParentId));
    formData.append("name", subCategoryName);
    formData.append("image", subCategoryFile);
    // debug
    try {
      const entries = [];
      for (const pair of formData.entries()) {
        if (pair[1] instanceof File) entries.push([pair[0], pair[1].name]);
        else entries.push(pair);
      }
      console.log("Create SubCategory FormData:", entries);
    } catch (e) {
      console.warn("Unable to enumerate FormData", e);
    }
    subCategoryMutation.mutate(formData);
  };

  const handleCreateBrand = () => {
    if (!brandName.trim() || !brandFile)
      return toast.error("Missing fields for Brand");
    const formData = new FormData();
    formData.append("name", brandName);
    formData.append("image", brandFile);
    formData.append("special", "1");
    brandMutation.mutate(formData);
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
              disabled={categoryMutation.isPending}
              className="w-full flex justify-center items-center bg-primary hover:bg-[#2591be] text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {categoryMutation.isPending ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Create"
              )}
            </button>
          </div>
        </div>
      </section>

      {/* --- Sub Category Section --- */}
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
              disabled={subCategoryMutation.isPending}
              className="w-full flex justify-center items-center bg-primary hover:bg-[#2591be] text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {subCategoryMutation.isPending ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                "Create"
              )}
            </button>
          </div>
        </div>
      </section>

      {/* --- Brands Section --- */}
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
              disabled={brandMutation.isPending}
              className="w-full flex justify-center items-center bg-primary hover:bg-[#2591be] text-white py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {brandMutation.isPending ? (
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
