"use client";

import React, { useMemo } from "react";
import productData from "@/app/FakeData/products.json";

/**
 * BEST PRACTICE: Keep data transformation outside the component.
 * This maps specific categories to their sub-items.
 * If you need to add more in the future, you only edit this object.
 */
const SUB_CATEGORY_MAP = {
  "PC Components": ["Processor", "Motherboard", "RAM", "Graphics Card"],
  Storage: ["SSD", "HDD", "NVMe"],
  // Add more here as your store grows
};

const Category = () => {
  // 1. PERFORMANCE: useMemo processes the JSON once and remembers it.
  const categories = useMemo(() => {
    if (!productData || !Array.isArray(productData)) return {};

    return productData.reduce((acc, item) => {
      const cat = item.product?.category || "Uncategorized";
      const brandName = item.product?.name?.split(" ")[0] || "Unknown";

      if (!acc[cat]) {
        acc[cat] = new Set();
      }
      acc[cat].add(brandName);
      return acc;
    }, {});
  }, []);

  return (
    <div className="w-full p-8 bg-white min-h-screen">
      {/* Table Header */}
      <div className="grid grid-cols-3 pb-6 border-b border-gray-100 text-dark font-medium text-base">
        <div>Main Category</div>
        <div>Sub Category</div>
        <div>Brands</div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-secondary">
        {Object.entries(categories).map(([categoryName, brandsSet]) => {
          // Convert Set to Array for mapping
          const brands = Array.from(brandsSet);
          // Look up sub-categories based on the name
          const subCategories = SUB_CATEGORY_MAP[categoryName];

          return (
            <div
              key={categoryName}
              className="grid grid-cols-3 py-10 items-start"
            >
              {/* Main Category */}
              <div className="text-dark text-[15px]">{categoryName}</div>

              {/* Sub Category */}
              <div className="text-dark text-[15px]">
                {subCategories ? (
                  <ul className="space-y-1">
                    {subCategories.map((sub) => (
                      <li key={sub}>{sub}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400">.</span>
                )}
              </div>

              {/* Brands Column */}
              <div className="text-dark text-[15px] flex flex-col gap-1">
                {brands.map((brand) => (
                  <div key={brand}>{brand}</div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Category;
