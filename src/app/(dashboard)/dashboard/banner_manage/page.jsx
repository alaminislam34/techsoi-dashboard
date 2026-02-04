"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, Pencil, Trash2, Loader2 } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { BANNER_API } from "@/api/apiEndPoint";
import Swal from "sweetalert2";
import apiService from "@/api/api";

const BannerManage = () => {
  const [previewImage, setPreviewImage] = useState("/images/Hero Banner.png");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banners, setBanners] = useState([]);
  const fileInputRef = useRef(null);
  console.log(banners);
  const fetchBanners = async () => {
    try {
      const response = await apiService.get(BANNER_API);
      setBanners(response.data?.data || []);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setShowPreview(true);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };
  const handleSaveChanges = async () => {
    if (!selectedFile) return toast.error("Please select an image first");

    setLoading(true);
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const response = await apiService.post(BANNER_API, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Banner uploaded successfully!");
        setShowPreview(false);
        setSelectedFile(null);
        fetchBanners();
      }
    } catch (err) {
      console.error("Upload failed", err);
      toast.error(err.response?.data?.message || "Failed to upload banner");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This banner will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await apiService.delete(`${BANNER_API}/${id}`);
      toast.success("Banner deleted successfully");
      fetchBanners();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-gray-500">Upload Image</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <div
            onClick={handleUploadClick}
            className="flex-1 p-3 bg-white border border-primary/50 rounded-lg flex items-center gap-2 text-gray-400 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <Upload size={18} className="text-primary" />
            <span>{selectedFile ? selectedFile.name : "Choose a file"}</span>
          </div>

          <button
            onClick={handleSaveChanges}
            disabled={loading || !showPreview}
            className="bg-primary hover:opacity-90 disabled:bg-gray-400 text-white px-10 py-2.5 rounded-lg font-medium transition-all shrink-0 flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Upload"
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Chosen file must be dimension 1520 X 620 pixel.
        </p>
      </div>

      {showPreview && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <h2 className="text-sm font-medium text-gray-500">Preview</h2>
          <div className="relative w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
            <img
              src={previewImage}
              alt="Banner Preview"
              className="w-full h-auto object-cover max-h-140 transition-opacity duration-300"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowPreview(false);
                setSelectedFile(null);
              }}
              className="px-6 py-2.5 text-gray-500 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={loading}
              className="bg-primary hover:bg-dark text-white px-8 py-2.5 rounded-lg font-medium transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={18} />}
              Confirm & Save
            </button>
          </div>
        </div>
      )}

      {/* --- Uploaded Banners Table --- */}
      <div className="overflow-hidden rounded-lg border border-gray-100 bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-sm uppercase">
              <th className="p-4 font-medium">Uploaded banner</th>
              <th className="p-4 font-medium">Size</th>
              <th className="p-4 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {banners.length > 0 ? (
              banners.map((banner) => (
                <tr
                  key={banner.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4 flex items-center gap-3">
                    {banner.image ? (
                      <img
                        src={banner.image}
                        className="w-12 h-8 bg-gray-200 rounded object-cover shrink-0"
                        alt="banner"
                      />
                    ) : (
                      <div className="w-10 h-6 rounded-lg bg-gray-50"></div>
                    )}
                    <span className="text-dark font-normal">
                      {banner.name || `Banner ${banner.id}`}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{banner.size || "N/A"}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="text-primary_red hover:scale-110 transition-transform"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-10 text-center text-gray-400">
                  No banners found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BannerManage;
