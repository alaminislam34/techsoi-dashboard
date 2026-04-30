import apiService from "../api";
import {
  BRAND_SINGLE_API,
  CATEGORY_SINGLE_API,
  SUB_CATEGORY_SINGLE_API,
} from "../apiEndPoint";

type FileOrUrl = File | string;

export interface UpdatePayload {
  name: string;
  image?: FileOrUrl;
  banner?: FileOrUrl;
}

export function useUpdate() {
  // 🔥 CATEGORY UPDATE (FormData + Laravel fix)
  const updateCategory = async (id: string, data: FormData) => {
    // Laravel PUT issue fix
    data.append("_method", "PUT");

    const res = await apiService.post(CATEGORY_SINGLE_API(id), data);

    return res?.data;
  };

  const updateSubCategory = async (
    id: string,
    data: { name: string; category_id: number; image?: string },
  ) => {
    const res = await apiService.put(SUB_CATEGORY_SINGLE_API(id), data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res?.data;
  };

  const updateBrand = async (
    id: string,
    data: { name: string; image?: string; special?: number },
  ) => {
    const res = await apiService.put(BRAND_SINGLE_API(id), data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res?.data;
  };
  return { updateCategory, updateSubCategory, updateBrand };
}
