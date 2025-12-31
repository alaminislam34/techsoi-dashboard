"use client";

import React, { useState, useRef } from "react";
import { Upload, Pencil, Trash2 } from "lucide-react";

const BannerManage = () => {
  const [previewImage, setPreviewImage] = useState("/images/Hero Banner.png");
  // New state to control visibility of the preview section
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const uploadedBanners = [
    { id: 1, name: "Hero section banner 1", size: "1.3 mb" },
    { id: 2, name: "Hero section banner 2", size: "2.3 mb" },
    { id: 3, name: "Hero section banner 3", size: "1.7 mb" },
  ];

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setShowPreview(true); // Show the preview when a file is picked
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleSaveChanges = () => {
    // Logic for saving (API calls, etc.) would go here
    console.log("Image saved!");

    setShowPreview(false); // Hide the preview section after saving
    setPreviewImage("/images/Hero Banner.png"); // Optional: Reset to default
  };

  return (
    <div className="w-full space-y-8">
      {/* --- Upload Section --- */}
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
            <span>Choose a file</span>
          </div>

          <button
            onClick={handleUploadClick}
            className="bg-primary hover:opacity-90 text-white px-10 py-2.5 rounded-lg font-medium transition-all shrink-0"
          >
            Upload
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Choosen file must be dimension 1520 X 620 pixel.
        </p>
      </div>

      {/* --- Conditional Preview Section --- */}
      {showPreview && (
        <div className="space-y-4 animate-in fade-in duration-500">
          <h2 className="text-sm font-medium text-gray-500">Preview</h2>
          <div className="relative w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
            <img
              src={previewImage}
              alt="Banner Preview"
              className="w-full h-auto object-cover max-h-140 transition-opacity duration-300"
              onError={(e) => {
                e.target.src = "/images/Hero Banner.png";
              }}
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveChanges}
              className="bg-primary hover:bg-dark text-white px-8 py-2.5 rounded-lg font-medium transition-all shadow-md active:scale-95"
            >
              Save Changes
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
            {uploadedBanners.map((banner) => (
              <tr
                key={banner.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="p-4 flex items-center gap-3">
                  <div className="w-10 h-7 bg-gray-200 rounded shrink-0"></div>
                  <span className="text-dark font-normal">{banner.name}</span>
                </td>
                <td className="p-4 text-gray-500">{banner.size}</td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-4">
                    <button className="text-dark hover:text-primary transition-colors">
                      <Pencil size={18} />
                    </button>
                    <button className="text-primary_red hover:scale-110 transition-transform">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BannerManage;
