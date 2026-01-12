"use client";

import React, { useState, useEffect } from "react";
import { Eye, Trash2, Star } from "lucide-react";
import productsData from "@/app/FakeData/products.json";
import Table from "../../components/BodyContent/Table";
import Cookies from "js-cookie";
import axios from "axios";
import { GET_REVIEW_API } from "@/api/apiEndPoint";

const ReviewManage = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const token = Cookies.get("admin_token");
    if (!token) {
      return console.log("Token expired");
    }
    const fetchReviews = async () => {
      try {
        const res = await axios.get(GET_REVIEW_API, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(res.data);
        if (res.status === 200) {
          setData(res.data.data);
        } else {
          setData([]);
        }
      } catch (error) {
        console.log(error.message || "Something went wrong");
      }
    };
    fetchReviews();
  }, []);

  const handleDelete = (id) => {
    const filteredData = data.filter((item) => item.order_info.id !== id);
    setData(filteredData);
  };
  const columns = [
    {
      header: "Product",
      key: "product",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded shrink-0 overflow-hidden border border-gray-100">
            <img
              src={item.product.image_url}
              alt={item.product.name}
              className="w-full h-full object-contain p-1"
            />
          </div>
          <span className="text-dark text-sm font-normal line-clamp-1 max-w-55">
            {item.product.name}
          </span>
        </div>
      ),
    },
    {
      header: "Customer",
      key: "customer",
      render: (item) => (
        <span className="text-sm text-dark italic">{item.customer.name}</span>
      ),
    },
    {
      header: "Rating",
      className: "text-center",
      render: (item) => (
        <div className="flex items-center justify-center gap-1 text-sm font-medium">
          {item.review.rating.toFixed(1)}
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
        </div>
      ),
    },
    {
      header: "Review",
      render: (item) => (
        <p className="text-sm text-gray-500 line-clamp-1 max-w-75">
          {item.review.feedback_bn}
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
            onClick={() => handleDelete(item.order_info.id)}
            className="text-primary_red hover:scale-110 transition-transform"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <Table data={data} columns={columns} itemsPerPage={10} />
    </div>
  );
};

export default ReviewManage;
