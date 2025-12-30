"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation"; // To get ID from URL
import { ChevronDown, Star } from "lucide-react";
import productsData from "@/app/FakeData/products.json";

const ProductsDetails = () => {
  const params = useParams();
  const orderId = params.id; // current URL parameter

  // Find the specific product from JSON
  const order =
    productsData.find((item) => item.order_info.id === orderId) ||
    productsData[0];

  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(order.order_info.status);

  const statusOptions = ["New Order", "Pending", "Delivered", "Cancelled"];

  const getStatusStyles = (currentStatus) => {
    switch (currentStatus) {
      case "Cancelled":
        return "text-primary_red border-primary_red bg-red-50";
      case "Pending":
        return "text-orange-500 border-orange-500 bg-orange-50";
      case "Delivered":
        return "text-green-600 border-green-600 bg-green-50";
      default:
        return "text-primary border-primary bg-secondary/50";
    }
  };

  return (
    <div className="text-dark mt-6">
      <div className="space-y-6">
        <section>
          <div className="bg-secondary text-primary font-semibold py-3 px-6 rounded-xl border-b border-white">
            Order Details
          </div>
          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-b-xl flex flex-col md:flex-row gap-8 relative">
            <img
              src={order.product.image_url}
              alt={order.product.name}
              className="w-full md:w-64 h-64 bg-gray-200 rounded-2xl shrink-0 object-cover"
            />

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-4">
                <span className="text-gray-500 font-medium w-24">
                  Order ID:
                </span>
                <span className="font-bold text-lg">
                  #{order.order_info.id}
                </span>
              </div>
              <div className="pt-1">
                <span className="bg-secondary text-primary px-4 py-1 rounded-md text-sm font-medium">
                  {order.product.category}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-700 py-1">
                {order.product.name}
              </h2>
              <div className="space-y-2 pt-2">
                <div className="flex">
                  <span className="text-gray-500 w-32">Product price:</span>
                  <span className="font-medium">
                    {order.product.price} {order.product.currency}
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-32">Quantity:</span>
                  <span className="font-medium">
                    {order.product.quantity} ps
                  </span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-32">Discount:</span>
                  <span className="font-medium">
                    {order.product.discount_percent}%
                  </span>
                </div>
                <div className="flex pt-2">
                  <span className="text-gray-500 w-32">Net Price:</span>
                  <span className="font-bold">
                    {order.product.net_price} {order.product.currency}
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute top-8 right-8">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-36 gap-2 border px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${getStatusStyles(
                  status
                )}`}
              >
                {status}
                <ChevronDown size={16} className={isOpen ? "rotate-180" : ""} />
              </button>
              {isOpen && (
                <div className="absolute right-0 mt-2 w-full bg-white border border-gray-100 rounded-lg shadow-xl z-20 py-1">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setStatus(opt);
                        setIsOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-secondary"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section>
          <div className="bg-secondary text-primary font-semibold py-3 px-6 rounded-xl border-b border-white">
            Customer Details
          </div>
          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-b-xl flex flex-col md:flex-row gap-8">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-primary">
              {order.customer.name.charAt(0)}
            </div>
            <div className="space-y-2">
              <div className="flex">
                <span className="text-gray-500 w-32">Name:</span>{" "}
                <span>{order.customer.name}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-32">Phone:</span>{" "}
                <span>{order.customer.phone}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-32">Address:</span>{" "}
                <span>{order.customer.address}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-32">Message:</span>{" "}
                <span>{order.customer.customer_message}</span>
              </div>
              <div className="flex">
                <span className="text-gray-500 w-32">Delivery:</span>{" "}
                <span>{order.order_info.delivery_type}</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="bg-secondary text-primary font-semibold py-3 px-6 rounded-xl border-b border-white">
            Customer Review
          </div>
          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-b-xl">
            <div className="flex items-start gap-4">
              <span className="text-gray-500 w-20">Rating:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">({order.review.rating})</span>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      fill={
                        i < Math.floor(order.review.rating)
                          ? "currentColor"
                          : "none"
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-4 mt-4">
              <span className="text-gray-500 w-20 shrink-0">Feedback:</span>
              <p className="text-gray-700 leading-relaxed max-w-4xl">
                {order.review.feedback_bn}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductsDetails;
