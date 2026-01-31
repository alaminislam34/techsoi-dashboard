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
  category_id: string | number;
  sub_category_id: string | number;
  brand_id: string | number;
  short_description?: string;
  emi_status?: string | number;
  full_description?: string;
};

export type UpdatePayload = {
  productId: string | number;
  fields: ProductFields;
  specs: Spec[];
  images: Array<File | string | { url?: string; name?: string } | any>;
  existingMainImage?: string;
};

export default function useUpdateProduct() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);

  const attemptUpdateWithRetries = async (
    p: UpdatePayload,
    retries = 6,
    delayMs = 1500,
  ) => {
    let lastErr: any = null;
    for (let i = 0; i < retries; i++) {
      try {
        const attemptNumber = i + 1;
        const form = new FormData();

        form.append("_method", "PUT");
        form.append("name", String(p.fields.name));
        form.append("regular_price", String(Number(p.fields.regular_price)));
        form.append("discount", String(Number(p.fields.discount || 0)));
        form.append("sale_price", String(Number(p.fields.sale_price)));
        form.append("stock", String(Number(p.fields.stock ?? 1)));
        form.append("category_id", String(p.fields.category_id));
        form.append("sub_category_id", String(p.fields.sub_category_id));
        form.append("brand_id", String(p.fields.brand_id));
        form.append("short_description", p.fields.short_description || "");
        form.append("full_description", p.fields.full_description || "");
        form.append("emi_status", p.fields.emi_status === "1" ? "1" : "0");
        form.append("specifications", JSON.stringify(p.specs || []));

        if (p.images && p.images.length) {
          const firstImage = p.images[0];
          if (firstImage instanceof File) {
            form.append("main_image", firstImage);
          }

          if (p.images.length > 1) {
            const extraFiles = p.images.slice(1);
            extraFiles.forEach((file) => {
              if (file instanceof File) {
                form.append("extra_images[]", file);
              }
            });
          }
        }

        console.log(`UpdateProduct attempt ${attemptNumber}:`, {
          productId: p.productId,
          name: p.fields.name,
          imagesCount: p.images?.length || 0,
          specsCount: (p.specs || []).length,
        });

        const res = await apiService.post(
          `${PRODUCT_API}/${p.productId}`,
          form,
        );
        return res;
      } catch (e: any) {
        const status = e?.status || e?.response?.status || null;
        console.error(`Attempt ${i + 1} failed:`, e);
        if (e?.data) console.error("Server response data:", e.data);
        else if (e?.response?.data)
          console.error("Server response (axios):", e.response.data);

        lastErr = e;

        if (status && status >= 400 && status < 500) {
          throw e;
        }

        await new Promise((r) => setTimeout(r, delayMs));
      }
    }

    const normalized = {
      message: lastErr?.message || "Unknown error",
      status: lastErr?.status || lastErr?.response?.status || null,
      data: lastErr?.data || lastErr?.response?.data || null,
      original: lastErr,
    };

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
      const firstKey = Object.keys(serverErrors)[0];
      const firstMsg =
        serverErrors[firstKey] && serverErrors[firstKey][0]
          ? serverErrors[firstKey][0]
          : null;
      if (firstMsg) toast.error(firstMsg);
      else toast.error("Failed to update product. See console for details.");
    } else {
      toast.error(
        "Failed to update product after retries. See console for details.",
      );
    }

    console.error("Final update product error (normalized):", normalized);
    if (serverErrors) console.error("Server validation errors:", serverErrors);

    throw normalized;
  };

  const submitUpdate = async (payload: UpdatePayload) => {
    if (isPending) {
      toast.error("Update in progress, please wait");
      return;
    }

    setIsPending(true);
    try {
      const res = await attemptUpdateWithRetries(payload);

      if (res?.data) {
        toast.success("Product updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["product"] });
        queryClient.invalidateQueries({ queryKey: ["products"] });
        return res.data;
      }
    } catch (err: any) {
      console.error("submitUpdate failed:", err);
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  return { submitUpdate, isPending };
}
