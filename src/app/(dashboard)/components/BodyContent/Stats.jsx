"use client";

import { ORDER_API } from "@/api/apiEndPoint";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const Stats = () => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    total: 0,
    pending: 0,
    delivered: 0,
    canceled: 0,
  });

  const fetchStats = async () => {
    try {
      const token = Cookies.get("admin_token");
      const res = await axios.get(ORDER_API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // আপনার API স্ট্রাকচার অনুযায়ী res.data.data হচ্ছে মূল অ্যারে
      if (res.data.status === true) {
        const allOrders = res.data.data;

        setStatsData({
          total: allOrders.length,
          // আপনার API-তে স্ট্যাটাসের নাম যা আছে (যেমন: 'Pending', 'Delivered') সেই অনুযায়ী ফিল্টার করুন
          pending: allOrders.filter((order) => order.status === "Pending")
            .length,
          delivered: allOrders.filter((order) => order.status === "Delivered")
            .length,
          canceled: allOrders.filter((order) => order.status === "Cancelled")
            .length,
        });
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const statsConfig = [
    {
      label: "New Order",
      count: statsData.total,
      color: "#2CACE2",
    },
    {
      label: "Pending Products",
      count: statsData.pending,
      color: "#E2872C",
    },
    {
      label: "Delivered Products",
      count: statsData.delivered,
      color: "#0D9800",
    },
    {
      label: "Cancel Order",
      count: statsData.canceled,
      color: "#E22C2C",
    },
  ];

  if (loading) return <p className="p-5">Loading Dashboard Stats...</p>;

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
