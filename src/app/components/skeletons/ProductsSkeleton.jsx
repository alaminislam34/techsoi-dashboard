"use client";

import React from "react";

export default function ProductsSkeleton({ rows = 6 }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4">
        <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse"></div>
        <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse"></div>
      </div>

      <div className="bg-white border border-gray-100 rounded-lg p-4">
        <div className="grid grid-cols-6 gap-4 items-center font-medium text-sm text-gray-500 mb-3">
          <div className="col-span-2">Product Title</div>
          <div className="">Category</div>
          <div className="">Stock</div>
          <div className="">Discount</div>
          <div className="text-right">Price</div>
        </div>

        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-6 gap-4 items-center py-3 border-t border-gray-100"
            >
              <div className="col-span-2 flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-200 rounded-md animate-pulse" />
                <div className="w-full">
                  <div className="h-4 bg-gray-200 rounded-md w-3/4 animate-pulse mb-2" />
                  <div className="h-3 bg-gray-200 rounded-md w-1/2 animate-pulse" />
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded-md animate-pulse" />
              <div className="h-4 bg-gray-200 rounded-md w-12 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded-md w-12 animate-pulse" />
              <div className="flex justify-end">
                <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
