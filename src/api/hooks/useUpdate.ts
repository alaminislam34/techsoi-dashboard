import apiService from "../api";
import {
  BRAND_SINGLE_API,
  CATEGORY_SINGLE_API,
  SUB_CATEGORY_SINGLE_API,
} from "../apiEndPoint";

// Updated to allow File objects for uploads
export interface UpdatePayload {
  name?: string;
  image?: File | string | null;
  banner?: File | string | null;
}

export function useUpdate() {
  const updateCategory = async (id: string, data: UpdatePayload | FormData) => {
    const res = await apiService.put(CATEGORY_SINGLE_API(id), data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res;
  };

  const updateSubCategory = async (id: string, data: { name: string }) => {
    const res = await apiService.put(SUB_CATEGORY_SINGLE_API(id), data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res;
  };

  const updateBrand = async (id: string, data: UpdatePayload | FormData) => {
    const res = await apiService.put(BRAND_SINGLE_API(id), data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res;
  };

  return { updateCategory, updateSubCategory, updateBrand };
}
