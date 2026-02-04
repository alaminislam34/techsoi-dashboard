"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Loader2,
  Trash2,
  ArrowLeft,
  ChevronDown,
  Pencil,
  Save,
} from "lucide-react";
import apiService from "@/api/api";
import Swal from "sweetalert2";
import {
  PRODUCT_API,
  PRODUCT_SLUG_API,
  CATEGORY_API,
  SUB_CATEGORY_API,
  BRAND_API,
} from "@/api/apiEndPoint";
import InputWrapper from "../add_product/components/InputWrapper";
import SpecsEditor from "../add_product/components/SpecsEditor";
import ImageUploader from "../add_product/components/ImageUploader";
import useUpdateProduct from "./hooks/useUpdateProduct";

export default function ManageProduct() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const productSlug = params?.slug;

  const [productId, setProductId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    regular_price: "",
    discount: "",
    sale_price: "",
    stock: 1,
    category_id: "",
    sub_category_id: "",
    brand_id: "",
    short_description: "",
    emi_status: "1",
    full_description: "",
  });
  const [specs, setSpecs] = useState([{ name: "", value: "" }]);
  const [images, setImages] = useState([]);
  const { submitUpdate, isPending: isUpdating } = useUpdateProduct();

  // Fetch Dropdowns
  const {
    data: dropdowns = { categories: [], subCategories: [], brands: [] },
  } = useQuery({
    queryKey: ["product-form-data"],
    queryFn: async () => {
      const [cat, sub, br] = await Promise.all([
        apiService.get(CATEGORY_API),
        apiService.get(SUB_CATEGORY_API),
        apiService.get(BRAND_API),
      ]);
      return {
        categories: cat.data?.data || [],
        subCategories: sub.data?.data || [],
        brands: br.data?.data || [],
      };
    },
  });

  const {
    data: product,
    isLoading: isProductLoading,
    isError: isProductError,
  } = useQuery({
    queryKey: ["product", productSlug],
    queryFn: async () => {
      const productRes = await apiService.get(PRODUCT_SLUG_API(productSlug));
      const p = productRes.data.data;
      setProductId(p.id);
      return p;
    },
    enabled: !!productSlug,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiService.delete(`${PRODUCT_API}/${id}`),
    onSuccess: () => {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries(["products"]);
      router.push("/dashboard/products_manage");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete product");
    },
  });

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete!",
      cancelButtonText: "No, cancel",
      background: "#ffffff",
      customClass: {
        title: "text-xl font-semibold text-dark",
        confirmButton: "px-4 py-2 rounded-md text-sm font-medium",
        cancelButton: "px-4 py-2 rounded-md text-sm font-medium",
      },
    });

    if (result.isConfirmed) {
      deleteMutation.mutate(productId);
    }
  };

  const safeParse = (data) => {
    if (!data) return [];
    if (typeof data !== "string") return data;
    try {
      return JSON.parse(data);
    } catch (e) {
      return typeof data === "string" && data.startsWith("http") ? [data] : [];
    }
  };

  useEffect(() => {
    if (product) {
      const p = product;
      const d = p.details || {};

      setFormData({
        name: p.name || "",
        regular_price: p.regular_price || "",
        discount: p.discount || "",
        sale_price: p.sale_price || "",
        stock: p.stock || 1,
        category_id: p.category_id || "",
        sub_category_id: p.sub_category_id || "",
        brand_id: p.brand_id || "",
        short_description: p.short_description || "",
        emi_status: p.emi_status ? String(p.emi_status) : "1",
        full_description: d.full_description || "",
      });

      const parsedSpecs = safeParse(d.specifications);
      if (Array.isArray(parsedSpecs) && parsedSpecs.length > 0) {
        setSpecs(
          parsedSpecs.map((spec) => ({
            name: spec.name || spec.key || "",
            value: spec.value || "",
          })),
        );
      }

      // Parse images
      const imagesList = [];
      if (p.main_image) {
        imagesList.push(p.main_image);
      }
      const extraImgs = safeParse(d.extra_images);
      if (Array.isArray(extraImgs)) {
        extraImgs.forEach((img) => {
          const url = typeof img === "string" ? img : img.url;
          if (url) imagesList.push(url);
        });
      }
      setImages(imagesList);
    }
  }, [product]);

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  };

  // Image validation helper
  async function fileLooksLikeImage(file) {
    if (file.type && String(file.type).startsWith("image/")) return true;
    try {
      const buf = await file.arrayBuffer();
      const arr = new Uint8Array(buf);
      if (arr.length >= 4) {
        if (arr[0] === 0xff && arr[1] === 0xd8 && arr[2] === 0xff) return true;
        if (
          arr[0] === 0x89 &&
          arr[1] === 0x50 &&
          arr[2] === 0x4e &&
          arr[3] === 0x47
        )
          return true;
        if (
          arr[0] === 0x47 &&
          arr[1] === 0x49 &&
          arr[2] === 0x46 &&
          arr[3] === 0x38
        )
          return true;
        if (
          arr[0] === 0x52 &&
          arr[1] === 0x49 &&
          arr[2] === 0x46 &&
          arr[3] === 0x46 &&
          arr[8] === 0x57 &&
          arr[9] === 0x45 &&
          arr[10] === 0x42 &&
          arr[11] === 0x50
        )
          return true;
      }
    } catch (e) {
      // ignore
    }
    return false;
  }

  const handleFile = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validated = [];
    const invalidByMagic = [];

    for (const f of files) {
      if (!(f instanceof File)) continue;
      const ok = await fileLooksLikeImage(f);
      if (ok) validated.push(f);
      else invalidByMagic.push(f);
    }

    if (invalidByMagic.length) {
      toast.error(
        `${invalidByMagic.length} file(s) ignored: not valid image files.`,
      );
    }

    if (!validated.length) return;

    const existingKeys = new Set(
      images.map((it) =>
        it instanceof File ? `${it.name}:${it.size}` : it?.toString(),
      ),
    );

    const uniqueNew = [];
    for (const f of validated) {
      const key = `${f.name}:${f.size}`;
      if (!existingKeys.has(key)) {
        existingKeys.add(key);
        uniqueNew.push(f);
      }
    }

    if (!uniqueNew.length) {
      toast.error("No new image files to add (duplicates ignored)");
      return;
    }

    const allowed = Math.max(0, 5 - images.length);
    if (allowed <= 0) {
      return toast.error("Max 5 images allowed");
    }

    let toAdd = uniqueNew.slice(0, allowed);
    const dropped = uniqueNew.length - toAdd.length;
    if (dropped > 0) {
      toast.error(
        `Only ${allowed} images allowed. ${dropped} file(s) were ignored.`,
      );
    }

    setImages([...images, ...toAdd]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!images.length) {
      return toast.error("Main image is required");
    }

    const validSpecs = specs.filter((s) => s.name.trim() && s.value.trim());

    if (!validSpecs.length) {
      return toast.error("At least one specification required");
    }

    const payload = {
      productId: productId,
      fields: { ...formData, quantity: formData.stock },
      specs: JSON.parse(JSON.stringify(validSpecs)),
      images: [...images],
    };

    try {
      await submitUpdate(payload);
      // toast.success("Product updated successfully!");
      queryClient.invalidateQueries(["product", productSlug]);
    } catch (err) {
      console.error("submitUpdate failed:", err);
      const msg =
        err?.message || err?.data?.message || "Failed to update product";
      toast.error(msg);
    }
  };

  if (isProductLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#32afe2] mb-2" size={40} />
        <p className="text-gray-500">Loading product information...</p>
      </div>
    );
  }

  if (isProductError) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 font-medium mb-4">Error loading product.</p>
        <button
          onClick={() => router.push("/dashboard/products_manage")}
          className="bg-[#32afe2] text-white px-6 py-2 rounded-lg"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="text-[#475569]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Update Product</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/dashboard/products_manage")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-4 py-2 border border-gray-300 rounded-lg transition-all"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Trash2 size={18} />
            )}
            Delete
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputWrapper label="Select Main Category">
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="custom-select"
              required
            >
              <option value="">Select Main Category</option>
              {dropdowns.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-4 top-3.5 text-slate-400 pointer-events-none"
              size={20}
            />
          </InputWrapper>

          <InputWrapper label="Select Sub Category">
            <select
              name="sub_category_id"
              value={formData.sub_category_id}
              onChange={handleChange}
              className="custom-select"
              required
            >
              <option value="">Select Sub Category</option>
              {dropdowns.subCategories
                .filter(
                  (s) => String(s.category_id) === String(formData.category_id),
                )
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
            <ChevronDown
              className="absolute right-4 top-3.5 text-slate-400 pointer-events-none"
              size={20}
            />
          </InputWrapper>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputWrapper label="Select Brands">
            <select
              name="brand_id"
              value={formData.brand_id}
              onChange={handleChange}
              className="custom-select"
              required
            >
              <option value="">Select brands</option>
              {dropdowns.brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-4 top-3.5 text-slate-400 pointer-events-none"
              size={20}
            />
          </InputWrapper>
          <InputWrapper label="EMI Status">
            <select
              name="emi_status"
              value={formData.emi_status}
              onChange={handleChange}
              className="custom-select"
            >
              <option value="1">Available</option>
              <option value="0">Not Available</option>
            </select>
            <ChevronDown
              className="absolute right-4 top-3.5 text-slate-400 pointer-events-none"
              size={20}
            />
          </InputWrapper>
        </div>

        <InputWrapper label="Products Name">
          <input
            type="text"
            name="name"
            value={formData.name}
            placeholder="Type product name"
            onChange={handleChange}
            className="custom-input pr-12"
            required
          />
          <Pencil
            className="absolute right-4 top-3.5 text-slate-300"
            size={18}
          />
        </InputWrapper>

        <InputWrapper label="Short Details">
          <input
            type="text"
            name="short_description"
            value={formData.short_description}
            placeholder="Type short description"
            onChange={handleChange}
            className="custom-input pr-12"
          />
          <Pencil
            className="absolute right-4 top-3.5 text-slate-300"
            size={18}
          />
        </InputWrapper>

        <InputWrapper label="Full Description">
          <textarea
            name="full_description"
            value={formData.full_description}
            placeholder="Type full description"
            rows={4}
            onChange={handleChange}
            className="custom-input h-auto! py-3 pr-12 resize-none"
          />
          <Pencil className="absolute right-4 top-4 text-slate-300" size={18} />
        </InputWrapper>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <InputWrapper label="Regular Price">
            <input
              type="number"
              name="regular_price"
              value={formData.regular_price}
              placeholder="0.00"
              onChange={handleChange}
              className="custom-input"
              required
            />
          </InputWrapper>
          <InputWrapper label="Discount Amount">
            <input
              type="number"
              name="discount"
              value={formData.discount}
              placeholder="0.00"
              onChange={handleChange}
              className="custom-input"
            />
          </InputWrapper>
          <InputWrapper label="Sale Price">
            <input
              type="number"
              name="sale_price"
              value={formData.sale_price}
              placeholder="0.00"
              onChange={handleChange}
              className="custom-input"
              required
            />
          </InputWrapper>
          <InputWrapper label="Stock">
            <input
              type="number"
              name="stock"
              value={formData.stock}
              placeholder="0"
              min={1}
              step={1}
              onChange={handleChange}
              className="custom-input"
              required
            />
          </InputWrapper>
        </div>

        <div>
          <SpecsEditor
            className="w-full inline-block"
            specs={specs}
            onChangeSpec={handleSpecChange}
            onRemoveSpec={(idx) => setSpecs(specs.filter((_, i) => i !== idx))}
            onAddSpec={() => setSpecs([...specs, { name: "", value: "" }])}
          />
        </div>

        <div>
          <ImageUploader
            images={images}
            onFileChange={handleFile}
            onRemoveImage={(i) =>
              setImages(images.filter((_, idx) => idx !== i))
            }
          />
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="submit"
            disabled={isUpdating}
            className="w-full md:w-auto px-10 py-4 bg-[#38bdf8] text-white rounded-xl font-semibold shadow-lg hover:bg-sky-500 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isUpdating ? (
              <>
                <Loader2 className="animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save size={20} />
                Update Product
              </>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        .custom-input,
        .custom-select {
          width: 100%;
          height: 52px;
          padding: 0 1rem;
          background: #fff;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          font-size: 15px;
          color: #1e293b;
          outline: none;
        }
        .custom-input:focus,
        .custom-select:focus {
          border-color: #38bdf8;
        }
        .custom-select {
          appearance: none;
          cursor: pointer;
        }
        .h-13 {
          height: 52px;
        }
        .w-13 {
          width: 52px;
        }
      `}</style>
    </div>
  );
}
