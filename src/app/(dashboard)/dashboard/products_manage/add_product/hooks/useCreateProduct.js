import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import apiService from "@/api/api";
import { PRODUCT_API } from "@/api/apiEndPoint";

export default function useCreateProduct() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const fallbackRunningRef = useRef(false);

  const attemptPrimaryWithRetries = async (p, retries = 6, delayMs = 1500) => {
    let lastErr = null;
    for (let i = 0; i < retries; i++) {
      try {
        const form = new FormData();
        form.append("name", p.fields.name);
        form.append("regular_price", Number(p.fields.regular_price));
        form.append("discount", Number(p.fields.discount || 0));
        form.append("sale_price", Number(p.fields.sale_price));
        form.append("stock", Number(p.fields.stock || 0));
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
            const extraFiles = p.images.slice(1);
            const dummyExtraJson = extraFiles.map((_, idx) => ({ id: idx }));
            form.append("extra_images", JSON.stringify(dummyExtraJson));
            extraFiles.forEach((file) => {
              form.append("extra_images_files[]", file);
            });
          }
        }

        const res = await apiService.post(PRODUCT_API, form);
        return res;
      } catch (e) {
        // Detailed logging for debugging failures (includes non-enumerable props)
        try {
          console.error("attemptPrimaryWithRetries error:", e);
          console.error("attemptPrimaryWithRetries error (serialized):", JSON.stringify(e, Object.getOwnPropertyNames(e)));
        } catch (logErr) {
          console.error("Failed to serialize error", logErr);
        }

        lastErr = e;
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }

    // Normalize thrown error so callers can inspect message/status/data easily
    const normalized = {
      message: lastErr?.message || "Unknown error",
      status: lastErr?.status || lastErr?.response?.status || null,
      data: lastErr?.data || lastErr?.response?.data || null,
      original: lastErr,
    };

    throw normalized;
  };

  const doFallback = async (payload) => {
    if (fallbackRunningRef.current) return;
    fallbackRunningRef.current = true;
    try {
      toast.loading("Retrying upload (multiple attempts)...");
      try {
        const primaryRes = await attemptPrimaryWithRetries(payload, 6, 1500);
        toast.dismiss();
        toast.success("Product Created Successfully (retry)");
        queryClient.invalidateQueries(["products"]);
        return primaryRes;
      } catch (primErr) {
        console.warn("Primary retries failed", primErr);
      }

      const bgToastId = toast.loading("Upload issue — retrying in background...");
      (async () => {
        try {
          await attemptPrimaryWithRetries(payload, 8, 3000);
          toast.dismiss();
          toast.success("Product created (background retry)");
          queryClient.invalidateQueries(["products"]);
        } catch (be) {
          console.error("Background retry also failed", be);
          toast.dismiss(bgToastId);
          toast.error("Failed to publish product after retries");
        }
      })();
    } finally {
      fallbackRunningRef.current = false;
    }
  };

  const submitProduct = async (payload) => {
    setIsPending(true);
    try {
      const res = await attemptPrimaryWithRetries(payload, 3, 1200);
      toast.success("Product Created Successfully!");
      queryClient.invalidateQueries(["products"]);
      return res;
    } catch (err) {
      // fallback flow: try more retries and background retry
      await doFallback(payload);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { submitProduct, isPending };
}
