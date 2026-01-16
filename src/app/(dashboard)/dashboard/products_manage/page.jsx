"use client";

import React, { useEffect, useState } from "react";
import Table from "@/app/(dashboard)/components/BodyContent/Table";
import { Eye, Edit3, Trash2, EyeOff, Search, ChevronDown } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import { PRODUCT_API } from "@/api/apiEndPoint";

const ProductsManage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // --- Fetch products from API ---
  const fetchProducts = async () => {
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await axios.get(PRODUCT_API);

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
            error.response?.data?.message || "Failed to load products.",
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
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 py-4">
        {/* --- Add New Product Button --- */}
        <Link
          href={"/dashboard/products_manage/add_product"}
          className="w-full md:w-auto bg-[#32afe2] hover:bg-[#2a9ac9] text-white px-10 py-3.5 rounded-2xl font-medium text-lg transition-colors shadow-sm active:scale-95"
        >
          Add New Product
        </Link>

        {/* --- Search Bar --- */}
        <div className="flex-1 w-full max-w-2xl relative">
          <input
            type="text"
            placeholder="Search products"
            className="w-full pl-6 pr-12 py-3.5 bg-white border border-[#32afe2]/40 rounded-2xl text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#32afe2] placeholder:text-gray-400"
          />
          <Search
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#32afe2]"
            size={24}
          />
        </div>

        {/* --- Sort By Dropdown --- */}
        <div className="w-full md:w-auto relative min-w-40">
          <select className="w-full appearance-none bg-white border border-[#32afe2]/40 rounded-2xl px-6 py-3.5 pr-12 text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#32afe2] cursor-pointer">
            <option>Sort By</option>
            <option>Newest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>
          <ChevronDown
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            size={20}
          />
        </div>
      </div>
      <Table data={data} columns={productColumns} itemsPerPage={10} />
    </div>
  );
};

export default ProductsManage;
