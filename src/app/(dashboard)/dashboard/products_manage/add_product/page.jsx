"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Upload, ChevronDown, X, Loader2, Plus } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  CATEGORY_API,
  SUB_CATEGORY_API,
  BRAND_API,
  PRODUCT_API,
} from "@/api/apiEndPoint";

const AddProduct = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  // Updated state keys to match your JSON structure
  const [formData, setFormData] = useState({
    name: "",
    regular_price: "",
    discount: "",
    sale_price: "",
    category_id: "",
    sub_category_id: "",
    brand_id: "",
    short_description: "",
    emi_status: "1",
    full_description: "",
  });

  // Specs updated to name/value keys
  const [specs, setSpecs] = useState([{ name: "Height", value: "" }]);

  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cat, sub, br] = await Promise.all([
          axios.get(CATEGORY_API),
          axios.get(SUB_CATEGORY_API),
          axios.get(BRAND_API),
        ]);
        setCategories(cat.data?.data || []);
        setSubCategories(sub.data?.data || []);
        setBrands(br.data?.data || []);
      } catch (e) {
        console.error("Data fetch failed");
        toast.error("Failed to load initial data");
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };

  const addSpec = () => setSpecs([...specs, { name: "", value: "" }]);
  const removeSpec = (index) => setSpecs(specs.filter((_, i) => i !== index));

  const handleFile = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5)
      return toast.error("Max 5 images allowed");
    setImages([...images, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) return toast.error("Main image is required");

    setLoading(true);

    try {
      const data = new FormData();

      // 1. Basic Text Fields
      data.append("name", formData.name);
      data.append("regular_price", formData.regular_price);
      data.append("discount", formData.discount);
      data.append("sale_price", formData.sale_price);
      data.append("category_id", formData.category_id);
      data.append("sub_category_id", formData.sub_category_id);
      data.append("brand_id", formData.brand_id);
      data.append("short_description", formData.short_description);
      data.append("emi_status", formData.emi_status);
      data.append("full_description", formData.full_description);

      // 2. Specifications (JSON String)
      data.append("specifications", JSON.stringify(specs));

      // 3. Main Image (Binary File)
      data.append("main_image", images[0]);

      // 4. Extra Images (Laravel Fix)
      const dummyJson = images.slice(1).map((_, index) => ({
        index: index,
      }));

      // Satisfies: "The extra images field must be a valid JSON string"
      data.append("extra_images", JSON.stringify(dummyJson));

      // Sending actual files
      images.slice(1).forEach((file) => {
        data.append("extra_images_files[]", file);
      });

      const response = await axios.post(PRODUCT_API, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
        },
      });
      console.log(response);
      if (response.status === 200) {
        toast.success("Product Created!");

        setFormData({
          name: "",
          regular_price: "",
          discount: "",
          sale_price: "",
          category_id: "",
          sub_category_id: "",
          brand_id: "",
          short_description: "",
          emi_status: "1",
          full_description: "",
        });

        setSpecs([{ name: "", value: "" }]);

        setImages([]);
      } else {
        console.log("somossa ase");
      }
    } catch (err) {
      if (err.response?.status === 422) {
        console.log("Laravel Validation Errors:", err.response.data.errors);
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0][0];
        toast.error(firstError);
      } else {
        console.log(err);
        toast.error("Failed to publish product");
      }
    } finally {
      setLoading(false);
    }
  };

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
              required
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
              required
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

        {/* Row 2: Brand & EMI */}
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

        {/* Product Name */}
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

        {/* Short Details */}
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

        {/* Description */}
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

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
        </div>

        {/* Technical Specs */}
        <div className="space-y-4">
          <label className="text-[15px] font-medium text-[#64748b]">
            Specifications
          </label>
          {specs.map((spec, idx) => (
            <div
              key={idx}
              className="flex flex-col md:flex-row gap-4 items-end"
            >
              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={spec.name}
                  onChange={(e) =>
                    handleSpecChange(idx, "name", e.target.value)
                  }
                  placeholder="Spec Name (e.g. Color)"
                  className="custom-input"
                />
              </div>
              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) =>
                    handleSpecChange(idx, "value", e.target.value)
                  }
                  placeholder="Value (e.g. Red)"
                  className="custom-input"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => removeSpec(idx)}
                  className="h-13 w-13 flex items-center justify-center bg-[#ff0000] text-white rounded-lg"
                >
                  <X size={20} />
                </button>
                {idx === specs.length - 1 && (
                  <button
                    type="button"
                    onClick={addSpec}
                    className="h-13 w-13 flex items-center justify-center bg-[#38bdf8] text-white rounded-lg"
                  >
                    <Plus size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Upload Images Section */}
        <div className="space-y-4 pt-2">
          <label className="text-[15px] font-medium text-[#64748b]">
            Product Images (1st is Main, max 5)
          </label>
          <div className="border-[1.5px] border-[#38bdf8]/30 border-dashed rounded-md p-4 flex items-center gap-3 cursor-pointer hover:bg-sky-50 transition-colors relative">
            <Upload className="text-[#38bdf8]" size={20} />
            <span className="text-[#94a3b8] text-sm">Upload images</span>
            <input
              type="file"
              multiple
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleFile}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((file, i) => (
              <div
                key={i}
                className="relative group border rounded-lg p-2 bg-slate-50"
              >
                <span className="text-[10px] absolute -top-2 left-2 bg-sky-500 text-white px-2 rounded-full">
                  {i === 0 ? "Main" : `Extra ${i}`}
                </span>
                <span className="text-xs truncate block pr-6">{file.name}</span>
                <button
                  type="button"
                  className="absolute right-1 top-1 text-red-500"
                  onClick={() =>
                    setImages(images.filter((_, idx) => idx !== i))
                  }
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-10 py-4 bg-[#38bdf8] text-white rounded-xl font-semibold shadow-lg hover:bg-sky-500 transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Publish Product"}
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

const InputWrapper = ({ label, children }) => (
  <div className="flex flex-col gap-2 w-full">
    {label && (
      <label className="text-[15px] font-medium text-[#64748b]">{label}</label>
    )}
    <div className="relative w-full">{children}</div>
  </div>
);

export default AddProduct;
