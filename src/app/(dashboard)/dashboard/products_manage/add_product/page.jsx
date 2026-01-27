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

const AddProduct = () => {
  const [formData, setFormData] = useState({
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

  const [specs, setSpecs] = useState([{ name: "", value: "" }]);
  const [images, setImages] = useState([]);
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

  // Product creation (POST-only) is handled by `useCreateProduct` hook which performs retries and background retry logic.

  // Helper to extract created id from server error responses (removed in POST-only flow)
  // const extractCreatedIdFromError = (err) => {
  //   try {
  //     const data = err?.response?.data || err?.data || null;
  //     if (!data) return null;
  //     return (
  //       data?.data?.id ||
  //       data?.data?.product_id ||
  //       data?.id ||
  //       data?.product_id ||
  //       null
  //     );
  //   } catch (e) {
  //     return null;
  //   }
  // };

  // pushDetails removed: we now send full product data (including extra images and specifications)
  // in a single POST request to PRODUCT_API. The server should accept all fields in one request.

  // Full upload retry/fallback logic moved to `useCreateProduct` hook.

  const resetForm = () => {
    setFormData({
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
    setSpecs([{ name: "", value: "" }]);
    setImages([]);
  };

  // twoStepCreate removed: we rely on a single POST that contains all fields and files

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecChange = (index, field, value) => {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  };

  const handleFile = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      return toast.error("Max 5 images allowed");
    }
    setImages([...images, ...files]);
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

    // Validate stock: required and must be a non-negative integer
    const stockValue = Number(formData.stock);
    if (
      formData.stock === "" ||
      Number.isNaN(stockValue) ||
      stockValue < 0 ||
      !Number.isInteger(stockValue)
    ) {
      return toast.error(
        "Stock is required and must be a non-negative integer",
      );
    }

    const payload = {
      fields: { ...formData },
      specs: JSON.parse(JSON.stringify(validSpecs)),
      images: [...images],
    };

    try {
      await submitProduct(payload);
      resetForm();
    } catch (err) {
      // Log detailed error information to help debugging
      try {
        console.error("submitProduct failed (raw):", err);
        console.error(
          "submitProduct failed (serialized):",
          JSON.stringify(err, Object.getOwnPropertyNames(err)),
        );
      } catch (logErr) {
        console.error("Failed to serialize submit error", logErr);
      }

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

        <SpecsEditor
          className="custom-input"
          specs={specs}
          onChangeSpec={handleSpecChange}
          onRemoveSpec={(idx) => setSpecs(specs.filter((_, i) => i !== idx))}
          onAddSpec={() => setSpecs([...specs, { name: "", value: "" }])}
        />

        <ImageUploader
          images={images}
          onFileChange={handleFile}
          onRemoveImage={(i) => setImages(images.filter((_, idx) => idx !== i))}
        />

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
};

export default AddProduct;
