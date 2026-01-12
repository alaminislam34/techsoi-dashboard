"use client";

import React, { useEffect, useState } from "react";
import Table from "@/app/(dashboard)/components/BodyContent/Table";
import { Eye, Edit3, Trash2, EyeOff } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";

const ProductsManage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // --- Fetch products from API ---
  const fetchProducts = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await axios.get("https://api.techsoibd.com/api/product");

      if (res.data?.status !== true || !Array.isArray(res.data.data)) {
        setErrorMsg("Invalid server response");
        toast("Invalid server response", { icon: "⚠️" });
        return;
      }

      const formattedData = res.data.data.map((product) => ({
        product: {
          id: product.id,
          name: product.name,
          image_url: product.main_image,
          category: product.category_id,
          quantity: product.stock,
          net_price: product.sale_price,
        },
        order_info: {
          id: product.id,
          discount: "10%",
        },
      }));

      if (formattedData.length === 0) {
        toast("No products found", { icon: "ℹ️" });
      }

      setData(formattedData);
    } catch (error) {
      console.error("Fetch products error:", error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (status === 401) {
          setErrorMsg("Unauthorized. Please login again.");
          toast("Unauthorized. Please login again.", { icon: "⚠️" });
        } else if (status === 403) {
          setErrorMsg("You do not have permission to view products.");
          toast("You do not have permission to view products.", { icon: "⚠️" });
        } else {
          setErrorMsg(
            error.response?.data?.message || "Failed to load products."
          );
          toast(error.response?.data?.message || "Failed to load products.", {
            icon: "⚠️",
          });
        }
      } else {
        setErrorMsg("Something went wrong. Please try again.");
        toast("Something went wrong. Please try again.", { icon: "⚠️" });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- Action Handlers ---
  const handleToggleVisibility = (id) => {
    toast.success(`Product visibility updated`, {
      icon: "👁️",
      style: { borderRadius: "10px", background: "#333", color: "#fff" },
    });
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel",
      background: "#ffffff",
      customClass: {
        title: "text-xl font-semibold text-dark",
        confirmButton: "px-4 py-2 rounded-md text-sm font-medium",
        cancelButton: "px-4 py-2 rounded-md text-sm font-medium",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const filteredData = data.filter((item) => item.order_info.id !== id);
        setData(filteredData);
        toast.error("Product has been deleted.", {
          duration: 3000,
          position: "top-center",
        });
      }
    });
  };

  const handleEdit = (productName) => {
    toast(`Opening editor for: ${productName}`, {
      icon: "📝",
    });
  };

  // --- Table Columns ---
  const productColumns = [
    {
      header: "All Products",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-md shrink-0 overflow-hidden">
            <img
              src={item.product.image_url}
              alt={item.product.name}
              className="w-full h-full object-cover"
              onError={(e) => (e.target.src = "https://via.placeholder.com/40")}
            />
          </div>
          <span className="truncate max-w-50 lg:max-w-75 block text-dark font-normal">
            {item.product.name}
          </span>
        </div>
      ),
    },
    {
      header: "Category",
      render: (item) => (
        <span className="text-gray-600">{item.product.category}</span>
      ),
    },
    {
      header: "Stock",
      render: (item) => (
        <span className="text-gray-600">
          {item.product.quantity.toString().padStart(2, "0")}
        </span>
      ),
    },
    {
      header: "Discount",
      render: (item) => (
        <span className="text-gray-600">
          {item.order_info.discount || "10%"}
        </span>
      ),
    },
    {
      header: "Price",
      render: (item) => (
        <span className="text-gray-600">{item.product.net_price}</span>
      ),
    },
    {
      header: "Action",
      className: "text-center",
      render: (item, index) => (
        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={() => handleToggleVisibility(item.order_info.id)}
            className="text-[#3b82f6] hover:opacity-70 transition-opacity"
          >
            {[2, 3].includes(index % 10) ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>

          <Link
            href={`/dashboard/products_manage/${item.order_info.id}`}
            className="text-slate-500 hover:text-dark transition-colors"
          >
            <Edit3 size={18} />
          </Link>

          <button
            onClick={() => handleDelete(item.order_info.id)}
            className="text-red-500 hover:opacity-70 transition-opacity"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <p className="text-center py-10">Loading products...</p>;
  if (errorMsg)
    return <p className="text-center py-10 text-red-500">{errorMsg}</p>;

  return (
    <div className="w-full">
      <Toaster />
      <Table data={data} columns={productColumns} itemsPerPage={10} />
    </div>
  );
};

export default ProductsManage;
