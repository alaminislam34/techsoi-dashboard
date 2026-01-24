"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Loader2, Upload, X } from "lucide-react";
import apiService from "@/api/api";
import {
  PRODUCT_API,
  CATEGORY_API,
  PRODUCT_SLUG_API,
  PRODUCT_DETAILS_MANAGE_API,
} from "@/api/apiEndPoint";
import InputWrapper from "../add_product/components/InputWrapper";
import SpecsEditor from "../add_product/components/SpecsEditor";

export default function ManageProduct() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const productSlug = params?.slug;

  const [productId, setProductId] = useState(null);
  const [detailsId, setDetailsId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    regular_price: "",
    discount: "",
    sale_price: "",
    category_id: "",
    sub_category_id: "",
    brand_id: "",
    short_description: "",
    full_description: "",
    stock: "",
    emi_status: "0",
  });

  const [specifications, setSpecifications] = useState([]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  // Fetch product data by slug
  const {
    data: product,
    isLoading: isProductLoading,
    isError: isProductError,
  } = useQuery({
    queryKey: ["product", productSlug],
    queryFn: async () => {
      console.log("=== FETCHING PRODUCT BY SLUG ===");
      console.log("Slug:", productSlug);
      console.log("Endpoint:", PRODUCT_SLUG_API(productSlug));
      
      const productRes = await apiService.get(PRODUCT_SLUG_API(productSlug));
      console.log("Raw product response:", productRes.data);
      
      const p = productRes.data.data;
      const d = p.details || {};
      
      console.log("Product ID:", p.id);
      console.log("Product Details:", d);
      console.log("Details ID:", d.id);
      
      // Store IDs separately
      setProductId(p.id);
      setDetailsId(d.id || null);
      
      // Parse specifications
      let parsedSpecs = [];
      if (d.specifications) {
        try {
          const specs = typeof d.specifications === 'string' 
            ? JSON.parse(d.specifications) 
            : d.specifications;
          
          if (Array.isArray(specs)) {
            parsedSpecs = specs;
          } else if (typeof specs === 'object') {
            parsedSpecs = Object.entries(specs).map(([key, value]) => ({
              key,
              value: typeof value === 'object' ? JSON.stringify(value) : String(value)
            }));
          }
        } catch (err) {
          console.error("Failed to parse specifications:", err);
        }
      }
      
      setSpecifications(parsedSpecs);
      
      // Parse extra images
      let parsedImages = [];
      if (d.extra_images) {
        try {
          const imgs = typeof d.extra_images === 'string' 
            ? JSON.parse(d.extra_images) 
            : d.extra_images;
          
          if (Array.isArray(imgs)) {
            parsedImages = imgs.map(img => 
              typeof img === 'string' ? img : img.url || img.image_url || ''
            ).filter(Boolean);
          }
        } catch (err) {
          console.error("Failed to parse extra images:", err);
        }
      }
      
      setExistingImages(parsedImages);
      
      // Set form data
      setFormData({
        name: p.name || "",
        regular_price: p.regular_price || "",
        discount: p.discount || "",
        sale_price: p.sale_price || "",
        category_id: p.category_id || "",
        sub_category_id: p.sub_category_id || "",
        brand_id: p.brand_id || "",
        short_description: p.short_description || "",
        full_description: d.full_description || "",
        stock: p.stock || "",
        emi_status: p.emi_status || "0",
      });
      
      // Set main image
      if (p.main_image) {
        setImages([p.main_image]);
      }
      
      console.log("=== PRODUCT DATA LOADED ===");
      console.log("Form data populated");
      console.log("Specifications count:", parsedSpecs.length);
      console.log("Extra images count:", parsedImages.length);
      
      return p;
    },
    enabled: !!productSlug,
  });

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiService.get(CATEGORY_API);
      return res.data?.data || [];
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-calculate sale price
    if (name === "regular_price" || name === "discount") {
      const regular = name === "regular_price" ? value : formData.regular_price;
      const discount = name === "discount" ? value : formData.discount;
      if (regular && discount) {
        const sale = regular - (regular * discount) / 100;
        setFormData((prev) => ({ ...prev, sale_price: sale.toFixed(2) }));
      }
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      console.log("=== STARTING UPDATE PROCESS ===");
      console.log("Product ID:", productId);
      console.log("Details ID:", detailsId);
      console.log("Form data:", data);
      
      // Prepare product data (base fields)
      const dataProduct = new FormData();
      dataProduct.append("_method", "PUT");
      dataProduct.append("name", data.name);
      dataProduct.append("regular_price", data.regular_price);
      dataProduct.append("discount", data.discount);
      dataProduct.append("sale_price", data.sale_price);
      dataProduct.append("category_id", data.category_id);
      dataProduct.append("sub_category_id", data.sub_category_id || "");
      dataProduct.append("brand_id", data.brand_id || "");
      dataProduct.append("short_description", data.short_description);
      dataProduct.append("stock", data.stock);
      dataProduct.append("emi_status", data.emi_status);

      // Add main image if new
      if (images.length > 0 && images[0] instanceof File) {
        console.log("Adding new main image");
        dataProduct.append("main_image", images[0]);
      }

      console.log("=== UPDATING PRODUCT BASE FIELDS ===");
      console.log("Endpoint:", `${PRODUCT_API}/${productId}`);
      const productUpdateRes = await apiService.post(`${PRODUCT_API}/${productId}`, dataProduct);
      console.log("Product update response:", productUpdateRes.data);

      // Prepare product details data
      const dataDetails = new FormData();
      dataDetails.append("full_description", data.full_description);
      
      const formattedSpecs = specifications.map((spec) => ({
        key: spec.key,
        value: spec.value,
      }));
      dataDetails.append("specifications", JSON.stringify(formattedSpecs));
      if (images.length > 1) {
        images.slice(1).forEach((img) => {
          dataDetails.append("extra_images[]", img);
        });
      }
      
      console.log("Formatted specs:", formattedSpecs);
      console.log("Extra images count:", images.length > 1 ? images.length - 1 : 0);
      
      if (detailsId) {
        // Update existing details using detailsId
        console.log("=== UPDATING PRODUCT DETAILS ===");
        console.log("Details ID:", detailsId);
        console.log("Endpoint:", PRODUCT_DETAILS_MANAGE_API(detailsId));
        dataDetails.append("_method", "PUT");
        const detailsUpdateRes = await apiService.post(PRODUCT_DETAILS_MANAGE_API(detailsId), dataDetails);
        console.log("Details update response:", detailsUpdateRes.data);
      } else {
        console.log("No detailsId found - skipping details update");
        console.log("Details will need to be added through product creation or backend");
      }

      console.log("=== UPDATE COMPLETED SUCCESSFULLY ===");
      toast.success("Product Updated Successfully!");
      setImages([]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["product", productSlug]);
      queryClient.invalidateQueries(["products"]);
    },
    onError: (error) => {
      console.error("=== UPDATE FAILED ===");
      console.error("Error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to update product");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!productId) {
      toast.error("Product ID not found");
      return;
    }
    
    updateMutation.mutate(formData);
  };

  if (isProductLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#32afe2] mb-2" size={40} />
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (isProductError) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 font-medium mb-4">Failed to load product</p>
        <button
          onClick={() => router.push("/dashboard/products_manage")}
          className="bg-[#32afe2] text-white px-6 py-2 rounded-lg"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
        <button
          onClick={() => router.push("/dashboard/products_manage")}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to Products
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Basic Information
          </h2>

          <InputWrapper label="Product Name" required>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#32afe2]"
            />
          </InputWrapper>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputWrapper label="Regular Price" required>
              <input
                type="number"
                name="regular_price"
                value={formData.regular_price}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#32afe2]"
              />
            </InputWrapper>

            <InputWrapper label="Discount (%)" required>
              <input
                type="number"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#32afe2]"
              />
            </InputWrapper>

            <InputWrapper label="Sale Price" required>
              <input
                type="number"
                name="sale_price"
                value={formData.sale_price}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#32afe2]"
              />
            </InputWrapper>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputWrapper label="Category" required>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#32afe2]"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </InputWrapper>

            <InputWrapper label="Stock" required>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#32afe2]"
              />
            </InputWrapper>
          </div>

          <InputWrapper label="Short Description" required>
            <textarea
              name="short_description"
              value={formData.short_description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#32afe2]"
            />
          </InputWrapper>

          <InputWrapper label="Full Description">
            <textarea
              name="full_description"
              value={formData.full_description}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#32afe2]"
            />
          </InputWrapper>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Specifications
          </h2>
          <SpecsEditor
            specifications={specifications}
            setSpecifications={setSpecifications}
          />
        </div>

        {/* Images */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Images</h2>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Current Images
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img}
                      alt={`Existing ${index}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#32afe2] transition-colors"
            >
              <Upload className="mx-auto mb-2 text-gray-400" size={32} />
              <p className="text-gray-600">Click to upload new images</p>
              <p className="text-sm text-gray-400 mt-1">
                First image will be main image
              </p>
            </button>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={
                        img instanceof File ? URL.createObjectURL(img) : img
                      }
                      alt={`New ${index}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 bg-[#32afe2] text-white text-xs px-2 py-1 rounded">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/products_manage")}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-6 py-3 bg-[#32afe2] text-white rounded-lg hover:bg-[#2a9ac9] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {updateMutation.isPending && (
              <Loader2 className="animate-spin" size={18} />
            )}
            {updateMutation.isPending ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
