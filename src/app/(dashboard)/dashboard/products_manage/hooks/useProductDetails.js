import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import apiService from "@/api/api";
import {
  PRODUCT_SLUG_API,
  PRODUCT_API,
  PRODUCT_DETAILS_API,
  PRODUCT_DETAILS_MANAGE_API,
} from "@/api/apiEndPoint";

// Helper to Convert URL -> File (used when backend expects a file)
async function urlToFile(url, defaultFilename = "image.jpg") {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn("urlToFile: non-ok response", res.status);
      return null;
    }
    const blob = await res.blob();
    const ext = blob.type ? blob.type.split("/")[1] : "jpg";
    const name = defaultFilename.includes(".") ? defaultFilename : `${defaultFilename}.${ext}`;
    return new File([blob], name, { type: blob.type || "image/jpeg" });
  } catch (e) {
    console.warn("urlToFile: could not fetch", e);
    return null;
  }
}

export default function useProductDetails(slug) {
  const [original, setOriginal] = useState(null);
  const [edited, setEdited] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProduct = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await apiService.get(PRODUCT_SLUG_API(slug));
      const p = res.data?.data || null;
      // Normalize specs and images
      const specs = (p?.details?.specifications && typeof p.details.specifications === "string")
        ? JSON.parse(p.details.specifications)
        : (p?.details?.specifications || []);

      const images = [];
      if (p?.main_image) images.push(p.main_image);
      const extra = p?.details?.extra_images
        ? (typeof p.details.extra_images === "string" ? JSON.parse(p.details.extra_images) : p.details.extra_images)
        : [];
      images.push(...(extra || []));

      const normalized = {
        id: p.id,
        name: p.name || "",
        regular_price: p.regular_price || "",
        discount: p.discount || "",
        sale_price: p.sale_price || "",
        main_image: p.main_image || null,
        category_id: p.category_id || "",
        sub_category_id: p.sub_category_id || "",
        brand_id: p.brand_id || "",
        short_description: p.short_description || "",
        emi_status: p.emi_status ?? "0",
        status: p.status ?? 0,
        full_description: p?.details?.full_description || "",
        specifications: specs.map((s) => ({ name: s.name ?? s.key ?? "", value: s.value ?? "" })),
        extra_images: extra || [],
        raw: p,
      };

      setOriginal(normalized);
      setEdited(JSON.parse(JSON.stringify(normalized)));
    } catch (e) {
      console.error("fetchProduct error", e);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const updateField = (patch) => {
    setEdited((prev) => ({ ...prev, ...patch }));
  };

  const buildFormDataForUpdate = async (merged) => {
    const fd = new FormData();
    fd.append("name", merged.name || "");
    fd.append("regular_price", merged.regular_price || "");
    fd.append("discount", merged.discount || "");
    fd.append("sale_price", merged.sale_price || "");
    fd.append("category_id", merged.category_id || "");
    fd.append("sub_category_id", merged.sub_category_id || "");
    fd.append("brand_id", merged.brand_id || "");
    fd.append("short_description", merged.short_description || "");
    fd.append("emi_status", merged.emi_status ?? "0");
    fd.append("status", merged.status ?? 0);

    fd.append("full_description", merged.full_description || "");

    const formattedSpecs = (merged.specifications || []).map((s) => ({ name: s.name || "", value: s.value || "" }));
    fd.append("specifications", JSON.stringify(formattedSpecs));

    // main_image handling: if File provided in merged.main_image_file use it; if URL exists attach URL->File
    if (merged.main_image_file instanceof File) {
      fd.append("main_image", merged.main_image_file);
    } else if (merged.main_image && typeof merged.main_image === "string") {
      // try to fetch it and append as File so backend image validation passes
      const file = await urlToFile(merged.main_image, "main_image");
      if (file) {
        fd.append("main_image", file);
      } else {
        // Could not fetch existing main image (often due to CORS or inaccessible URL).
        // Fail early with a helpful message instructing the user to re-upload the main image.
        throw new Error(
          "Could not fetch existing main image from its URL (likely CORS). Please re-upload the main image and try again.",
        );
      }
    }

    // extra images: send existing URLs as JSON and send new files as extra_images_files[]
    const existingExtras = merged.extra_images?.filter((x) => typeof x === "string") || [];
    if (existingExtras.length) fd.append("extra_images", JSON.stringify(existingExtras));

    if (merged.extra_images_files?.length) {
      merged.extra_images_files.forEach((file, idx) => {
        fd.append("extra_images[]", JSON.stringify({ id: existingExtras.length + idx }));
        fd.append("extra_images_files[]", file);
      });
    }

    return fd;
  };

  const saveAll = async () => {
    if (!original || !edited) throw new Error("Nothing to save");
    setSaving(true);
    try {
      const merged = { ...original, ...edited };
      // ensure specs and extra images arrays exist
      merged.specifications = merged.specifications || [];
      merged.extra_images = merged.extra_images || [];

      const fd = await buildFormDataForUpdate(merged);
      const res = await apiService.put(`${PRODUCT_API}/${merged.id}`, fd);
      if (!res?.data?.status) throw new Error(res?.data?.message || "Update failed");
      // Refresh
      await fetchProduct();
      return res.data;
    } catch (e) {
      console.error("saveAll error", e);
      const msg = e?.message || "Failed to save changes";
      // Show a user-friendly toast
      try {
        toast.error(msg);
      } catch (t) {
        // no-op
      }
      throw e;
    } finally {
      setSaving(false);
    }
  };

  return {
    original,
    edited,
    loading,
    saving,
    setEdited,
    updateField,
    saveAll,
    fetchProduct,
  };
}
