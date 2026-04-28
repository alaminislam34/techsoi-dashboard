"use client";

import React from "react";
import Link from "next/link";
import { ChevronDown, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import Stats from "../components/BodyContent/Stats";
import Table from "../components/BodyContent/Table";
import apiService from "@/api/api";
import { ORDER_API } from "@/api/apiEndPoint";
import { useOrderActions } from "@/api/hooks/useOrderActions";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

const statusStyles = {
  1: "bg-blue-50 text-blue-700 hover:bg-blue-100", // New Order
  2: "bg-purple-50 text-purple-700 hover:bg-purple-100", // Accepted
  3: "bg-amber-50 text-amber-700 hover:bg-amber-100", // In Delivery
  4: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100", // Completed
  0: "bg-rose-50 text-rose-700 hover:bg-rose-100", // Cancelled
};
const DashboardPage = () => {
  const router = useRouter();

  const {
    data: orders = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders-list"],
    queryFn: async () => {
      const res = await apiService.get(ORDER_API);
      return res.data?.data?.data || res.data?.data || [];
    },
    refetchOnWindowFocus: true,
  });

  const { updateStatus, deleteOrder, isUpdating } = useOrderActions();

  const statusConfig = {
    1: { label: "New Order", style: "text-primary border-primary bg-blue-50" },
    2: {
      label: "Accepted",
      style: "text-orange-500 border-orange-500/40 bg-orange-50",
    },

    3: {
      label: "In Delivery",
      style: "text-green-600 border-green-600 bg-green-50",
    },
    4: {
      label: "Completed",
      style: "text-white border-green-700 bg-green-600",
    },
    0: { label: "Cancelled", style: "text-red-600 border-red-600 bg-red-50" },
  };

  const statusOptions = [
    { label: "New Order", value: 1 },
    { label: "Accepted", value: 2 },
    { label: "In Delivery", value: 3 },
    { label: "Completed", value: 4 },
    { label: "Cancelled", value: 0 },
  ];

  const orderColumns = [
    {
      header: "Order Ref",
      render: (item) => (
        <span className="text-dark font-medium">{item?.order_ref ?? "-"}</span>
      ),
    },
    {
      header: "Product",
      render: (item) => (
        <div
          onClick={() => router.push(`/dashboard/${item.id}`)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img
            src={item?.product?.main_image || "/placeholder.png"}
            alt="product"
            className="w-10 h-10 bg-gray-100 rounded-md shrink-0 object-cover"
            onError={(e) => {
              e.target.src = "/placeholder.png";
            }}
          />
          <span className="truncate max-w-45 block text-sm">
            {item?.product?.name ?? "-"}
          </span>
        </div>
      ),
    },
    {
      header: "Category",
      render: (item) => item?.product?.category?.name ?? "-",
    },
    {
      header: "Total Amount",
      render: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">
            {item?.total_amount} BDT
          </span>
        </div>
      ),
    },
    {
      header: "Customer",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{item?.name}</span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (item, index, { openDropdownId, setOpenDropdownId }) => {
        const config = statusConfig[item?.status] || statusConfig[1];
        const isLastItems = index > 5;

        return (
          <div className="relative">
            <button
              disabled={isUpdating}
              onClick={() =>
                setOpenDropdownId(openDropdownId === index ? null : index)
              }
              className={`flex items-center justify-between w-32 px-3 py-2 border rounded-lg text-xs font-semibold tracking-wide uppercase transition-all duration-200 
          ${config.style} 
          ${isUpdating ? "opacity-50 cursor-not-allowed" : "hover:shadow-md active:scale-95"}`}
            >
              {config.label}
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${openDropdownId === index ? "rotate-180" : ""}`}
              />
            </button>

            {openDropdownId === index && (
              <>
                <div
                  className={`absolute left-0 w-40 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 p-1.5
              animate-in fade-in zoom-in duration-200
              ${isLastItems ? "bottom-full mb-2 origin-bottom" : "top-full mt-2 origin-top"}
            `}
                  style={{ pointerEvents: "auto" }} // নিশ্চিত করা যে ড্রপডাউনে ক্লিক কাজ করবে
                >
                  {statusOptions.map((opt) => {
                    const isActive = opt.value === item.status;
                    return (
                      <button
                        key={opt.value}
                        disabled={isUpdating || isActive}
                        onClick={(e) => {
                          e.stopPropagation(); // টেবিলের ক্লিক ইভেন্ট আটকাবে
                          updateStatus(item.id, item.pay_status, opt.value);
                          setOpenDropdownId(null);
                        }}
                        className={`group w-full flex items-center justify-between px-3 py-2 text-sm font-medium mb-1 rounded-lg transition-all duration-150
                    ${
                      isActive
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : `${statusStyles[opt.value]} hover:brightness-95 hover:pl-4 cursor-pointer`
                    }`}
                      >
                        <span>{opt.label}</span>
                        {isActive && (
                          <Check size={14} className="text-gray-400" />
                        )}
                        {!isActive && !isUpdating && (
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                            →
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        );
      },
    },
    {
      header: "Details",
      className: "text-left",
      render: (item) => (
        <Link
          href={`/dashboard/${item.id}`}
          className="text-primary truncate border border-primary/60 bg-primary/1 px-3 py-1.5 rounded-md text-sm hover:bg-primary hover:text-white transition-all inline-block"
        >
          View Details
        </Link>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6">
        <section>
          <Stats />
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-lg text-dark">Recent Orders</h2>
          </div>

          {isLoading ? (
            <div className="p-10 text-center animate-pulse text-gray-400 font-medium">
              Loading orders...
            </div>
          ) : isError ? (
            <div className="p-10 text-center text-red-500">
              Error loading orders. Please refresh.
            </div>
          ) : (
            <Table
              data={orders}
              columns={orderColumns}
              itemsPerPage={10}
              redirectPath={`/dashboard`}
            />
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
