import { useQuery, useMutation } from "@tanstack/react-query"; // Import both from here
import apiService from "../api";
import { FAQ_CREATE_API, FAQ_GET_API } from "../apiEndPoint";

type FAQ = {
  id: number;
  question: string;
  answer: string;
};

export function useFAQ() {
  // 1. Fetching logic
  const {
    data: getFAQs,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const res = await apiService.get(FAQ_GET_API);
      return res.data.data as FAQ[];
    },
  });

  // 2. Creation logic
  const createFAQMutation = useMutation({
    mutationFn: async (payload: { question: string; answer: string }) => {
      const res = await apiService.post(FAQ_CREATE_API, payload);
      return res.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  // 3. Update logic
  const updateFAQMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: number;
      payload: { question: string; answer: string };
    }) => {
      const res = await apiService.put(`/faq/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  // 4. Delete logic
  const deleteFAQMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiService.delete(`/faq/${id}`);
      return res.data;
    },
    onSuccess: () => {
      refetch();
    },
  });

  return {
    getFAQs,
    isLoading,
    isError,
    createFAQ: createFAQMutation.mutateAsync, // Use mutateAsync for better error handling in UI
    updateFAQ: updateFAQMutation.mutateAsync,
    deleteFAQ: deleteFAQMutation.mutateAsync,
  };
}
