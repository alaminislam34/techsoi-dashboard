"use client";

import apiService from "@/api/api";
import { PRODUCT_SINGLE_API } from "@/api/apiEndPoint";
import { useReviews } from "@/api/hooks/useReviews";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import Swal from "sweetalert2";

const ReviewDetails = () => {
  const params = useParams();
  const router = useRouter();
  const reviewId = params.id;

  const { useGetSingleReview, useDeleteReview } = useReviews();

  const { data: review, isLoading, error } = useGetSingleReview(reviewId);

  const productId = review?.product_id || 0;

  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const res = await apiService.get(PRODUCT_SINGLE_API(productId));
      return res.data?.data;
    },
    enabled: !!productId && !!review,
  });

  const deleteMutation = useDeleteReview();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This review will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33", // red for delete action
      cancelButtonColor: "#6c757d", // gray for cancel
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      reverseButtons: true, // puts Delete on the right
    });

    if (!result.isConfirmed) return;

    setIsDeleting(true);

    try {
      await deleteMutation.mutateAsync(reviewId);

      await Swal.fire({
        title: "Deleted!",
        text: "The review has been successfully deleted.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });

      router.push("/dashboard/review_manage");
    } catch (err) {
      console.error("Delete failed:", err);

      // Failure feedback
      await Swal.fire({
        title: "Failed",
        text: "Could not delete the review. Please try again.",
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setIsDeleting(false);
    }
  };
  if (isLoading || isProductLoading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-gray-400"></div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="border border-red-300 bg-red-50 p-6 rounded text-center">
          <h2 className="text-lg font-medium text-red-800">Review not found</h2>
          <p className="mt-2 text-red-700">
            The requested review does not exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              Review Details
            </h1>
            <div className="text-sm text-gray-500">Review #{review.id}</div>
          </div>
        </div>

        <div className="p-6 space-y-10">
          {/* Product Section */}
          {product && (
            <div className="pb-8 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Reviewed Product
              </h2>

              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-40 sm:w-48 shrink-0">
                  {product.main_image ? (
                    <div className="border border-gray-200 rounded overflow-hidden bg-white">
                      <Image
                        src={product.main_image}
                        alt={product.name}
                        width={192}
                        height={192}
                        className="object-contain w-full h-auto aspect-square p-2"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-500 text-sm border border-gray-200 rounded">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <h3 className="text-base font-medium text-gray-900">
                    {product.name}
                  </h3>

                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-xl font-semibold text-gray-900">
                      ৳{product.sale_price.toLocaleString()}
                    </span>
                    {product.discount > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 line-through">
                          ৳{product.regular_price.toLocaleString()}
                        </span>
                        <span className="text-sm text-green-600 font-medium">
                          {product.discount}% off
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600">
                    {product.short_description || "—"}
                  </p>

                  <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                    <div>
                      Stock:{" "}
                      <span
                        className={
                          product.stock > 0 ? "text-green-700" : "text-red-600"
                        }
                      >
                        {product.stock > 0 ? product.stock : "Out of stock"}
                      </span>
                    </div>
                    <div>
                      Status:{" "}
                      <span
                        className={
                          product.status === 1
                            ? "text-green-700"
                            : "text-gray-500"
                        }
                      >
                        {product.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Review Details - Single Column */}
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-medium text-gray-800 mb-4">
                Review Information
              </h2>

              <div className="space-y-6 bg-gray-50 border border-gray-200 rounded p-5">
                {/* Rating + Status in one line-ish */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-medium text-gray-700 min-w-17.5">
                      Rating:
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-gray-800">
                        {review.star}
                      </span>
                      <span className="text-2xl text-yellow-500">★</span>
                      <span className="text-gray-500">/ 5</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-medium text-gray-700 min-w-17.5">
                      Status:
                    </h3>
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                        review.status === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {review.status === 1 ? "Published" : "Hidden"}
                    </span>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex flex-col sm:flex-row gap-6 text-sm text-gray-600">
                  <div>
                    <span className="font-medium text-gray-700">Created:</span>{" "}
                    {new Date(review.created_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Updated:</span>{" "}
                    {new Date(review.updated_at).toLocaleString()}
                  </div>
                </div>

                {/* IDs */}
                <div className="grid grid-cols-2 gap-6 text-sm border-t border-gray-200 pt-4">
                  <div>
                    <div className="text-gray-600">User ID</div>
                    <div className="font-medium text-gray-800">
                      {review.user_id}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Product ID</div>
                    <div className="font-medium text-gray-800">
                      {review.product_id}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Message - Full width */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Review Message
              </h3>
              <div className="border border-gray-200 rounded p-5 bg-white min-h-40 whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">
                {review.message || (
                  <span className="text-gray-400 italic">
                    No message provided
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={() => router.push(`/reviews/${review.id}/edit`)}
            className="px-5 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition"
          >
            Edit
          </button>

          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`px-5 py-2 rounded font-medium min-w-27.5 flex items-center justify-center gap-2 ${
              isDeleting
                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            {isDeleting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetails;
