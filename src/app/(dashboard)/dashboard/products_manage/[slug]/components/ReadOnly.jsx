"use client";
import React from "react";
import InputWrapper from "../add_product/components/InputWrapper";

export default function ProductView({ product, safeParse }) {
  const p = product || {};
  const d = p.details || {};

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
          Basic Information
        </h2>
        <InputWrapper label="Product Name">
          <input
            type="text"
            value={p.name || ""}
            readOnly
            className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg outline-none cursor-default"
          />
        </InputWrapper>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputWrapper label="Regular Price">
            <input
              type="text"
              value={p.regular_price || "0"}
              readOnly
              className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg outline-none cursor-default"
            />
          </InputWrapper>
          <InputWrapper label="Sale Price">
            <input
              type="text"
              value={p.sale_price || "0"}
              readOnly
              className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg outline-none cursor-default"
            />
          </InputWrapper>
        </div>

        <InputWrapper label="Full Description">
          <div className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-lg text-gray-700 min-h-25">
            {d.full_description || "No description provided."}
          </div>
        </InputWrapper>
      </div>

      {/* Specifications */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
          Specifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
          {safeParse(d.specifications).map((spec, i) => (
            <div
              key={i}
              className="py-2 flex justify-between border-b border-gray-50"
            >
              <span className="font-medium text-gray-500">
                {spec.name || spec.key}:
              </span>
              <span className="text-gray-900">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
