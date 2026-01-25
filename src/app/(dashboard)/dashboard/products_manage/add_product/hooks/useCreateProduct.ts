import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import apiService from "@/api/api";
import { PRODUCT_API } from "@/api/apiEndPoint";

type Spec = { name: string; value: string };

type ProductFields = {
  name: string;
  regular_price: string | number;
  discount?: string | number;
  sale_price: string | number;
  stock?: string | number;
  quantity?: string | number;
  category_id: string | number | string;
  sub_category_id: string | number | string;
  brand_id: string | number | string;
  short_description?: string;
  emi_status?: string | number;
  full_description?: string;
};

export type CreatePayload = {
  fields: ProductFields;
  specs: Spec[];
  images: Array<File | string | { url?: string; name?: string } | any>;
};

export default function useCreateProduct() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const fallbackRunningRef = useRef(false);

  const attemptPrimaryWithRetries = async (
    p: CreatePayload,
    retries = 6,
    delayMs = 1500,
  ) => {
    let lastErr: any = null;
    for (let i = 0; i < retries; i++) {
      try {
        const attemptNumber = i + 1;
        const form = new FormData();
        form.append("name", String(p.fields.name));
        form.append("regular_price", String(Number(p.fields.regular_price)));
        form.append("discount", String(Number(p.fields.discount || 0)));
        form.append("sale_price", String(Number(p.fields.sale_price)));
        form.append("quantity", String(Number(p.fields.quantity ?? 1)));
        form.append("category_id", String(p.fields.category_id));
        form.append("sub_category_id", String(p.fields.sub_category_id));
        form.append("brand_id", String(p.fields.brand_id));
        form.append("short_description", p.fields.short_description || "");
        form.append("full_description", p.fields.full_description || "");
        form.append("emi_status", p.fields.emi_status === "1" ? "1" : "0");
        form.append("specifications", JSON.stringify(p.specs || []));

        if (p.images && p.images.length) {
          form.append("main_image", p.images[0] as any);
          if (p.images.length > 1) {
            const extraFiles = p.images.slice(1);
            extraFiles.forEach((file) => {
              form.append("extra_images[]", file as any);
            });
          }
        }

        // Log attempt + main image summary for debugging intermittent failures
        try {
          console.log(`CreateProduct attempt ${attemptNumber}:`, {
            name: p.fields.name,
            main_image:
              p.images && p.images[0]
                ? {
                    name: (p.images[0] as any).name,
                    type: (p.images[0] as any).type,
                    size: (p.images[0] as any).size,
                  }
                : null,
            specsCount: (p.specs || []).length,
          });
        } catch (logErr) {
          console.warn("Failed to log create product attempt info", logErr);
        }

        const res = await apiService.post(PRODUCT_API, form);
        return res;
      } catch (e: any) {
        // If it's a 4xx validation error, don't retry - return immediately with the server error
        const status = e?.status || e?.response?.status || null;
        try {
          console.error(`Attempt ${i + 1} failed:`, e);
          if (e?.data) console.error("Server response data:", e.data);
          else if (e?.response?.data)
            console.error("Server response (axios):", e.response.data);
        } catch (logErr) {
          console.warn("Failed to print error details", logErr);
        }

        lastErr = e;

        if (status && status >= 400 && status < 500) {
          // don't retry for client errors (validation, auth, etc.) - return immediately
          throw e;
        }

        // otherwise wait and retry
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }

    const normalized = {
      message: lastErr?.message || "Unknown error",
      status: lastErr?.status || lastErr?.response?.status || null,
      data: lastErr?.data || lastErr?.response?.data || null,
      original: lastErr,
    };

    // Surface helpful toast messages for final failure and log details for debugging
    try {
      const serverMessage =
        lastErr?.data?.message ||
        lastErr?.message ||
        lastErr?.response?.data?.message ||
        null;
      const serverErrors =
        lastErr?.data?.errors || lastErr?.response?.data?.errors || null;

      if (serverMessage) {
        toast.error(serverMessage);
      } else if (serverErrors) {
        // show first error message
        const firstKey = Object.keys(serverErrors)[0];
        const firstMsg =
          serverErrors[firstKey] && serverErrors[firstKey][0]
            ? serverErrors[firstKey][0]
            : null;
        if (firstMsg) toast.error(firstMsg);
        else toast.error("Failed to publish product. See console for details.");
      } else {
        toast.error(
          "Failed to publish product after retries. See console for details.",
        );
      }

      console.error("Final create product error (normalized):", normalized);
      if (serverErrors)
        console.error("Server validation errors:", serverErrors);
    } catch (toastErr) {
      console.warn("Failed to show final error toast", toastErr);
    }

    throw normalized;
  };

  const doFallback = async (payload: CreatePayload) => {
    if (fallbackRunningRef.current) return;
    fallbackRunningRef.current = true;
    try {
      toast.loading("Retrying upload (multiple attempts)...");
      try {
        const primaryRes = await attemptPrimaryWithRetries(payload, 6, 1500);
        toast.dismiss();
        toast.success("Product Created Successfully (retry)");
        queryClient.invalidateQueries({ queryKey: ["products"] });
        return primaryRes;
      } catch (primErr) {
        console.warn("Primary retries failed", primErr);
      }

      const bgToastId = toast.loading(
        "Upload issue — retrying in background...",
      );
      (async () => {
        try {
          await attemptPrimaryWithRetries(payload, 8, 3000);
          toast.dismiss();
          toast.success("Product created (background retry)");
          queryClient.invalidateQueries({ queryKey: ["products"] });
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

  const submitProduct = async (payload: CreatePayload) => {
    setIsPending(true);
    try {
      const res = await attemptPrimaryWithRetries(payload, 3, 1200);
      toast.success("Product Created Successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      return res;
    } catch (err) {
      await doFallback(payload);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { submitProduct, isPending } as const;
}
