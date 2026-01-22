"use client";

import { ORDER_API } from "@/api/apiEndPoint";
import React from "react";
import StatsSkeleton from "@/app/components/skeletons/StatsSkeleton";
import apiService from "@/api/api";
import { useQuery } from "@tanstack/react-query";

const Stats = () => {
  // TanStack Query Fetcher
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders-stats"],
    queryFn: async () => {
      const res = await apiService.get(ORDER_API);
      return res.data?.data?.data || res.data?.data || [];
    },
    refetchOnWindowFocus: true, // উইন্ডো ফোকাস করলে ডাটা আপডেট হবে
  });

  if (isLoading) return <StatsSkeleton />;

  const statsData = {
    new: orders.filter((o) => Number(o.status) === 1).length,
    pending: orders.filter((o) => Number(o.status) === 2).length,
    processing: orders.filter((o) => Number(o.status) === 3).length,
    inDelivery: orders.filter((o) => Number(o.status) === 4).length,
    complete: orders.filter((o) => Number(o.status) === 5).length,
    cancelled: orders.filter((o) => Number(o.status) === 0).length,
  };

  const statsConfig = [
    { label: "New Order", count: statsData.new, color: "#2CACE2" },
    { label: "Pending", count: statsData.pending, color: "#E2872C" },
    { label: "Processing", count: statsData.processing, color: "#9333EA" },
    { label: "In Delivery", count: statsData.inDelivery, color: "#4F46E5" },
    { label: "Complete", count: statsData.complete, color: "#0D9800" },
    { label: "Cancelled", count: statsData.cancelled, color: "#E22C2C" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statsConfig.map((item) => (
        <div
          key={item.label}
          className="flex flex-col gap-1 items-start rounded-xl shadow-md hover:shadow-lg min-h-28 p-4 transition-all hover:scale-105 border border-transparent hover:border-gray-100 duration-300"
          style={{ backgroundColor: `${item.color}08` }}
        >
          <p
            style={{ color: item.color }}
            className="text-sm md:text-base font-semibold"
          >
            {item.label}
          </p>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {item.count.toLocaleString()}
          </h1>
        </div>
      ))}
    </div>
  );
};

export default Stats;
