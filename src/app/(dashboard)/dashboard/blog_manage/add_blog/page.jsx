"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, Trash2, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import apiService from "@/api/api";
import { BLOG_API } from "@/api/apiEndPoint";
import Link from "next/link";

const PublishNewBlog = () => {
  const [title, setTitle] = useState("");
  const [titleBn, setTitleBn] = useState("");
  const [shortDetails, setShortDetails] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  // const [rawFiles, setRawFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    // respect max 4
    const maxAllowed = 4 - images.length;
    if (files.length > maxAllowed) {
      toast.error(`You can only add ${maxAllowed} more image(s)`);
    }

    const selected = files
      .slice(0, maxAllowed)
      .map((file, idx) => {
        if (!file.type || !file.type.startsWith("image/")) {
          toast.error(`${file.name} is not a valid image`);
          return null;
        }
        const id =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        return {
          id,
          file,
          url: URL.createObjectURL(file),
          name: file.name,
        };
      })
      .filter(Boolean);

    setImages((prev) => [...prev, ...selected]);
  };

  const removeImage = (id) => {
    setImages((prev) => {
      const next = prev.filter((i) => i.id !== id);
      // revoke object URLs for removed images
      prev.forEach((i) => {
        if (i.id === id) URL.revokeObjectURL(i.url);
      });
      return next;
    });
  };

  useEffect(() => {
    return () => {
      // cleanup all object URLs on unmount
      images.forEach((i) => URL.revokeObjectURL(i.url));
    };
  }, []);

  const handlePublish = async () => {
    if (!title || !titleBn || !shortDetails || !description) {
      return toast.error("Please fill all fields");
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("title_bn", titleBn);
    formData.append("short_description", shortDetails);
    formData.append("full_description", description);

    // Attach files
    // Backend may expect `image` (single) or `image[]` (multiple). Send both forms to be compatible.
    if (images.length === 1) {
      formData.append("image", images[0].file);
    } else if (images.length > 1) {
      // add first also as `image` to satisfy APIs expecting single-file field
      formData.append("image", images[0].file);
      images.forEach((img) => {
        formData.append("image[]", img.file);
      });
    }

    try {
      const res = await apiService.post(BLOG_API, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.status) {
        toast.success("Blog published successfully!");
        setTitle("");
        setTitleBn("");
        setShortDetails("");
        setDescription("");
        // cleanup object URLs
        images.forEach((i) => URL.revokeObjectURL(i.url));
        setImages([]);
      }
    } catch (error) {
      // richer logging for mysterious empty error objects
      try {
        console.error("Publish error (full):", {
          error,
          message: error?.message,
          isAxiosError: error?.isAxiosError,
          responseStatus: error?.response?.status,
          responseData: error?.response?.data,
          config: error?.config,
          stack: error?.stack,
          toJSON:
            typeof error?.toJSON === "function" ? error.toJSON() : undefined,
        });
      } catch (dumpErr) {
        console.error("Publish error (dump failed)", dumpErr, error);
      }

      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to publish blog";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      <div>
        <Link
          href={"/dashboard/blog_manage"}
          className="flex items-center gap-2 text-gray-400 text-sm md:text-base mb-3"
        >
          <ArrowLeft /> Back
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 lg:mt-0">
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
        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">
            Blog Title (Bengali)
          </label>
          <input
            type="text"
            value={titleBn}
            onChange={(e) => setTitleBn(e.target.value)}
            placeholder="Type here"
            className="w-full px-4 py-3 bg-secondary/20 border border-gray-200 rounded-lg focus:outline-none focus:border-primary text-dark"
          />
        </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {images.map((img, index) => (
              <div
                key={img.id}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={img.url}
                    alt={img.name || `preview-${index}`}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <span className="text-sm text-gray-600 truncate max-w-37.5">
                    {img.name}
                  </span>
                </div>
                <button
                  onClick={() => removeImage(img.id)}
                  className="text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

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
