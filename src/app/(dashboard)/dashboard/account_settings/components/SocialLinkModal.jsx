"use client";

import React from "react";
import { X, Upload } from "lucide-react";

const SocialLinkModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-125 bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-1 rounded-full border border-primary/30 text-primary hover:bg-secondary/50 transition-all"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-dark">Add New Social Link</h2>
        </div>

        <form className="space-y-6">
          {/* Icon Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark">Upload icon</label>
            <div className="relative">
              <input type="file" className="hidden" id="icon-upload" />
              <label
                htmlFor="icon-upload"
                className="flex items-center gap-3 w-full px-4 py-3 bg-white border border-primary/30 rounded-xl cursor-pointer text-gray-400 hover:border-primary transition-all"
              >
                <Upload size={18} className="text-primary" />
                <span>Choose a file</span>
              </label>
            </div>
          </div>

          {/* Social Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark">
              Social Media Name
            </label>
            <input
              type="text"
              placeholder="Enter Name"
              className="w-full px-4 py-3 bg-white border border-primary/30 rounded-xl focus:outline-none focus:border-primary text-dark transition-all"
            />
          </div>

          {/* Social URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-dark">
              Social Media URL
            </label>
            <input
              type="url"
              placeholder="Enter URL"
              className="w-full px-4 py-3 bg-white border border-primary/30 rounded-xl focus:outline-none focus:border-primary text-dark transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 bg-primary text-white rounded-xl font-semibold shadow-lg shadow-primary/30 hover:opacity-90 transition-all mt-4"
          >
            Add Link
          </button>
        </form>
      </div>
    </div>
  );
};

export default SocialLinkModal;
