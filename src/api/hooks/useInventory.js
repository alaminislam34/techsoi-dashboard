import { useQuery, useQueryClient } from "@tanstack/react-query";
import apiService from "@/api/api";
import { CATEGORY_API, SUB_CATEGORY_API, BRAND_API } from "../apiEndPoint";

export const useInventory = () => {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await apiService.get(CATEGORY_API);
      return res.data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const subCategoriesQuery = useQuery({
    queryKey: ["subCategories"],
    queryFn: async () => {
      const res = await apiService.get(SUB_CATEGORY_API);
      return res.data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const brandsQuery = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const res = await apiService.get(BRAND_API);
      return res.data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const refreshInventory = () => {
    queryClient.invalidateQueries(["categories"]);
    queryClient.invalidateQueries(["subCategories"]);
    queryClient.invalidateQueries(["brands"]);
  };

  return {
    categories: categoriesQuery.data || [],
    subCategories: subCategoriesQuery.data || [],
    brands: brandsQuery.data || [],
    isLoading:
      categoriesQuery.isLoading ||
      subCategoriesQuery.isLoading ||
      brandsQuery.isLoading,
    isError:
      categoriesQuery.isError ||
      subCategoriesQuery.isError ||
      brandsQuery.isError,
    refreshInventory,
  };
};
