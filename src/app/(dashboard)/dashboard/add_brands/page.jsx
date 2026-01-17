"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, Trash2, Loader2, X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { SPECIAL_BRAND_API, SPECIAL_BRAND_SINGLE_API } from "@/api/apiEndPoint";

const AddBrands = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("Choose a file");
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  const fileInputRef = useRef(null);

  // ১. ব্র্যান্ড লিস্ট ফেচ করা
  const fetchBrands = async () => {
    try {
      const response = await axios.get(SPECIAL_BRAND_API);
      setBrands(response.data?.data || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // ২. ব্র্যান্ড অ্যাড অথবা আপডেট করার লজিক
  const handleSubmit = async () => {
    if (!selectedFile) return toast.error("Please select an image");

    setLoading(true);
    const formData = new FormData();
    if (selectedFile) {
      formData.append("image", selectedFile);
    }

    try {
      await axios.post(SPECIAL_BRAND_API, formData);
      toast.success("Brand added successfully!");

      fetchBrands();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  // ৩. ডিলিট লজিক
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(SPECIAL_BRAND_SINGLE_API(id));
      toast.success("Brand deleted");
      fetchBrands();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* --- Upload Logo Section --- */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-gray-500">Upload Logo</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png, image/jpeg"
            className="hidden"
          />

          <div
            onClick={handleUploadClick}
            className={`flex-1 p-3 bg-white border border-primary/50 rounded-lg flex items-center gap-2 text-gray-400 cursor-pointer hover:bg-gray-50 transition-colors`}
          >
            <Upload size={18} className={"text-primary"} />
            <span
              className={
                fileName !== "Choose a file" ? "text-dark font-medium" : ""
              }
            >
              {fileName}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={loading || !selectedFile}
              className={`px-12 py-2.5 rounded-lg font-medium transition-all shrink-0 shadow-sm text-white flex items-center gap-2 bg-primary
              disabled:bg-gray-300`}
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              Upload
            </button>
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* --- Added Brands Table --- */}
      <div className="overflow-hidden rounded-lg bg-white border border-gray-50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-500 text-sm border-b border-gray-100 bg-gray-50/50">
              <th className="p-4 font-medium">Added Brands</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right pr-8">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isFetching ? (
              <tr>
                <td colSpan="3" className="p-10 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr
                  key={brand.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-md shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                      <img
                        src={brand.image_url || brand.image}
                        alt="brand"
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <span className="text-dark font-normal">
                      {brand.name || "Brand Logo"}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">Active</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-5 pr-4">
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="text-primary_red hover:scale-110 transition-transform"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddBrands;
