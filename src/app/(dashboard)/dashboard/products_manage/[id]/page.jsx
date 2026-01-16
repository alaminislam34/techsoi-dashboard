"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Pencil, Upload, ChevronDown, X, Loader2, Plus } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  GET_CATEGORY_API,
  GET_SUB_CATEGORY_API,
  GET_BRAND_API,
} from "@/api/apiEndPoint";

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
    display_amount: "250",
  });

  const [specs, setSpecs] = useState([
    { key: "Height", value: "5.5 ft" },
    { key: "", value: "" },
  ]);

  const [images, setImages] = useState([]);

  // Fetch all data and pre-fill form
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cat, sub, br, productRes] = await Promise.all([
          axios.get(GET_CATEGORY_API),
          axios.get(GET_SUB_CATEGORY_API),
          axios.get(GET_BRAND_API),
          axios.get(`https://api.techsoibd.com/api/product/${productId}`),
        ]);

        setCategories(cat.data?.data || []);
        setSubCategories(sub.data?.data || []);
        setBrands(br.data?.data || []);

        if (productRes.data?.data) {
          const p = productRes.data.data;
          setFormData({
            category_id: p.category_id || "",
            sub_category_id: p.sub_category_id || "",
            brand_id: p.brand_id || "",
            stock: p.stock || "",
            name: p.name || "",
            short_description: p.short_description || "",
            description: p.description || "",
            regular_price: p.regular_price || "",
            discount: p.discount || "10%",
            emi: p.emi || "1200",
            display_amount: p.sale_price || "",
          });
          if (p.specs) setSpecs(JSON.parse(p.specs));
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
      Object.keys(formData).forEach((k) => data.append(k, formData[k]));
      data.append("specs", JSON.stringify(specs));
      images.forEach((img) => data.append("images[]", img));

      await axios.post(
        `https://api.techsoibd.com/api/product/${productId}`,
        data
      );
      toast.success("Product Updated!");
    } catch (err) {
      toast.error("Update failed");
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
                  (s) => String(s.category_id) === String(formData.category_id)
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
