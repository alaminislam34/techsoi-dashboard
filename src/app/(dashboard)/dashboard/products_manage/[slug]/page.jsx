"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, X } from "lucide-react";
import useProductDetails from "../hooks/useProductDetails";
import ReadOnlyField from "../components/ReadOnlyField";
import EditFieldModal from "../components/EditFieldModal"; 

export default function ManageProduct() {
  const params = useParams();
  const router = useRouter();

  const productSlug = params?.slug;

  const [existingImages, setExistingImages] = useState([]);
  // Read-only / editable model handled by hook
  const { original, edited, loading, saving, setEdited, updateField, saveAll } = useProductDetails(productSlug);

  // Modal state
  const [activeField, setActiveField] = useState(null); // e.g. 'name' or 'full_description' etc
  const [modalOpen, setModalOpen] = useState(false);

  // Maps to simplify rendering
  const fieldKeys = [
    "name",
    "regular_price",
    "discount",
    "sale_price",
    "main_image",
    "category_id",
    "sub_category_id",
    "brand_id",
    "short_description",
    "emi_status",
    "status",
    "full_description",
    "specifications",
    "extra_images",
  ];









  const removeExistingImage = (index) => {
    setExistingImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // Sync edited model: first item is main, rest are extras
      const main = next[0] || null;
      const extras = next.slice(1);
      try {
        updateField({ main_image: main, extra_images: extras });
      } catch (e) {
        console.warn("Failed to update edited model when removing existing image", e);
      }
      return next;
    });
  }; 



  // When `original` loads from useProductDetails, populate images and specs for UI
  useEffect(() => {
    if (!original) return;
    const initialExisting = original.main_image
      ? [original.main_image, ...(original.extra_images || [])]
      : (original.extra_images || []);
    setExistingImages(initialExisting);
  }, [original]);

  // Loading / error handling uses hook's state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#32afe2] mb-2" size={40} />
        <p className="text-gray-500">Loading product...</p>
      </div>
    );
  }

  if (!loading && !original) {
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





  const handleSaveAll = async () => {
    try {
      await saveAll();
      toast.success("Changes saved.");
    } catch (e) {
      console.error("Save all failed", e);
      toast.error(e?.message || "Failed to save changes");
    }
  }; 



  return (
    <div className="w-full">
      <div className="flex items-center justify-between flex-row-reverse mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Edit Product</h1>
        <button
          onClick={() => router.push("/dashboard/products_manage")}
          className="text-gray-600 hover:text-gray-800"
        >
          ← Back to Products
        </button>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        {/* Read-only first: render fields from original + edited */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Basic Information
          </h2>

          {(!original && loading) ? (
            <div className="text-gray-500">Loading product...</div>
          ) : (
            <div className="space-y-2">
              {[
                "name",
                "regular_price",
                "discount",
                "sale_price",
                "category_id",
                "stock",
                "short_description",
                "full_description",
              ].map((key) => (
                <ReadOnlyField
                  key={key}
                  label={key.replace(/_/g, " ")}
                  value={
                    edited?.[key] !== undefined && edited?.[key] !== null
                      ? (Array.isArray(edited[key]) ? JSON.stringify(edited[key]) : String(edited[key]))
                      : original?.[key] ?? "-"
                  }
                  changed={JSON.stringify(edited?.[key]) !== JSON.stringify(original?.[key])}
                  onEditClick={() => {
                    setActiveField(key);
                    setModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Specifications (read-only) */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Specifications</h2>
          <div className="bg-white border rounded p-4">
            {(edited?.specifications || original?.specifications || []).length === 0 ? (
              <div className="text-gray-500">No specifications</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(edited?.specifications || original?.specifications || []).map((s, i) => (
                  <div key={i} className="p-2 border rounded">
                    <div className="text-sm text-gray-500">{s.name}</div>
                    <div className="text-gray-800">{s.value}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => { setActiveField("specifications"); setModalOpen(true); }}
                className="px-4 py-2 bg-[#32afe2] text-white rounded"
              >
                Edit Specifications
              </button>
            </div>
          </div>
        </div>

        {/* Images */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Images</h2>

          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Current Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(existingImages || []).map((img, index) => (
                <div key={index} className="relative group">
                  <img src={img} alt={`Existing ${index}`} className="w-full h-32 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 bg-[#32afe2] text-white text-xs px-2 py-1 rounded">Main</span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => { setActiveField("main_image"); setModalOpen(true); }}
                className="px-4 py-2 bg-[#32afe2] text-white rounded"
              >
                Edit Images
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.push("/dashboard/products_manage")}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="px-6 py-3 bg-[#32afe2] text-white rounded-lg hover:bg-[#2a9ac9] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? <Loader2 className="animate-spin" size={18} /> : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Per-field edit modal */}
      <EditFieldModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fieldKey={activeField}
        originalValue={activeField ? (edited?.[activeField] ?? original?.[activeField]) : null}
        onSave={async (local) => {
          // Special-case image handling
          if (activeField === "main_image") {
            // local is an array of Files provided by ImageUploader
            const files = Array.isArray(local) ? local : [];
            if (files.length > 0) {
              // set main image file and extra images files
              const main = files[0];
              const extras = files.slice(1);
              updateField({ main_image_file: main, extra_images_files: extras });
            }
          } else {
            updateField({ [activeField]: local });
          }
          setModalOpen(false);
        }}
      />
    </div>
  );
}
