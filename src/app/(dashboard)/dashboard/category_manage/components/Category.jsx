"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  AlertCircle,
  RefreshCw,
  Package,
  Tag,
  Layers,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useInventory } from "@/api/hooks/useInventory";
import apiService from "@/api/api";
import {
  CATEGORY_SINGLE_API,
  SUB_CATEGORY_SINGLE_API,
  BRAND_SINGLE_API,
} from "@/api/apiEndPoint";

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
  const [deletingId, setDeletingId] = useState(null);
  const [deletingType, setDeletingType] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null, type: null, name: "" });
  const [fkModal, setFkModal] = useState({ open: false, id: null, name: "", message: "" });

  const handleDelete = async ({ id, type, name }) => {
    if (!id) {
      console.error("Delete called without id", { id, type, name });
      toast.error("Missing id for delete");
      setConfirm({ open: false, id: null, type: null, name: "" });
      return;
    }

    setDeletingId(id);
    setDeletingType(type);
    try {
      if (type === "category") {
        await apiService.delete(CATEGORY_SINGLE_API(id));
      } else if (type === "sub") {
        await apiService.delete(SUB_CATEGORY_SINGLE_API(id));
      } else if (type === "brand") {
        await apiService.delete(BRAND_SINGLE_API(id));
      }
      refreshInventory();
      toast.success(`${name} deleted`);
    } catch (err) {
      console.error("Delete error", err);
      const serverMsg = err?.message || err?.data?.message || "Delete failed";

      const fkPatterns = ["Cannot delete or update a parent row", "foreign key", "1451", "a foreign key constraint fails"];
      const isFk = fkPatterns.some((p) => serverMsg.toLowerCase().includes(p.toLowerCase()));

      if (isFk && type === "brand") {
        // Show a specific message and offer to view related products
        toast.error("Cannot delete brand: there are products using this brand. Reassign or remove those products first.");
        setFkModal({ open: true, id, name, message: serverMsg });
      } else {
        const msg = serverMsg;
        toast.error(msg);
      }
    } finally {
      setDeletingId(null);
      setDeletingType(null);
      setConfirm({ open: false, id: null, type: null, name: "" });
    }
  };
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
      {confirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-800">Confirm delete</h3>
            <p className="text-sm text-slate-500 mt-2">Are you sure you want to delete <strong className="text-slate-800">{confirm.name}</strong>? This action cannot be undone.</p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setConfirm({ open: false, id: null, type: null, name: "" })}
                className="px-4 py-2 rounded-md bg-slate-100 text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete({ id: confirm.id, type: confirm.type, name: confirm.name })}
                disabled={deletingId === confirm.id}
                className="px-4 py-2 rounded-md bg-red-600 text-white disabled:opacity-60"
              >
                {deletingId === confirm.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {fkModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-800">Cannot delete</h3>
            <p className="text-sm text-slate-500 mt-2">Brand <strong className="text-slate-800">{fkModal.name}</strong> cannot be deleted because other records reference it.</p>
            <p className="text-xs text-slate-400 mt-2">{fkModal.message}</p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setFkModal({ open: false, id: null, name: "", message: "" })}
                className="px-4 py-2 rounded-md bg-slate-100 text-slate-700"
              >
                Close
              </button>
              <a
                href={`/dashboard/products_manage?brand=${fkModal.id}`}
                className="px-4 py-2 rounded-md bg-slate-900 text-white"
              >
                View products
              </a>
            </div>
          </div>
        </div>
      )}
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
                            <div className="flex items-center justify-between gap-4">
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

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    setConfirm({
                                      open: true,
                                      id: category.id,
                                      type: "category",
                                      name: category.name,
                                    })
                                  }
                                  disabled={
                                    deletingId === category.id &&
                                    deletingType === "category"
                                  }
                                  className="inline-flex items-center gap-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md border border-red-100"
                                  aria-label={`Delete category ${category.name}`}
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-2">
                              {filteredSubs.length > 0 ? (
                                filteredSubs.map((sub) => (
                                  <div
                                    key={sub.id}
                                    className="inline-flex items-center gap-2 bg-white border border-slate-100 px-2 py-1 rounded-md text-slate-600 text-sm"
                                  >
                                    <span className="leading-none">{sub.name}</span>
                                    <button
                                      onClick={() =>
                                        setConfirm({
                                          open: true,
                                          id: sub.id,
                                          type: "sub",
                                          name: sub.name,
                                        })
                                      }
                                      disabled={
                                        deletingId === sub.id &&
                                        deletingType === "sub"
                                      }
                                      className="text-red-500 hover:text-red-700 p-1 rounded-md"
                                      aria-label={`Delete sub-category ${sub.name}`}
                                    >
                                      ×
                                    </button>
                                  </div>
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
                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700 leading-none mb-1">
                          {brand.name}
                        </span>
                      </div>
                      <div>
                        <button
                          onClick={() =>
                            setConfirm({
                              open: true,
                              id: brand.id,
                              type: "brand",
                              name: brand.name,
                            })
                          }
                          disabled={deletingId === brand.id && deletingType === "brand"}
                          className="inline-flex items-center gap-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md border border-red-100"
                          aria-label={`Delete brand ${brand.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
