"use client";

import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Upload, ChevronDown, X, Loader2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import {
  CATEGORY_API,
  SUB_CATEGORY_API,
  BRAND_API,
  PRODUCT_API,
  PRODUCT_DETAILS_MANAGE_API,
} from "@/api/apiEndPoint";
import apiService from "@/api/api";

const AddProduct = () => {
  const queryClient = useQueryClient();

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

  const [specs, setSpecs] = useState([{ name: "", value: "" }]);
  const [images, setImages] = useState([]);
  const lastPayloadRef = useRef(null);

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

  const mutation = useMutation({
    mutationFn: async (payload) => {
      return apiService.post(PRODUCT_API, payload);
    },
    onSuccess: () => {
      toast.success("Product Created Successfully!");
      queryClient.invalidateQueries(["products"]);
      resetForm();
    },
    onError: async (err) => {
      try {
        console.error("Product create error (full):", {
          err,
          message: err?.message,
          isAxiosError: err?.isAxiosError,
          responseData: err?.response?.data,
          responseStatus: err?.response?.status,
          config: err?.config,
          stack: err?.stack,
          toJSON: typeof err?.toJSON === "function" ? err.toJSON() : undefined,
        });
      } catch (dumpErr) {
        console.error("Product create error (dump failed)", dumpErr, err);
      }

      const serverData = err?.response?.data || err?.data || null;

      if (serverData && serverData.errors) {
        const first = Object.values(serverData.errors)[0];
        const msg = Array.isArray(first) ? first[0] : first;
        toast.error(msg || "Validation failed");
        return;
      }

      const msg =
        (serverData && serverData.message) ||
        err?.message ||
        "Failed to publish product";

      const shouldFallback =
        lastPayloadRef.current &&
        ((typeof msg === "string" && msg.includes("product_id")) ||
          !serverData ||
          (err?.response?.status && err.response.status >= 500));

      if (shouldFallback) {
        console.log(
          "Triggering fallback due to missing server response or product_id error",
        );
        doFallback(lastPayloadRef.current, err);
        return;
      }

      toast.error(msg);
    },
  });

  const extractCreatedIdFromError = (err) => {
    try {
      const data = err?.response?.data || err?.data || null;
      if (!data) return null;
      return (
        data?.data?.id ||
        data?.data?.product_id ||
        data?.id ||
        data?.product_id ||
        null
      );
    } catch (e) {
      return null;
    }
  };

  const pushDetails = async (productId, payload) => {
    const detailsForm = new FormData();
    detailsForm.append(
      "full_description",
      payload.fields.full_description || "",
    );
    detailsForm.append("specifications", JSON.stringify(payload.specs || []));
    if (payload.images && payload.images.length > 1) {
      payload.images.slice(1).forEach((file, idx) => {
        detailsForm.append("extra_images[]", JSON.stringify({ id: idx }));
        detailsForm.append("extra_images_files[]", file);
      });
    }

    await apiService.put(PRODUCT_DETAILS_MANAGE_API(productId), detailsForm, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const attemptPrimaryWithRetries = async (p, retries = 3, delayMs = 1200) => {
    let lastErr = null;
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`primary retry attempt ${i + 1}`);
        const form = new FormData();
        form.append("name", p.fields.name);
        form.append("regular_price", Number(p.fields.regular_price));
        form.append("discount", Number(p.fields.discount || 0));
        form.append("sale_price", Number(p.fields.sale_price));
        form.append("category_id", Number(p.fields.category_id));
        form.append("sub_category_id", Number(p.fields.sub_category_id));
        form.append("brand_id", Number(p.fields.brand_id));
        form.append("short_description", p.fields.short_description || "");
        form.append("full_description", p.fields.full_description || "");
        form.append("emi_status", p.fields.emi_status === "1" ? 1 : 0);
        form.append("specifications", JSON.stringify(p.specs || []));
        if (p.images && p.images.length) {
          form.append("main_image", p.images[0]);
          if (p.images.length > 1) {
            p.images.slice(1).forEach((file, idx) => {
              form.append("extra_images[]", JSON.stringify({ id: idx }));
              form.append("extra_images_files[]", file);
            });
          }
        }

        const res = await apiService.post(PRODUCT_API, form);

        const newId =
          res?.data?.data?.id ||
          res?.data?.data?.product_id ||
          res?.data?.id ||
          res?.data?.product_id ||
          null;
        if (newId) return res;

        return res;
      } catch (e) {
        console.warn(`primary attempt ${i + 1} failed`, e);
        lastErr = e;
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    throw lastErr;
  };

  const attemptTwoStepWithRetries = async (p, retries = 4, delayMs = 1500) => {
    let lastErr = null;
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`twoStep retry attempt ${i + 1}`);
        await twoStepCreate(p);
        return;
      } catch (e) {
        const maybeId = extractCreatedIdFromError(e);
        if (maybeId) {
          console.log(
            `Detected created id ${maybeId} in error; pushing details`,
          );
          await pushDetails(maybeId, p);
          return;
        }

        console.warn(`twoStep attempt ${i + 1} failed`, e);
        lastErr = e;
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
    throw lastErr;
  };

  const [fallbackPending, setFallbackPending] = useState(false);
  const fallbackRunningRef = useRef(false);

  const doFallback = async (payload, maybeErr) => {
    if (fallbackRunningRef.current) {
      console.log("doFallback already running — skipping duplicate call");
      return;
    }
    fallbackRunningRef.current = true;
    setFallbackPending(true);

    try {
      const errProvidedId = extractCreatedIdFromError(maybeErr);
      if (errProvidedId) {
        try {
          console.log(
            "doFallback: found id in error, finishing details",
            errProvidedId,
          );
          toast.loading(
            "Primary upload partially succeeded — finishing details...",
          );
          await pushDetails(errProvidedId, payload);
          toast.dismiss();
          toast.success("Product created (completed)");
          queryClient.invalidateQueries(["products"]);
          resetForm();
          return;
        } catch (e) {
          console.warn(
            "pushDetails failed for provided id, falling back to retries",
            e,
          );
        }
      }

      toast.loading("Primary upload failed, retrying fallback...");
      try {
        try {
          const primaryRes = await attemptPrimaryWithRetries(payload, 3, 1200);
          console.log("Primary retry succeeded", primaryRes);
          toast.dismiss();
          toast.success("Product Created Successfully (primary retry)");
          queryClient.invalidateQueries(["products"]);
          resetForm();
          return;
        } catch (primErr) {
          console.warn(
            "Primary retries failed, falling back to two-step",
            primErr,
          );
        }

        await attemptTwoStepWithRetries(payload, 4, 1500);
        toast.dismiss();
        toast.success("Product created (fallback)");
        queryClient.invalidateQueries(["products"]);
        resetForm();
        return;
      } catch (e) {
        toast.dismiss();
        console.error("Fallback failed after retries", e);

        const bgToastId = toast.loading(
          "Upload issue — retrying in background...",
        );

        (async () => {
          try {
            await attemptTwoStepWithRetries(payload, 6, 3000);
            console.log("Background fallback succeeded");
            // toast.dismiss(bgToastId);
            // toast.success("Product created (background retry)");
            queryClient.invalidateQueries(["products"]);
            resetForm();
          } catch (be) {
            console.error("Background retry also failed", be);
            // toast.dismiss(bgToastId);
          }
        })();
      }
    } finally {
      fallbackRunningRef.current = false;
      setFallbackPending(false);
    }
  };

  const resetForm = () => {
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
  };

  const twoStepCreate = async ({
    fields,
    specs: specsPayload,
    images: imgs,
  }) => {
    const productForm = new FormData();
    productForm.append("name", fields.name);
    productForm.append("regular_price", Number(fields.regular_price));
    productForm.append("discount", Number(fields.discount || 0));
    productForm.append("sale_price", Number(fields.sale_price));
    productForm.append("category_id", Number(fields.category_id));
    productForm.append("sub_category_id", Number(fields.sub_category_id));
    productForm.append("brand_id", Number(fields.brand_id));
    productForm.append("short_description", fields.short_description || "");
    productForm.append("emi_status", fields.emi_status === "1" ? 1 : 0);
    if (imgs && imgs.length) productForm.append("main_image", imgs[0]);

    const res = await apiService.post(PRODUCT_API, productForm);
    const newId = res?.data?.data?.id || res?.data?.data?.product_id || null;
    if (!newId) throw new Error("Product creation did not return id");

    const detailsForm = new FormData();
    detailsForm.append("full_description", fields.full_description || "");
    detailsForm.append("specifications", JSON.stringify(specsPayload || []));
    if (imgs && imgs.length > 1) {
      imgs.slice(1).forEach((file, idx) => {
        detailsForm.append("extra_images[]", JSON.stringify({ id: idx }));
        detailsForm.append("extra_images_files[]", file);
      });
    }

    await apiService.put(PRODUCT_DETAILS_MANAGE_API(newId), detailsForm, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

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

    const data = new FormData();

    data.append("name", formData.name);
    data.append("regular_price", Number(formData.regular_price));
    data.append("discount", Number(formData.discount || 0));
    data.append("sale_price", Number(formData.sale_price));
    data.append("category_id", Number(formData.category_id));
    data.append("sub_category_id", Number(formData.sub_category_id));
    data.append("brand_id", Number(formData.brand_id));
    data.append("short_description", formData.short_description || "");
    data.append("full_description", formData.full_description || "");
    data.append("emi_status", formData.emi_status === "1" ? 1 : 0);

    data.append("specifications", JSON.stringify(validSpecs));

    data.append("main_image", images[0]);
    if (images.length > 1) {
      images.slice(1).forEach((file, idx) => {
        data.append("extra_images[]", JSON.stringify({ id: idx }));
        data.append("extra_images_files[]", file);
      });
    }

    lastPayloadRef.current = {
      fields: { ...formData },
      specs: JSON.parse(JSON.stringify(validSpecs)),
      images: [...images],
    };

    try {
      const entries = [];
      for (const pair of data.entries()) {
        if (pair[1] instanceof File) entries.push([pair[0], pair[1].name]);
        else entries.push(pair);
      }
      console.log("FormData entries:", entries);
    } catch (e) {
      console.warn("Could not enumerate FormData entries", e);
    }

    try {
      await mutation.mutateAsync(data);
    } catch (err) {
      try {
        const serverData = err?.response?.data || err?.data || null;
        const msg = (serverData && serverData.message) || err?.message || null;

        const shouldFallback =
          lastPayloadRef.current &&
          (!serverData ||
            (typeof msg === "string" && msg.includes("product_id")) ||
            (err?.response?.status && err.response.status >= 500));
        if (shouldFallback) {
          console.log("handleSubmit: immediate fallback trigger");
          doFallback(lastPayloadRef.current, err);
          return;
        }

        console.error("mutation.mutateAsync error (non-fallback):", {
          message: err?.message,
          responseStatus: err?.response?.status,
          responseData: serverData,
        });
        toast.error(msg || "Failed to publish product");
      } catch (dumpErr) {
        console.error("mutation.mutateAsync error (dump failed)", dumpErr, err);
      }
    }
  };
  return (
    <div className="w-full text-[#475569]">
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
                  placeholder="Spec Name"
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
                  placeholder="Value"
                  className="custom-input"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSpecs(specs.filter((_, i) => i !== idx))}
                  className="h-13 w-13 flex items-center justify-center bg-[#ff0000] text-white rounded-lg"
                >
                  <X size={20} />
                </button>
                {idx === specs.length - 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setSpecs([...specs, { name: "", value: "" }])
                    }
                    className="h-13 w-13 flex items-center justify-center bg-[#38bdf8] text-white rounded-lg"
                  >
                    <Plus size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

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
          <div className="flex flex-wrap items-center gap-4">
            {images.map((file, i) => (
              <div
                key={i}
                className="relative group border rounded-xl p-2 bg-slate-50 shadow-sm max-w-30"
              >
                <span className="text-[10px] absolute -top-2 left-2 bg-sky-500 text-white px-2 py-0.5 rounded-full z-10 font-medium">
                  {i === 0 ? "Main Image" : `Extra ${i}`}
                </span>

                <div className="relative max-w-30 aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`preview-${i}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() =>
                        setImages(images.filter((_, idx) => idx !== i))
                      }
                      className="bg-white/90 p-1.5 rounded-full text-red-600 hover:bg-red-500 hover:text-white transition-colors shadow-lg"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={mutation.isPending || fallbackPending}
            className="w-full md:w-auto px-10 py-4 bg-[#38bdf8] text-white rounded-xl font-semibold shadow-lg hover:bg-sky-500 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {mutation.isPending ? (
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

const InputWrapper = ({ label, children }) => (
  <div className="flex flex-col gap-2 w-full">
    {label && (
      <label className="text-[15px] font-medium text-[#64748b]">{label}</label>
    )}
    <div className="relative w-full">{children}</div>
  </div>
);

export default AddProduct;
