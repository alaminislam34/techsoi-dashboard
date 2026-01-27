"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Upload, ChevronDown, X, Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import {
  CATEGORY_API,
  SUB_CATEGORY_API,
  BRAND_API,
  PRODUCT_API,
} from "@/api/apiEndPoint";
import apiService from "@/api/api";
import InputWrapper from "./components/InputWrapper";
import SpecsEditor from "./components/SpecsEditor";
import ImageUploader from "./components/ImageUploader";
import useCreateProduct from "./hooks/useCreateProduct";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type FormState = {
  name: string;
  regular_price: string;
  discount: string;
  sale_price: string;
  stock: string;
  category_id: string;
  sub_category_id: string;
  brand_id: string;
  short_description: string;
  emi_status: string;
  full_description: string;
};

export default function AddProduct() {
  const [formData, setFormData] = useState<FormState>({
    name: "",
    regular_price: "",
    discount: "",
    sale_price: "",
    stock: "",
    category_id: "",
    sub_category_id: "",
    brand_id: "",
    short_description: "",
    emi_status: "1",
    full_description: "",
  });

  const [specs, setSpecs] = useState<{ name: string; value: string }[]>([
    { name: "", value: "" },
  ]);
  const [images, setImages] = useState<Array<File | string>>([]);
  const { submitProduct, isPending: submitting } = useCreateProduct();

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

  const resetForm = () => {
    setFormData({
      name: "",
      regular_price: "",
      discount: "",
      sale_price: "",
      stock: "",
      category_id: "",
      sub_category_id: "",
      brand_id: "",
      short_description: "",
      emi_status: "1",
      full_description: "",
    });
    setSpecs([{ name: "", value: "" }]);
    setImages([]);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecChange = (
    index: number,
    field: "name" | "value",
    value: string,
  ) => {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  };

  // Helper that inspects file.type and file signature bytes to confirm it's an image
  async function fileLooksLikeImage(file: File) {
    if (file.type && String(file.type).startsWith("image/")) return true;
    try {
      const buf = await file.arrayBuffer();
      const arr = new Uint8Array(buf);
      if (arr.length >= 4) {
        // JPEG
        if (arr[0] === 0xff && arr[1] === 0xd8 && arr[2] === 0xff) return true;
        // PNG
        if (
          arr[0] === 0x89 &&
          arr[1] === 0x50 &&
          arr[2] === 0x4e &&
          arr[3] === 0x47
        )
          return true;
        // GIF
        if (
          arr[0] === 0x47 &&
          arr[1] === 0x49 &&
          arr[2] === 0x46 &&
          arr[3] === 0x38
        )
          return true;
        // WEBP (RIFF....WEBP)
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

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Validate each file by signature and type
    const validated: File[] = [];
    const invalidByMagic: File[] = [];

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

    // Build existing keys to detect duplicates (name:size)
    const existingKeys = new Set(
      images.map((it) =>
        it instanceof File ? `${it.name}:${(it as File).size}` : it?.toString(),
      ),
    );

    const uniqueNew: File[] = [];
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

    // Enforce max 5 images
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!images.length) {
      return toast.error("Main image is required");
    }

    // Ensure main image is a File and actually looks like an image (type or signature)
    const main = images[0];
    if (!(main instanceof File) || !(await fileLooksLikeImage(main as File))) {
      return toast.error(
        "The main image must be an image file. Please re-upload a valid image.",
      );
    }

    const validSpecs = specs.filter((s) => s.name.trim() && s.value.trim());

    if (!validSpecs.length) {
      return toast.error("At least one specification required");
    }

    const payload = {
      fields: { ...formData, quantity: formData.stock },
      specs: JSON.parse(JSON.stringify(validSpecs)),
      images: [...images],
    };

    try {
      await submitProduct(payload as any);
      resetForm();
    } catch (err: any) {
      console.error("submitProduct failed (raw):", err);
      const msg =
        err?.message ||
        (err?.data && err.data.message) ||
        "Failed to publish product";
      toast.error(msg);
    }
  };

  return (
    <div className="w-full text-[#475569]">
      <div className="mb-4">
        <Link
          href={"/dashboard/products_manage"}
          className="flex flex-row items-center gap-2 text-gray-400"
        >
          <ArrowLeft /> Back
        </Link>
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
              {dropdowns.categories.map((c: any) => (
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
                  (s: any) =>
                    String(s.category_id) === String(formData.category_id),
                )
                .map((s: any) => (
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
              {dropdowns.brands.map((b: any) => (
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
              min={0}
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

        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto px-10 py-4 bg-[#38bdf8] text-white rounded-xl font-semibold shadow-lg hover:bg-sky-500 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {submitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Publish Product"
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
