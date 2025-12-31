"use client";

import React from "react";
import { Upload } from "lucide-react";

const UpdateCategoryFrom = () => {
  return (
    <div className="bg-white space-y-10">
      <section>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-7">
            <label className="block text-base md:text-lg text-dark mb-2">
              Create Main Category
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-md border border-primary focus:outline-none placeholder-gray-400 text-gray-600"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-base md:text-lg text-dark mb-2">
              Upload icon
            </label>
            <div className="relative">
              <input type="file" id="file-upload" className="hidden" />
              <label
                htmlFor="file-upload"
                className="flex items-center gap-2 w-full px-4 py-3 rounded-md border border-primary cursor-pointer text-gray-400"
              >
                <Upload size={20} className="text-primary" />
                <span className="truncate">Choose a file</span>
              </label>
            </div>
          </div>
          <div className="md:col-span-2">
            <button className="w-full bg-primary hover:bg-[#2591be] text-white py-3 rounded-md font-medium transition-colors">
              Create
            </button>
          </div>
        </div>
      </section>

      {/* --- Create Sub Category Section --- */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-base md:text-lg text-dark mb-2">
              Select Main Category
            </label>
            <div className="relative">
              <select className="w-full appearance-none px-4 py-3 rounded-md border border-primary focus:outline-none text-gray-400 bg-white">
                <option>Enter your name</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-black"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="md:col-span-5">
            <label className="block text-base md:text-lg text-dark mb-2">
              Create Sub Category
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-md border border-primary focus:outline-none placeholder-gray-400 text-gray-600"
            />
          </div>
          <div className="md:col-span-2">
            <button className="w-full bg-primary hover:bg-[#2591be] text-white py-3 rounded-md font-medium transition-colors">
              Create
            </button>
          </div>
        </div>
      </section>

      {/* --- Add Brands Section --- */}
      <section>
        <label className="block text-base md:text-lg text-dark mb-2">
          Add Brands
        </label>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-10">
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-md border border-primary focus:outline-none placeholder-gray-400 text-gray-600"
            />
          </div>
          <div className="md:col-span-2">
            <button className="w-full bg-primary hover:bg-[#2591be] text-white py-3 rounded-md font-medium transition-colors">
              Create
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UpdateCategoryFrom;
