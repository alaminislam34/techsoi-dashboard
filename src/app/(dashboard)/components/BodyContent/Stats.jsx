"use client";

import { ORDER_API } from "@/api/apiEndPoint";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import StatsSkeleton from "@/app/components/skeletons/StatsSkeleton";
import { useRouter } from "next/navigation";

const Stats = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    canceled: 0,
  });

  const fetchStats = async () => {
    setLoading(true);

    try {
      // ✅ 1. Token check
      const token = Cookies.get("admin_token");

      if (!token) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
        return;
      }

      // ✅ 2. API call
      const res = await axios.get(ORDER_API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000, // 10s timeout safety
      });

      // ✅ 3. Response validation
      if (res.data?.status !== true || !Array.isArray(res.data.data)) {
        throw new Error("Invalid server response");
      }

      const allOrders = res.data.data;

      setStatsData({
        total: allOrders.length,
        pending: allOrders.filter((o) => o.status === "Pending").length,
        delivered: allOrders.filter((o) => o.status === "Delivered").length,
        canceled: allOrders.filter((o) => o.status === "Cancelled").length,
      });
    } catch (error) {
      console.error("Order fetch error:", error);

      // ✅ 4. Axios error handling
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 401) {
          toast.error("Unauthorized. Please login again.");
          Cookies.remove("admin_token");
          router.push("/login");
        } else if (status === 403) {
          toast.error("You do not have permission to view orders.");
        } else if (status >= 500) {
          toast.error("Server error. Please try again later.");
        } else if (error.code === "ECONNABORTED") {
          toast.error("Request timeout. Check your internet.");
        } else {
          toast.error(
            error.response?.data?.message || "Failed to load order data."
          );
        }
      } else {
        toast.error("Something went wrong. Please refresh.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <StatsSkeleton />;

  const statsConfig = [
    { label: "New Order", count: statsData.total, color: "#2CACE2" },
    { label: "Pending Products", count: statsData.pending, color: "#E2872C" },
    {
      label: "Delivered Products",
      count: statsData.delivered,
      color: "#0D9800",
    },
    { label: "Cancel Order", count: statsData.canceled, color: "#E22C2C" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6 mt-6">
      {statsConfig.map((item) => (
        <div
          key={item.label}
          className="flex flex-col gap-2 items-start rounded-2xl p-6 transition-transform hover:scale-[1.02] duration-300"
          style={{ backgroundColor: `${item.color}10` }}
        >
          <p
            style={{ color: item.color }}
            className="text-sm xl:text-lg font-medium"
          >
            {item.label}
          </p>
          <h1 className="text-2xl sm:text-4xl font-semibold text-gray-800">
            {item.count.toLocaleString()}
          </h1>
        </div>
      ))}
    </div>
  );
};

export default Stats;
