"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "@/api/api";
import { REVIEW_API, REVIEW_SINGLE_API } from "@/api/apiEndPoint";
import toast from "react-hot-toast";

export const useReviews = () => {
  const queryClient = useQueryClient();

  // 1. Get All Reviews (Admin/Request List)
  const useGetAllReviews = () => {
    return useQuery({
      queryKey: ["reviews"],
      queryFn: async () => {
        const response = await apiService.get(REVIEW_API);
        console.log(response);
        return response.data?.data || [];
      },
    });
  };

  // 2. Get Single Review
  const useGetSingleReview = (id) => {
    return useQuery({
      queryKey: ["review", id],
      queryFn: async () => {
        const response = await apiService.get(REVIEW_SINGLE_API(id));
        return response.data?.data;
      },
      enabled: !!id,
    });
  };

  const useCreateReview = () => {
    return useMutation({
      mutationFn: async (payload) => {
        return apiService.post(REVIEW_API, payload);
      },
      onSuccess: () => {
        toast.success("Review submitted successfully!");
        queryClient.invalidateQueries(["reviews"]);
      },
      onError: (err) => {
        const msg = err.response?.data?.message || "Failed to submit review";
        toast.error(msg);
      },
    });
  };

  const useDeleteReview = () => {
    return useMutation({
      mutationFn: async (id) => {
        return apiService.delete(REVIEW_SINGLE_API(id));
      },
      onSuccess: () => {
        toast.success("Review deleted successfully!");
        queryClient.invalidateQueries(["reviews"]);
      },
      onError: (err) => {
        toast.error("Failed to delete review");
      },
    });
  };

  return {
    useGetAllReviews,
    useGetSingleReview,
    useCreateReview,
    useDeleteReview,
  };
};
