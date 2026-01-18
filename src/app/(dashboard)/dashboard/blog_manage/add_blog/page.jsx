"use client";

import React, { useState, useRef } from "react";
import { Upload, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import apiService from "@/api/api";
import { BLOG_API } from "@/api/apiEndPoint";

const PublishNewBlog = () => {
  const [title, setTitle] = useState("");
  const [shortDetails, setShortDetails] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]); // Preview এর জন্য
  const [rawFiles, setRawFiles] = useState([]); // এপিআই-তে পাঠানোর আসল ফাইলের জন্য
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // ইমেজ সিলেক্ট হ্যান্ডলার
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);

    if (files.length + images.length > 4) {
      toast.error("You can only upload up to 4 images.");
      return;
    }

    const newRawFiles = [...rawFiles, ...files];
    setRawFiles(newRawFiles);

    const newImagesPreview = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setImages([...images, ...newImagesPreview]);
  };

  const removeImage = (id, index) => {
    setImages(images.filter((img) => img.id !== id));
    // আসল ফাইল লিস্ট থেকেও রিমুভ করা
    const updatedFiles = [...rawFiles];
    updatedFiles.splice(index, 1);
    setRawFiles(updatedFiles);
  };

  // পাবলিশ ব্লগ হ্যান্ডলার
  const handlePublish = async () => {
    if (!title || !shortDetails || !description) {
      return toast.error("Please fill all fields");
    }
    if (rawFiles.length === 0) {
      return toast.error("Please upload at least one image");
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("short_details", shortDetails);
    formData.append("description", description);

    // মাল্টিপল ইমেজ লুপ করে অ্যাপেন্ড করা
    rawFiles.forEach((file) => {
      formData.append("images[]", file); // আপনার এপিআই যদি 'images[]' অ্যারে হিসেবে চায়
    });

    try {
      const res = await apiService.post(BLOG_API, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.status) {
        toast.success("Blog published successfully!");
        // ফর্ম রিসেট করা
        setTitle("");
        setShortDetails("");
        setDescription("");
        setImages([]);
        setRawFiles([]);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to publish blog");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 lg:mt-0">
        {/* Blog Title */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">
            Blog Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Type here"
            className="w-full px-4 py-3 bg-secondary/20 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark"
          />
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
            <span className="text-sm">Choose images</span>
          </div>

          {/* Image Preview List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {images.map((img, index) => (
              <div
                key={img.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={img.url}
                    alt="preview"
                    className="w-10 h-10 rounded object-cover"
                  />
                  <span className="text-sm text-gray-600 truncate max-w-37.5">
                    {img.name}
                  </span>
                </div>
                <button
                  onClick={() => removeImage(img.id, index)}
                  className="text-red-500"
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
          <textarea
            rows={2}
            value={shortDetails}
            onChange={(e) => setShortDetails(e.target.value)}
            placeholder="Short overview of the blog"
            className="w-full px-4 py-3 bg-secondary/20 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark resize-none"
          />
        </div>

        {/* Blog Description */}
        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">
            Blog Description
          </label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Main content of your blog"
            className="w-full px-4 py-3 bg-secondary/20 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark resize-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={handlePublish}
          disabled={loading}
          className="bg-primary hover:opacity-90 text-white px-10 py-3 rounded-lg font-medium shadow-md transition-all flex items-center gap-2"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? "Publishing..." : "Publish Blog"}
        </button>
      </div>
    </div>
  );
};

export default PublishNewBlog;
