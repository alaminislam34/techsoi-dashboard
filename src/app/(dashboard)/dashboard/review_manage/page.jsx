"use client";

import React from "react";
import { Eye, Trash2, Star, Loader2 } from "lucide-react";
import Table from "../../components/BodyContent/Table";
import { useReviews } from "@/api/hooks/useReviews";
// import { useReviews } from "@/hooks/useReviews"; // আপনার হুক পাথ অনুযায়ী ঠিক করে নিন

const ReviewManage = () => {
  // হুক থেকে ফাংশনগুলো কল করা
  const { useGetAllReviews, useDeleteReview } = useReviews();

  // ডাটা ফেচ করা
  const { data: reviews = [], isLoading } = useGetAllReviews();
  console.log(reviews);
  // ডিলিট মিউটেশন
  const deleteMutation = useDeleteReview();

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      deleteMutation.mutate(id);
    }
  };

  const columns = [
    {
      header: "Product",
      key: "product",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded shrink-0 overflow-hidden border border-gray-100">
            <img
              src={item.product?.image_url}
              alt={item.product?.name}
              className="w-full h-full object-contain p-1"
            />
          </div>
          <span className="text-dark text-sm font-normal line-clamp-1 max-w-55">
            {item.product?.name}
          </span>
        </div>
      ),
    },
    {
      header: "Customer",
      key: "customer",
      render: (item) => (
        <span className="text-sm text-dark italic">{item.customer?.name}</span>
      ),
    },
    {
      header: "Rating",
      className: "text-center",
      render: (item) => (
        <div className="flex items-center justify-center gap-1 text-sm font-medium">
          {/* আপনার API কনফিগারেশন অনুযায়ী star ফিল্ড */}
          {Number(item.star || 0).toFixed(1)}
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
        </div>
      ),
    },
    {
      header: "Review",
      render: (item) => (
        <p className="text-sm text-gray-500 line-clamp-1 max-w-75">
          {item.message || item.review?.feedback_bn}
        </p>
      ),
    },
    {
      header: "Action",
      className: "text-center",
      render: (item) => (
        <div className="flex items-center justify-center gap-4">
          <button className="text-primary hover:scale-110 transition-transform">
            <Eye size={18} />
          </button>
          <button
            onClick={() => handleDelete(item.id)} // সরাসরি আইটেম আইডি ব্যবহার করা হয়েছে
            disabled={deleteMutation.isPending}
            className="text-primary_red hover:scale-110 transition-transform disabled:opacity-50"
          >
            {deleteMutation.isPending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Trash2 size={18} />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin text-primary" size={30} />
        </div>
      ) : (
        <Table data={reviews} columns={columns} itemsPerPage={10} />
      )}
    </div>
  );
};

export default ReviewManage;
