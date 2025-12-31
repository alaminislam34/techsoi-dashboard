"use client";

import React, { useState, useRef } from "react";
import { Upload, Trash2, Pencil } from "lucide-react";
import Link from "next/link";

const PublishNewBlog = () => {
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  // Function to handle image selection
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + images.length > 4) {
      alert("You can only upload up to 4 images.");
      return;
    }

    const newImages = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setImages([...images, ...newImages]);
  };

  const removeImage = (id) => {
    setImages(images.filter((img) => img.id !== id));
  };

  return (
    <div className="w-full space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 lg:mt-0">
        {/* Blog Title */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">
            Blog Title
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Type here"
              className="w-full px-4 py-3 bg-secondary/20 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark"
            />
          </div>
        </div>
        {/* Upload Images Section */}
        <div className="md:col-span-2 space-y-4">
          <label className="text-sm font-medium text-gray-600">
            Upload Images (upto 4)
          </label>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />

          <div
            onClick={() => fileInputRef.current.click()}
            className="w-full p-4 bg-secondary/20 border border-dashed border-primary/50 rounded-lg flex items-center gap-3 text-gray-500 cursor-pointer hover:bg-secondary/30 transition-all"
          >
            <Upload size={20} className="text-primary" />
            <span className="text-sm">Choose a file</span>
          </div>

          {/* Image Preview List */}
          <div className="space-y-2">
            {images.map((img) => (
              <div
                key={img.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-gray-200 overflow-hidden">
                    <img
                      src={img.url}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm text-gray-600 truncate max-w-xs">
                    {img.name}
                  </span>
                </div>
                <button
                  onClick={() => removeImage(img.id)}
                  className="text-primary_red hover:scale-110 transition-transform"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
        {/* Short Details */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">
            Short Details
          </label>
          <div className="relative">
            <textarea
              rows={2}
              placeholder="Type here"
              className="w-full px-4 py-3 bg-secondary/20 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark resize-none"
            />
          </div>
        </div>

        {/* Blog Description */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">
            Blog Description
          </label>
          <div className="relative">
            <textarea
              rows={5}
              placeholder="Type here"
              className="w-full px-4 py-3 bg-secondary/20 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark resize-none"
            />
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className=" flex items-center justify-end">
        <button className="bg-primary hover:opacity-90 text-white px-10 py-3 rounded-lg font-medium shadow-md transition-all">
          Publish Product
        </button>
      </div>
    </div>
  );
};

export default PublishNewBlog;
