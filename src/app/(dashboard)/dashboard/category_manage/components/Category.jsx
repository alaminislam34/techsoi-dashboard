"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  AlertCircle,
  RefreshCw,
  Package,
  Tag,
  Layers,
  Trash2,
  Edit3,
  X,
  Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { useInventory } from "@/api/hooks/useInventory";
import { useUpdate } from "@/api/hooks/useUpdate";
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

  const { updateCategory, updateSubCategory, updateBrand } = useUpdate();

  // States
  const [deletingId, setDeletingId] = useState(null);
  const [deletingType, setDeletingType] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [confirm, setConfirm] = useState({
    open: false,
    id: null,
    type: null,
    name: "",
  });

  const [fkModal, setFkModal] = useState({
    open: false,
    id: null,
    name: "",
    message: "",
  });

  // Unified Edit Modal State
  const [editModal, setEditModal] = useState({
    open: false,
    type: null,
    data: { id: "", name: "", image: null, banner: null },
    previews: { image: "", banner: "" },
  });

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setEditModal((prev) => ({
        ...prev,
        data: { ...prev.data, [field]: file },
        previews: { ...prev.previews, [field]: URL.createObjectURL(file) },
      }));
    }
  };

  const handleDelete = async ({ id, type, name }) => {
    if (!id) {
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
      const serverMsg = err?.message || err?.data?.message || "Delete failed";
      const fkPatterns = [
        "Cannot delete or update a parent row",
        "foreign key",
        "1451",
      ];
      if (
        fkPatterns.some((p) =>
          serverMsg.toLowerCase().includes(p.toLowerCase()),
        ) &&
        type === "brand"
      ) {
        setFkModal({ open: true, id, name, message: serverMsg });
      } else {
        toast.error(serverMsg);
      }
    } finally {
      setDeletingId(null);
      setDeletingType(null);
      setConfirm({ open: false, id: null, type: null, name: "" });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const { id, name, image, banner } = editModal.data;

    try {
      const formData = new FormData();
      formData.append("name", name);
      if (image instanceof File) formData.append("image", image);
      if (banner instanceof File) formData.append("banner", banner);

      if (editModal.type === "category") {
        await updateCategory(id, formData);
      } else if (editModal.type === "sub") {
        await updateSubCategory(id, formData);
      } else if (editModal.type === "brand") {
        await updateBrand(id, formData);
      }

      toast.success("Updated successfully");
      refreshInventory();
      setEditModal({
        open: false,
        type: null,
        data: { id: "", name: "", image: null, banner: null },
        previews: { image: "", banner: "" },
      });
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

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
      {/* --- DELETE CONFIRM MODAL --- */}
      {confirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-slate-800">
              Confirm delete
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Are you sure you want to delete{" "}
              <strong className="text-slate-800">{confirm.name}</strong>?
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() =>
                  setConfirm({ open: false, id: null, type: null, name: "" })
                }
                className="px-4 py-2 rounded-md bg-slate-100 text-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirm)}
                disabled={deletingId === confirm.id}
                className="px-4 py-2 rounded-md bg-red-600 text-white disabled:opacity-60"
              >
                {deletingId === confirm.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 capitalize text-lg">
                Edit {editModal.type}
              </h3>
              <button
                onClick={() => setEditModal({ ...editModal, open: false })}
                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editModal.data.name}
                  onChange={(e) =>
                    setEditModal({
                      ...editModal,
                      data: { ...editModal.data, name: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 outline-none transition-all text-sm font-medium"
                />
              </div>

              {editModal.type !== "sub" && (
                <div className="grid grid-cols-1 gap-4">
                  <div className="relative group">
                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                      Profile Image
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 relative overflow-hidden shrink-0">
                        <Image
                          src={
                            editModal.previews.image ||
                            editModal.data.image ||
                            DEFAULT_IMAGE
                          }
                          fill
                          alt="preview"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <label className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-600">
                          <Upload size={16} /> Choose File
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e, "image")}
                        />
                      </label>
                    </div>
                  </div>

                  {editModal.type === "category" && (
                    <div className="relative group">
                      <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
                        Category Banner
                      </label>
                      <div className="flex flex-col gap-3">
                        <div className="w-full h-24 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 relative overflow-hidden">
                          <Image
                            src={
                              editModal.previews.banner ||
                              editModal.data.banner ||
                              DEFAULT_IMAGE
                            }
                            fill
                            alt="preview banner"
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <label className="cursor-pointer">
                          <div className="flex items-center justify-center gap-2 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-sm font-semibold text-slate-600">
                            <Upload size={16} /> Update Banner
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, "banner")}
                          />
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditModal({ ...editModal, open: false })}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-70 shadow-lg shadow-slate-900/10 transition-all"
                >
                  {isUpdating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- FK CONSTRAINT MODAL --- */}
      {fkModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl text-center">
            <div className="h-14 w-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Protected Resource
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              The brand{" "}
              <strong className="text-slate-800">{fkModal.name}</strong> is
              currently linked to active products. Please reassign products
              before deleting.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <a
                href={`/dashboard/products_manage?brand=${fkModal.id}`}
                className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-sm"
              >
                View Linked Products
              </a>
              <button
                onClick={() =>
                  setFkModal({ open: false, id: null, name: "", message: "" })
                }
                className="w-full py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm"
              >
                Close
              </button>
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

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
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
                                    src={category.image}
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
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() =>
                                    setEditModal({
                                      open: true,
                                      type: "category",
                                      data: {
                                        id: category.id,
                                        name: category.name,
                                        image: category.image,
                                        banner: category.banner,
                                      },
                                      previews: { image: "", banner: "" },
                                    })
                                  }
                                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all"
                                >
                                  <Edit3 size={15} />
                                </button>
                                <button
                                  onClick={() =>
                                    setConfirm({
                                      open: true,
                                      id: category.id,
                                      type: "category",
                                      name: category.name,
                                    })
                                  }
                                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                                >
                                  <Trash2 size={15} />
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
                                    className="group inline-flex items-center gap-2 bg-white border border-slate-100 px-2 py-1 rounded-lg text-slate-600 text-sm hover:border-slate-300 transition-all shadow-sm"
                                  >
                                    <span>
                                      {sub.image ? (
                                        <Image
                                          src={sub.image}
                                          alt={sub.name}
                                          width={24}
                                          height={24}
                                          className="object-cover rounded-lg border border-slate-100"
                                          unoptimized
                                        />
                                      ) : (
                                        <div className="h-6 w-6 rounded-xl bg-slate-200 border border-slate-100"></div>
                                      )}
                                    </span>
                                    <span className="leading-none font-medium">
                                      {sub.name}
                                    </span>
                                    <div className="flex items-center border-l border-slate-100 ml-1 pl-1">
                                      <button
                                        disabled
                                        onClick={() =>
                                          setEditModal({
                                            open: true,
                                            type: "sub",
                                            data: {
                                              id: sub.id,
                                              name: sub.name,
                                            },
                                            previews: { image: "", banner: "" },
                                          })
                                        }
                                        className="text-slate-400 hover:text-slate-900 px-1"
                                      >
                                        <Edit3 size={11} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          setConfirm({
                                            open: true,
                                            id: sub.id,
                                            type: "sub",
                                            name: sub.name,
                                          })
                                        }
                                        className="text-red-400 hover:text-red-600 px-1"
                                      >
                                        ×
                                      </button>
                                    </div>
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
            <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full font-bold">
              {brands.length}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 overflow-hidden flex flex-col shadow-sm">
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
                    className="flex items-center gap-3 p-2 group hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100 hover:shadow-sm"
                  >
                    <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-100 bg-white relative shrink-0">
                      <Image
                        src={brand.image || DEFAULT_IMAGE}
                        fill
                        alt={brand.slug}
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 flex items-center justify-between overflow-hidden">
                      <span className="text-sm font-bold text-slate-700 truncate mr-2">
                        {brand.name}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          disabled
                          onClick={() =>
                            setEditModal({
                              open: true,
                              type: "brand",
                              data: {
                                id: brand.id,
                                name: brand.name,
                                image: brand.image,
                              },
                              previews: { image: "", banner: "" },
                            })
                          }
                          className="p-1.5 text-slate-500 hover:text-slate-900 bg-white shadow-sm border border-slate-100 rounded-md transition-all"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() =>
                            setConfirm({
                              open: true,
                              id: brand.id,
                              type: "brand",
                              name: brand.name,
                            })
                          }
                          className="p-1.5 text-red-500 hover:text-red-600 bg-white shadow-sm border border-slate-100 rounded-md transition-all"
                        >
                          <Trash2 size={13} />
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
            <div className="p-3 bg-white border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter text-center">
                Syncing with Master Directory
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;
