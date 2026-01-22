"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Pencil,
  Upload,
  ChevronDown,
  X,
  Loader2,
  Plus,
  ArrowLeft,
} from "lucide-react";
import apiService from "@/api/api";
import toast from "react-hot-toast";
import {
  CATEGORY_API,
  SUB_CATEGORY_API,
  BRAND_API,
  PRODUCT_API,
} from "@/api/apiEndPoint";
import Link from "next/link";

const ManageProduct = () => {
  const params = useParams();
  const productId = params.id;

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [formData, setFormData] = useState({
    category_id: "",
    sub_category_id: "",
    brand_id: "",
    stock: "",
    name: "",
    short_description: "",
    description: "",
    regular_price: "",
    discount: "10%",
    emi: "1200",
    display_amount: "",
  });

  const [specs, setSpecs] = useState([{ key: "", value: "" }]);
  const [images, setImages] = useState([]);
  const [existingMainImage, setExistingMainImage] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cat, sub, br, productRes] = await Promise.all([
          apiService.get(CATEGORY_API),
          apiService.get(SUB_CATEGORY_API),
          apiService.get(BRAND_API),
          apiService.get(`${PRODUCT_API}/${productId}`),
        ]);
        setCategories(cat.data?.data || []);
        setSubCategories(sub.data?.data || []);
        setBrands(br.data?.data || []);

        if (productRes.data?.data) {
          const p = productRes.data.data;
          console.log(p);
          setFormData({
            category_id: p.category_id || "",
            sub_category_id: p.sub_category_id || "",
            brand_id: p.brand_id || "",
            stock: p.stock || "",
            name: p.name || "",
            short_description: p.short_description || "",
            description: p.full_description || p.description || "",
            regular_price: p.regular_price || "",
            discount: p.discount || "0",
            emi: p.emi_status || "0",
            display_amount: p.sale_price || "",
          });

          if (p.specifications) {
            try {
              const parsedSpecs =
                typeof p.specifications === "string"
                  ? JSON.parse(p.specifications)
                  : p.specifications;

              setSpecs(
                parsedSpecs.map((s) => ({
                  key: s.name || s.key,
                  value: s.value,
                })),
              );
            } catch (e) {
              setSpecs([{ key: "", value: "" }]);
            }
          }
          setExistingMainImage(p.main_image || p.image || null);
        }
      } catch (e) {
        console.error("Fetch error", e);
        toast.error("Failed to load product data");
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchData();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const addSpec = () => setSpecs([...specs, { key: "", value: "" }]);
  const removeSpec = (index) => setSpecs(specs.filter((_, i) => i !== index));

  const handleFile = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 4) return toast.error("Max 4 images");
    setImages([...images, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const data = new FormData();

      data.append("name", formData.name);
      data.append("regular_price", formData.regular_price);
      data.append("sale_price", formData.display_amount);
      data.append("category_id", formData.category_id);
      data.append("sub_category_id", formData.sub_category_id);
      data.append("brand_id", formData.brand_id);
      data.append("short_description", formData.short_description);
      data.append("full_description", formData.description);
      data.append("stock", formData.stock);
      data.append("discount", formData.discount);
      data.append("emi_status", formData.emi);

      const formattedSpecs = specs
        .filter((s) => s.key && s.value)
        .map((s) => ({ name: s.key, value: s.value }));
      data.append("specifications", JSON.stringify(formattedSpecs));

      if (images.length > 0) {
        data.append("main_image", images[0]);

        const dummyExtraJson = images.slice(1).map((_, idx) => ({ id: idx }));
        data.append("extra_images", JSON.stringify(dummyExtraJson));

        images.slice(1).forEach((img) => {
          data.append("extra_images_files[]", img);
        });
      } else if (existingMainImage) {
        data.append("main_image", existingMainImage);
      }

      data.append("_method", "PUT");
      await apiService.post(`${PRODUCT_API}/${productId}`, data);

      toast.success("Product Updated Successfully!");
      setImages([]);
    } catch (err) {
      console.error("Update failed", err);
      const serverData = err.response?.data || err.data || null;
      if (serverData && serverData.errors) {
        const first = Object.values(serverData.errors)[0];
        const msg = Array.isArray(first) ? first[0] : first;
        toast.error(msg || "Update failed");
      } else {
        toast.error(
          serverData?.message ||
            err.message ||
            "Update failed. Please try again.",
        );
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-slate-500">
        Loading Product Data...
      </div>
    );

  return (
    <div className="w-full text-[#475569]">
      <Link
        href={"/dashboard/products_manage"}
        className="text-sm md:text-base text-gray-400 pb-4 flex flex-row items-center gap-2"
      >
        <ArrowLeft />
        Back
      </Link>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Row 1: Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputWrapper label="Select Main Category">
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="custom-select"
            >
              <option value="">Select Main Category</option>
              {categories.map((c) => (
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
            >
              <option value="">Select Sub Category</option>
              {subCategories
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

        {/* Row 2: Brand & Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputWrapper label="Select Brands">
            <select
              name="brand_id"
              value={formData.brand_id}
              onChange={handleChange}
              className="custom-select"
            >
              <option value="">Select brands</option>
              {brands.map((b) => (
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
          <InputWrapper label="Quantity">
            <input
              type="text"
              name="stock"
              value={formData.stock}
              placeholder="Type quantity"
              onChange={handleChange}
              className="custom-input"
            />
          </InputWrapper>
        </div>

        {/* Product Name */}
        <InputWrapper label="Products Name">
          <input
            type="text"
            name="name"
            value={formData.name}
            placeholder="Type here"
            onChange={handleChange}
            className="custom-input pr-12"
          />
          <Pencil
            className="absolute right-4 top-3.5 text-slate-300"
            size={18}
          />
        </InputWrapper>

        {/* Short Details */}
        <InputWrapper label="Short Details">
          <input
            type="text"
            name="short_description"
            value={formData.short_description}
            placeholder="Type here"
            onChange={handleChange}
            className="custom-input pr-12"
          />
          <Pencil
            className="absolute right-4 top-3.5 text-slate-300"
            size={18}
          />
        </InputWrapper>

        {/* Description */}
        <InputWrapper label="Products Description">
          <textarea
            name="description"
            value={formData.description}
            placeholder="Type here"
            rows={5}
            onChange={handleChange}
            className="custom-input pr-12 resize-none py-3"
          />
          <Pencil className="absolute right-4 top-4 text-slate-300" size={18} />
        </InputWrapper>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InputWrapper label="Price (BDT)">
            <input
              type="text"
              name="regular_price"
              value={formData.regular_price}
              placeholder="Type amount"
              onChange={handleChange}
              className="custom-input"
            />
            <Pencil
              className="absolute right-4 top-3.5 text-slate-300"
              size={18}
            />
          </InputWrapper>
          <InputWrapper label="Discount (Percentage)">
            <input
              type="text"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              className="custom-input"
            />
            <Pencil
              className="absolute right-4 top-3.5 text-slate-300"
              size={18}
            />
          </InputWrapper>
          <InputWrapper label="EMI">
            <input
              type="text"
              name="emi"
              value={formData.emi}
              onChange={handleChange}
              className="custom-input"
            />
          </InputWrapper>
          <InputWrapper label="Display Amount (BDT)">
            <input
              type="text"
              name="display_amount"
              value={formData.display_amount}
              onChange={handleChange}
              className="custom-input"
            />
          </InputWrapper>
        </div>

        {/* Technical Specs */}
        <div className="space-y-4">
          {specs.map((spec, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row gap-4 items-end"
            >
              <div className="flex-1 w-full">
                <InputWrapper label={idx === 0 ? "Technical Name" : ""}>
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) =>
                      handleSpecChange(idx, "key", e.target.value)
                    }
                    placeholder="Type here"
                    className="custom-input"
                  />
                  <Pencil
                    className="absolute right-4 top-3.5 text-slate-300"
                    size={18}
                  />
                </InputWrapper>
              </div>
              <div className="flex-1 w-full">
                <InputWrapper label={idx === 0 ? "Technical Specs" : ""}>
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) =>
                      handleSpecChange(idx, "value", e.target.value)
                    }
                    placeholder="Type here"
                    className="custom-input"
                  />
                  <Pencil
                    className="absolute right-4 top-3.5 text-slate-300"
                    size={18}
                  />
                </InputWrapper>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => removeSpec(idx)}
                  className="h-13 w-13 flex items-center justify-center bg-[#ff0000] text-white rounded-lg"
                >
                  <X size={24} strokeWidth={3} />
                </button>
                {idx === specs.length - 1 && (
                  <button
                    type="button"
                    onClick={addSpec}
                    className="h-13 w-13 flex items-center justify-center bg-[#38bdf8] text-white rounded-lg"
                  >
                    <Plus size={24} strokeWidth={3} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Upload Images Section */}
        <div className="space-y-4 pt-2">
          <label className="text-[15px] font-medium text-[#64748b]">
            Upload Images (upto 4)
          </label>
          <div className="border-[1.5px] border-[#38bdf8]/30 border-dashed rounded-md p-4 flex items-center gap-3 cursor-pointer hover:bg-sky-50 transition-colors relative">
            <Upload className="text-[#38bdf8]" size={20} />
            <span className="text-[#94a3b8] text-sm">Choose a file</span>
            <input
              type="file"
              multiple
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFile}
            />
          </div>
          <div className="space-y-3">
            {/* Show existing main image when no new images selected */}
            {existingMainImage && images.length === 0 && (
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100">
                  <img
                    src={existingMainImage}
                    alt={formData.name || "main image"}
                    className="w-full h-full object-cover"
                    onError={(e) =>
                      (e.currentTarget.src = "/images/monitor.jpg")
                    }
                  />
                </div>
                <div className="flex-1 text-sm text-gray-700">
                  Current Main Image
                </div>
                <button
                  type="button"
                  onClick={() => setExistingMainImage(null)}
                  className="text-[#ff4d4f]"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {images.map((file, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="text-[#38bdf8]">
                  <Upload size={18} />
                </div>
                <span className="text-sm text-[#94a3b8] flex-1">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setImages(images.filter((_, idx) => idx !== i))
                  }
                >
                  <X className="text-[#ff4d4f]" size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={updating}
            className="w-full md:w-auto px-10 py-4 bg-[#38bdf8] text-white rounded-xl font-semibold text-[16px] shadow-lg shadow-sky-100 hover:bg-sky-500 transition-all flex items-center justify-center gap-3"
          >
            {updating ? <Loader2 className="animate-spin" /> : "Update Product"}
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
          transition: border-color 0.2s;
        }
        .custom-input:focus,
        .custom-select:focus {
          border-color: #38bdf8;
        }
        .custom-select {
          appearance: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

const InputWrapper = ({ label, children }) => (
  <div className="flex flex-col gap-2 w-full">
    {label && (
      <label className="text-[15px] font-medium text-[#64748b]">{label}</label>
    )}
    <div className="relative w-full">{children}</div>
  </div>
);

export default ManageProduct;
