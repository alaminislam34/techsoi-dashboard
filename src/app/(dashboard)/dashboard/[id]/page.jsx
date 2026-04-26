"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronDown, ArrowLeft, Package } from "lucide-react";
import {
  SINGLE_ORDER_API,
  CATEGORY_API,
  SUB_CATEGORY_API,
  BRAND_API,
  PAYMENT_STATUS_UPDATE_API,
} from "@/api/apiEndPoint";
import apiService from "@/api/api";
import { useOrderActions } from "@/api/hooks/useOrderActions";

const ProductsDetails = () => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const params = useParams();
  const router = useRouter();
  const orderId = params.id;

  const [isOpen, setIsOpen] = useState(false);
  const [isPayOpen, setIsPayOpen] = useState(false); // 🔥 NEW

  const fetchAllData = async () => {
    try {
      const [orderRes, catRes, subRes, brandRes] = await Promise.all([
        apiService.get(`${SINGLE_ORDER_API(orderId)}`),
        apiService.get(CATEGORY_API),
        apiService.get(SUB_CATEGORY_API),
        apiService.get(BRAND_API),
      ]);

      if (orderRes.status === 200) {
        setOrder(orderRes.data.data);
      }

      setCategories(catRes.data.data || []);
      setSubCategories(subRes.data.data || []);
      setBrands(brandRes.data.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [orderId]);

  const { updateStatus, isUpdating } = useOrderActions(fetchAllData);

  const updatePaymentStatus = async (status) => {
    try {
      await apiService.put(PAYMENT_STATUS_UPDATE_API(orderId), {
        pay_status: status,
        status: order.status,
      });
      fetchAllData();
    } catch (err) {
      console.error("Payment status update failed:", err);
    }
  };

  const getCategoryName = (id) =>
    categories.find((c) => c.id === id)?.name || "N/A";
  const getSubCategoryName = (id) =>
    subCategories.find((s) => s.id === id)?.name || "N/A";
  const getBrandName = (id) => brands.find((b) => b.id === id)?.name || "N/A";

  const statusOptions = [
    { label: "New Order", value: 1 },
    { label: "Pending", value: 2 },
    { label: "Processing", value: 3 },
    { label: "In Delivery", value: 4 },
    { label: "Complete", value: 5 },
    { label: "Cancelled", value: 0 },
  ];

  const getStatusStyles = (id) => {
    switch (Number(id)) {
      case 0:
        return "text-red-600 border-red-500 bg-red-50";
      case 1:
        return "text-blue-600 border-blue-500 bg-blue-50";
      case 2:
        return "text-orange-500 border-orange-500 bg-orange-50";
      case 3:
        return "text-purple-600 border-purple-500 bg-purple-50";
      case 5:
        return "text-green-600 border-green-600 bg-green-50";
      default:
        return "text-primary border-primary bg-secondary/50";
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!order) return <div className="p-10 text-center">Order not found</div>;

  return (
    <div className="pb-10 px-4 md:px-0">
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="space-y-6">
        {/* ORDER SUMMARY */}
        <section>
          <div className="bg-secondary text-primary font-semibold py-3 px-6 rounded-t-xl border-b border-white">
            Order Summary
          </div>

          <div className="bg-white p-6 md:p-8 rounded-b-xl flex flex-col md:flex-row gap-6 md:gap-8 relative shadow-sm border border-gray-100">
            <div className="w-full md:w-48 h-32 md:h-48 bg-gray-100 rounded-2xl shrink-0 flex flex-col items-center justify-center border border-dashed border-gray-300">
              <Package size={32} className="text-gray-300 mb-1" />
              <span className="text-gray-400 text-xs italic">
                {order.product_count} Items
              </span>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className="text-gray-500 font-medium w-24">
                  Order Ref:
                </span>
                <span className="font-bold text-lg text-primary">
                  #{order.order_ref}
                </span>
              </div>

              {/* PAYMENT STATUS BUTTON ADDED */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-gray-500 w-24">Payment:</span>

                <div className="relative">
                  <button
                    onClick={() => setIsPayOpen(!isPayOpen)}
                    className={`px-4 py-2 rounded-lg text-sm border font-medium ${
                      order.pay_status === 1
                        ? "text-green-600 border-green-500 bg-green-50"
                        : "text-red-500 border-red-500 bg-red-50"
                    }`}
                  >
                    {order.pay_status === 1 ? "Paid" : "Unpaid"} ▾
                  </button>

                  {isPayOpen && (
                    <>
                      <div
                        className="fixed inset-0"
                        onClick={() => setIsPayOpen(false)}
                      />

                      <div className="absolute mt-2 bg-white border rounded-lg shadow-md w-32 z-20">
                        <button
                          onClick={() => {
                            updatePaymentStatus(1);
                            setIsPayOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-green-50"
                        >
                          Paid
                        </button>
                        <button
                          onClick={() => {
                            updatePaymentStatus(0);
                            setIsPayOpen(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-red-50"
                        >
                          Unpaid
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 pt-2 border-t border-gray-50 sm:border-none">
                <span className="text-gray-500 w-24 text-lg">Total:</span>
                <span className="font-bold text-xl text-primary">
                  ৳ {Number(order.total_amount).toLocaleString()}
                </span>
              </div>
            </div>

            {/* STATUS CHANGE (UNCHANGED) */}
            <div className="md:absolute top-4 right-4 md:top-8 md:right-8">
              <div className="relative">
                <button
                  disabled={isUpdating}
                  onClick={() => setIsOpen(!isOpen)}
                  className={`flex items-center justify-between w-full md:w-44 gap-2 border px-4 py-2 rounded-lg text-sm font-medium transition-all ${getStatusStyles(order.status)} ${isUpdating ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {statusOptions.find(
                    (opt) => opt.value === Number(order.status),
                  )?.label || "Select Status"}
                  <ChevronDown size={16} />
                </button>

                {isOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-full md:w-44 bg-white border rounded-lg shadow-xl z-20 py-1">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            updateStatus(order.id, order.pay_status, opt.value);
                            setIsOpen(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary hover:text-primary"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-secondary text-primary font-semibold py-3 px-6 rounded-t-xl border-b border-white">
            Items in this Order
          </div>
          <div className="bg-white rounded-b-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase whitespace-nowrap">
                  <tr>
                    <th className="px-6 py-4 min-w-38">Product Info</th>
                    <th className="px-6 py-4 min-w-30">Category</th>
                    <th className="px-6 py-4 min-w-30">Sub Category</th>
                    <th className="px-6 py-4 min-w-30">Brand</th>
                    <th className="px-6 py-4 text-center">Qty</th>
                    <th className="px-6 py-4 text-right min-w-25">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.details?.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-800">
                          Product #{item.product_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getCategoryName(item.category_id)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getSubCategoryName(item.sub_category_id)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {getBrandName(item.brand_id)}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">
                        {item.product_qty}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-primary whitespace-nowrap">
                        ৳ {Number(item.total_amount).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-secondary text-primary font-semibold py-3 px-6 rounded-t-xl border-b border-white">
            Customer Details
          </div>
          <div className="bg-white p-6 md:p-8 rounded-b-xl flex flex-col sm:flex-row gap-6 md:gap-8 shadow-sm border border-gray-100">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-secondary rounded-full flex items-center justify-center text-xl md:text-2xl font-bold text-primary shrink-0 uppercase">
              {order.name?.charAt(0)}
            </div>
            <div className="space-y-3 flex-1">
              {[
                { label: "Name", value: order.name, bold: true },
                { label: "Email", value: order.email },
                { label: "Phone", value: order.phone },
                {
                  label: "Address",
                  value: `${order.address}, ${order.city} - ${order.postcode}`,
                },
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:gap-4">
                  <span className="text-gray-400 sm:text-gray-500 text-xs sm:text-base w-32 uppercase sm:capitalize tracking-wider">
                    {item.label}:
                  </span>
                  <span
                    className={`text-gray-800 ${item.bold ? "font-semibold" : ""}`}
                  >
                    {item.value || "N/A"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductsDetails;
