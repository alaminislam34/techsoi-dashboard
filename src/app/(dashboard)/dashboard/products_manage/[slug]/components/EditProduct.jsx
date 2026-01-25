"use client";

import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Loader2, Save, X, Plus, Trash } from "lucide-react";
import apiService from "@/api/api";
import { PRODUCT_API, PRODUCT_DETAILS_MANAGE_API } from "@/api/apiEndPoint";
import InputWrapper from "../../add_product/components/InputWrapper";
// import InputWrapper from "../../add_product/components/InputWrapper";
// import { PRODUCT_API, PRODUCT_DETAILS_MANAGE_API } from "@/api/apiEndPoint";
// import InputWrapper from "../add_product/components/InputWrapper";

export default function EditProduct({ product, detailsId, onCancel }) {
  const queryClient = useQueryClient();

  // Initialize form with your specific JSON structure
  const [formData, setFormData] = useState({
    name: product.name || "",
    regular_price: product.regular_price || "",
    discount: product.discount || "",
    sale_price: product.sale_price || "",
    category_id: product.category_id || "",
    sub_category_id: product.sub_category_id || "",
    brand_id: product.brand_id || "",
    short_description: product.short_description || "",
    emi_status: product.emi_status || "0",
    status: product.status || "1",
    full_description: product.details?.full_description || "",
  });

  const [specifications, setSpecifications] = useState([]);
  const [mainImage, setMainImage] = useState(product.main_image || "");
  const [extraImages, setExtraImages] = useState([]);

  // Load initial specifications and images
  useEffect(() => {
    if (product.details?.specifications) {
      try {
        const specs =
          typeof product.details.specifications === "string"
            ? JSON.parse(product.details.specifications)
            : product.details.specifications;
        setSpecifications(Array.isArray(specs) ? specs : []);
      } catch (e) {
        setSpecifications([]);
      }
    }

    if (product.details?.extra_images) {
      try {
        const imgs =
          typeof product.details.extra_images === "string"
            ? JSON.parse(product.details.extra_images)
            : product.details.extra_images;
        setExtraImages(Array.isArray(imgs) ? imgs : []);
      } catch (e) {
        setExtraImages([]);
      }
    }
  }, [product]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-calculate sale price if regular or discount changes
      if (name === "regular_price" || name === "discount") {
        const reg = name === "regular_price" ? value : prev.regular_price;
        const disc = name === "discount" ? value : prev.discount;
        updated.sale_price = reg - (reg * disc) / 100;
      }
      return updated;
    });
  };

  // Specification Logic
  const addSpec = () =>
    setSpecifications([...specifications, { name: "", value: "" }]);
  const removeSpec = (index) =>
    setSpecifications(specifications.filter((_, i) => i !== index));
  const handleSpecChange = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...formData,
        main_image: mainImage,
        specifications: JSON.stringify(specifications),
        extra_images: JSON.stringify(extraImages),
        _method: "PUT", // For Laravel/Rails backends
      };

      // 1. Update Base Product
      await apiService.post(`${PRODUCT_API}/${product.id}`, payload);

      // 2. Update Details if ID exists
      if (detailsId) {
        await apiService.post(PRODUCT_DETAILS_MANAGE_API(detailsId), {
          full_description: formData.full_description,
          specifications: JSON.stringify(specifications),
          extra_images: JSON.stringify(extraImages),
          _method: "PUT",
        });
      }
    },
    onSuccess: () => {
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries(["product", product.slug]);
      onCancel(); // Switch back to view mode
    },
    onError: (err) => toast.error("Update failed"),
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h2 className="text-blue-800 font-semibold">You are in Edit Mode</h2>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex items-center gap-1 px-3 py-1 bg-white border rounded text-gray-600 hover:bg-gray-50"
          >
            <X size={16} /> Cancel
          </button>
          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="flex items-center gap-1 px-3 py-1 bg-[#32afe2] text-white rounded hover:bg-[#288eb8]"
          >
            {updateMutation.isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}{" "}
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <InputWrapper label="Product Name">
          <input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </InputWrapper>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputWrapper label="Regular Price">
            <input
              name="regular_price"
              type="number"
              value={formData.regular_price}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </InputWrapper>
          <InputWrapper label="Discount (%)">
            <input
              name="discount"
              type="number"
              value={formData.discount}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </InputWrapper>
          <InputWrapper label="Sale Price">
            <input
              name="sale_price"
              type="number"
              value={formData.sale_price}
              readOnly
              className="w-full px-4 py-2 border bg-gray-50 rounded-lg"
            />
          </InputWrapper>
        </div>

        <InputWrapper label="Full Description">
          <textarea
            name="full_description"
            rows={4}
            value={formData.full_description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg"
          />
        </InputWrapper>

        {/* Dynamic Specifications */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Specifications</h3>
            <button
              onClick={addSpec}
              className="text-sm text-blue-600 flex items-center gap-1"
            >
              <Plus size={14} /> Add Spec
            </button>
          </div>
          {specifications.map((spec, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                placeholder="Name (e.g. Color)"
                value={spec.name}
                onChange={(e) => handleSpecChange(i, "name", e.target.value)}
                className="flex-1 px-3 py-1 border rounded"
              />
              <input
                placeholder="Value (e.g. Red)"
                value={spec.value}
                onChange={(e) => handleSpecChange(i, "value", e.target.value)}
                className="flex-1 px-3 py-1 border rounded"
              />
              <button onClick={() => removeSpec(i)} className="text-red-500">
                <Trash size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
