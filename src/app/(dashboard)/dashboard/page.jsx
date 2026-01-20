"use client";

import Stats from "../components/BodyContent/Stats";
import Table from "../components/BodyContent/Table";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import apiService from "@/api/api";
import { ORDER_API } from "@/api/apiEndPoint";

const DashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log(orders);
  useEffect(() => {
    const getOrders = async () => {
      try {
        const res = await apiService.get(ORDER_API);
        console.log(res.data);
        if (res.status === 200) {
          setOrders(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    getOrders();
  }, []);

  const getStatusStyles = (status) => {
    switch (status) {
      case 1:
      case "Pending":
        return "text-orange-500 border-orange-500 bg-orange-50";
      case "Delivered":
        return "text-green-600 border-green-600 bg-green-50";
      case "Cancelled":
        return "text-primary_red border-primary_red bg-red-50";
      default:
        return "text-primary border-primary bg-secondary";
    }
  };

  const statusOptions = ["Pending", "Delivered", "Cancelled"];

  const orderColumns = [
    {
      header: "Order Ref",
      render: (item) => (
        <span className="font-medium text-dark">{item?.order_ref ?? "-"}</span>
      ),
    },
    {
      header: "Product",
      render: (item) => (
        <div className="flex items-center gap-3">
          <img
            src={item?.product?.main_image || "/placeholder.png"}
            alt="product"
            className="w-10 h-10 bg-gray-100 rounded-md shrink-0 object-cover"
            onError={(e) => {
              e.target.src = "/placeholder.png";
            }}
          />
          <span className="truncate max-w-45 block text-xs">
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
        <span className="font-semibold">{item?.total_amount} BDT</span>
      ),
    },
    {
      header: "Customer",
      render: (item) => (
        <div className="flex flex-col">
          <span className="text-xs font-medium">{item?.name}</span>
          <span className="text-[10px] text-gray-500">{item?.phone}</span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (item, index, { openDropdownId, setOpenDropdownId }) => {
        const displayStatus = item?.status === 1 ? "Pending" : item?.status;

        return (
          <div className="relative">
            <button
              onClick={() =>
                setOpenDropdownId(openDropdownId === index ? null : index)
              }
              className={`flex items-center justify-between w-28 px-2 py-1.5 border rounded-md text-[11px] font-medium transition-all ${getStatusStyles(
                item?.status,
              )}`}
            >
              {displayStatus}
              <ChevronDown size={12} />
            </button>

            {openDropdownId === index && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpenDropdownId(null)}
                />
                <div className="absolute left-0 mt-1 w-28 bg-white border border-gray-200 rounded-md shadow-xl z-50 py-1">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt}
                      className="w-full text-left px-3 py-2 text-[11px] hover:bg-gray-100"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      },
    },
    {
      header: "Details",
      className: "text-center",
      render: (item) => (
        <Link
          href={`/dashboard/${item.id}`}
          className="text-primary border border-primary/20 bg-secondary px-3 py-1.5 rounded-md text-[11px] hover:bg-primary hover:text-white transition-all inline-block"
        >
          View Details
        </Link>
      ),
    },
  ];

  return (
    <div className="w-full p-4 lg:p-6">
      <div className="flex flex-col gap-6">
        <section>
          <Stats />
        </section>

        <section className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-lg text-dark">Recent Orders</h2>
          </div>
          {loading ? (
            <div className="p-10 text-center">Loading orders...</div>
          ) : (
            <Table data={orders} columns={orderColumns} itemsPerPage={10} />
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
