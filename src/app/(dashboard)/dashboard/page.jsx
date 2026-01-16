"use client";

import axios from "axios";
import Stats from "../components/BodyContent/Stats";
import Table from "../components/BodyContent/Table";
import productsData from "@/app/FakeData/products.json";
import Cookies from "js-cookie";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GET_ORDERS_API } from "@/api/apiEndPoint";

const DashboardPage = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const token = Cookies.get("admin_token");
    const getOrders = async () => {
      try {
        const res = await axios.get(GET_ORDERS_API, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.status === 200) {
          setOrders(res.data.data);
        } else {
          console.log("No orders data available");
        }
      } catch (error) {
        console.log(error.message || "Something went wrong");
      }
    };
    getOrders();
  }, []);

  const getStatusStyles = (status) => {
    switch (status) {
      case "Cancelled":
        return "text-primary_red border-primary_red bg-red-50";
      case "Pending":
        return "text-orange-500 border-orange-500 bg-orange-50";
      case "Delivered":
        return "text-green-600 border-green-600 bg-green-50";
      default:
        return "text-primary border-primary bg-secondary";
    }
  };

  const statusOptions = ["New Order", "Pending", "Delivered", "Cancelled"];

  const orderColumns = [
    {
      header: "Order ID",
      render: (item = {}) => (
        <span className="font-medium">#{item?.id ?? "-"}</span>
      ),
    },
    {
      header: "Product",
      render: (item = {}) => (
        <div className="flex items-center gap-3">
          <img
            src={item?.image_url || "/placeholder.png"}
            alt=""
            className="w-12 h-8 bg-gray-100 rounded-md shrink-0 object-cover"
          />
          <span className="truncate max-w-37.5 lg:max-w-62.5 block">
            {item?.name ?? "-"}
          </span>
        </div>
      ),
    },
    {
      header: "Category",
      render: (item = {}) => item?.product?.category ?? "-",
    },
    {
      header: "Qty",
      render: (item = {}) => item?.product?.quantity ?? "-",
    },
    {
      header: "Discount",
      render: (item = {}) => item?.order_info?.discount ?? "0%",
    },
    {
      header: "Price",
      render: (item = {}) =>
        item?.product?.net_price
          ? `${item.product.net_price} ${item.product.currency ?? ""}`
          : "-",
    },
    {
      header: "Customer",
      render: (item = {}) => item?.customer?.name ?? "-",
    },
    {
      header: "Action",
      render: (item = {}, index, { openDropdownId, setOpenDropdownId }) => {
        const status = item?.order_info?.status;

        if (!status) return "-";

        return (
          <div className="relative">
            <button
              onClick={() =>
                setOpenDropdownId(openDropdownId === index ? null : index)
              }
              className={`flex items-center justify-between w-32 px-3 py-2 border rounded-md text-xs font-medium transition-all ${getStatusStyles(
                status
              )}`}
            >
              {status}
              <ChevronDown
                size={14}
                className={`transition-transform ${
                  openDropdownId === index ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDropdownId === index && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setOpenDropdownId(null)}
                />
                <div
                  className={`absolute left-0 w-32 bg-white border border-gray-200 rounded-md shadow-xl z-50 py-1 ${
                    index < 4 ? "top-full mt-1" : "bottom-full mb-1"
                  }`}
                >
                  {statusOptions.map((opt) => (
                    <button
                      key={opt}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-secondary hover:text-primary transition-colors text-dark"
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
      render: (item = {}) =>
        item?.order_info?.id ? (
          <Link
            href={`/dashboard/${item.order_info.id}`}
            className="text-primary w-full flex items-center justify-center border border-primary/20 bg-secondary px-4 py-2 rounded-md text-xs font-medium hover:bg-primary hover:text-white transition-all whitespace-nowrap"
          >
            View Details
          </Link>
        ) : (
          "-"
        ),
    },
  ];

  return (
    <div className="w-full max-w-full">
      <div className="flex flex-col gap-4">
        <section className="w-full">
          <Stats />
        </section>

        <section className="w-full">
          <Table data={orders} columns={orderColumns} itemsPerPage={7} />
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;
