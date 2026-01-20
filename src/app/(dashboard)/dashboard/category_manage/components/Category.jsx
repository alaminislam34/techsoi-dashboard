"use client";

import React from "react";
import Image from "next/image";
import { AlertCircle, RefreshCw, Package, Tag, Layers } from "lucide-react";
import { useInventory } from "@/api/hooks/useInventory";

const Category = () => {
  const DEFAULT_IMAGE = "/images/hp.png";
  const {
    categories,
    subCategories,
    brands,
    isLoading,
    isError,
    refreshInventory,
  } = useInventory();
  console.log(categories);
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 w-full">
        <AlertCircle size={40} className="text-red-500 mb-4" />
        <p className="text-slate-600 mb-4 font-medium">
          Unable to sync inventory data.
        </p>
        <button
          onClick={refreshInventory}
          className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-all"
        >
          <RefreshCw size={16} /> Reconnect
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-2">
          <div className="flex items-center gap-2 mb-4">
            <Layers size={18} className="text-slate-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Categories
            </h2>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="">
                <tr>
                  <th className="px-6 py-4 text-[13px] font-bold text-slate-700">
                    Main Category
                  </th>
                  <th className="px-6 py-4 text-[13px] font-bold text-slate-700">
                    Sub-Categories
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading
                  ? [...Array(5)].map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-5">
                          <div className="h-10 bg-slate-100 rounded w-40"></div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="h-10 bg-slate-50 rounded w-full"></div>
                        </td>
                      </tr>
                    ))
                  : categories.map((category) => {
                      const filteredSubs = subCategories.filter(
                        (sub) =>
                          Number(sub.category_id) === Number(category.id),
                      );
                      return (
                        <tr
                          key={category.id}
                          className="hover:bg-slate-50/30 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 relative shrink-0">
                                <Image
                                  src={category.image || DEFAULT_IMAGE}
                                  fill
                                  alt=""
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                              <span className="font-semibold text-slate-800 text-[15px]">
                                {category.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {filteredSubs.length > 0 ? (
                                filteredSubs.map((sub) => (
                                  <p key={sub.id}>
                                    <span className="text-slate-500 px-2 py-1 border border-gray-200">
                                      {sub.name}
                                    </span>
                                  </p>
                                ))
                              ) : (
                                <span className="text-slate-300 text-xs italic">
                                  Empty
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Brands Sidebar */}
        <div className="flex-1 lg:max-w-[320px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-slate-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Global Brands
              </h2>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
              {brands.length}
            </span>
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50 overflow-hidden flex flex-col">
            {/* Scrollable Brand Area */}
            <div className="p-3 space-y-2 max-h-150 overflow-y-auto custom-scrollbar">
              {isLoading ? (
                [...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-12 bg-slate-200 rounded-lg animate-pulse"
                  ></div>
                ))
              ) : brands.length > 0 ? (
                brands.map((brand) => (
                  <div
                    key={brand.id}
                    className="flex items-center gap-3 p-2 group"
                  >
                    <div className="h-10 w-10 rounded-md overflow-hidden border border-slate-100 bg-slate-50 relative shrink-0">
                      <Image
                        src={brand.image || DEFAULT_IMAGE}
                        fill
                        alt={brand.slug}
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700 leading-none mb-1">
                        {brand.name}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10">
                  <Package size={24} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-400 text-xs">No brands found</p>
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="p-3 bg-slate-50/80 border-t border-slate-200">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter text-center">
                Syncing with master directory
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;
