"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { AlertCircle, RefreshCw, Layers, Tag, Package } from "lucide-react";
import {
  BRAND_API,
  CATEGORY_API,
  SUB_CATEGORY_API,
} from "@/api/apiEndPoint";
import Image from "next/image";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const DEFAULT_IMAGE = "/images/hp.png";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [catRes, subRes, brandRes] = await Promise.all([
        axios.get(CATEGORY_API),
        axios.get(SUB_CATEGORY_API),
        axios.get(BRAND_API),
      ]);

      setCategories(catRes.data?.data || catRes.data || []);
      setSubCategories(subRes.data?.data || subRes.data || []);
      setBrands(brandRes.data?.data || brandRes.data || []);
    } catch (err) {
      setError("Unable to load category data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const SkeletonRow = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 py-6 gap-4 animate-pulse border-b">
      <div className="h-10 bg-gray-200 rounded w-full"></div>
      <div className="h-10 bg-gray-100 rounded w-full"></div>
      <div className="h-10 bg-gray-200 rounded w-full"></div>
    </div>
  );

  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-100 p-6 text-center">
        <AlertCircle size={40} className="text-red-500 mb-4" />
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg"
        >
          <RefreshCw size={16} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-8 bg-white min-h-screen">
      {/* Table Header - Hidden on Mobile */}
      <div className="hidden md:grid grid-cols-3 pb-6 border-b border-gray-100 text-dark font-bold text-base uppercase tracking-wider">
        <div>Main Category</div>
        <div>Sub Category</div>
        <div>Brands</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-100">
        {loading
          ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
          : categories.map((category) => {
              const filteredSubs = subCategories.filter(
                (sub) => Number(sub.category_id) === Number(category.id)
              );

              return (
                <div
                  key={category.id}
                  className="grid grid-cols-1 md:grid-cols-3 py-4 gap-6 md:gap-4 items-start transition-all"
                >
                  {/* Main Category Column */}
                  <div className="flex items-center gap-4">
                    <Image
                      src={category.image || DEFAULT_IMAGE}
                      height={200}
                      width={200}
                      unoptimized
                      alt={category.name}
                      className="w-12 h-12 md:w-10 md:h-10 object-cover rounded-lg bg-gray-50 shadow-sm"
                    />
                    <div>
                      <span className="md:hidden block text-xs font-bold text-primary uppercase mb-1">
                        Main Category
                      </span>
                      <h3 className="text-dark text-base md:text-[15px] font-semibold">
                        {category.name}
                      </h3>
                    </div>
                  </div>

                  {/* Sub Category Column */}
                  <div>
                    <span className="md:hidden flex items-center gap-2 text-xs font-bold text-primary uppercase mb-2">
                      <Layers size={14} /> Sub Categories
                    </span>
                    {filteredSubs.length > 0 ? (
                      <ul className="grid grid-cols-2 md:grid-cols-1 gap-2">
                        {filteredSubs.map((sub) => (
                          <li
                            key={sub.id}
                            className="text-gray-600 text-sm flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 bg-primary/40 rounded-full shrink-0"></span>
                            {sub.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-300 italic text-sm">
                        No items
                      </span>
                    )}
                  </div>

                  {/* Brands Column */}
                  <div>
                    <span className="md:hidden flex items-center gap-2 text-xs font-bold text-primary uppercase mb-2">
                      <Tag size={14} /> Brands
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {brands.length > 0 ? (
                        brands.map((brand) => (
                          <span
                            key={brand.id}
                            className="bg-white border border-gray-200 px-3 py-1 rounded-md text-[11px] font-medium text-gray-600 shadow-sm"
                          >
                            {brand.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

        {!loading && categories.length === 0 && (
          <div className="py-20 text-center">
            <Package size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400">No data found in your inventory.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
