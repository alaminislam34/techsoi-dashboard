"use client";

import React from "react";
import { Upload, X } from "lucide-react";

type Props = {
  images: Array<File | string | any>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
};

export default function ImageUploader({ images, onFileChange, onRemoveImage }: Props) {
  return (
    <div className="space-y-4 pt-2">
      <label className="text-[15px] font-medium text-[#64748b]">Product Images (1st is Main, max 5)</label>
      <div className="border-[1.5px] border-[#38bdf8]/30 border-dashed rounded-md p-4 flex items-center gap-3 cursor-pointer hover:bg-sky-50 transition-colors relative">
        <Upload className="text-[#38bdf8]" size={20} />
        <span className="text-[#94a3b8] text-sm">Upload images</span>
        <input type="file" accept="image/*" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={onFileChange} />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {images.map((file, i) => (
          <div key={i} className="relative group border rounded-xl p-2 bg-slate-50 shadow-sm max-w-30">
            <span className="text-[10px] absolute -top-2 left-2 bg-sky-500 text-white px-2 py-0.5 rounded-full z-10 font-medium">
              {i === 0 ? "Main Image" : `Extra ${i}`}
            </span>

            <div className="relative max-w-30 aspect-square rounded-lg overflow-hidden bg-gray-100">
              {
                (() => {
                  let src = "";
                  let created = false;

                  if (typeof file === "string") {
                    src = file;
                  } else if (file instanceof File || (file && typeof file === "object")) {
                    try {
                      src = URL.createObjectURL(file);
                      created = true;
                    } catch (e) {
                      console.warn("createObjectURL failed for image item", e);
                      src = "";
                    }
                  }

                  return (
                    <img
                      src={src}
                      alt={`preview-${i}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onLoad={() => {
                        if (created && src) URL.revokeObjectURL(src);
                      }}
                      onError={() => {
                        if (created && src) URL.revokeObjectURL(src);
                      }}
                    />
                  );
                })()
              }

              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button type="button" onClick={() => onRemoveImage(i)} className="bg-white/90 p-1.5 rounded-full text-red-600 hover:bg-red-500 hover:text-white transition-colors shadow-lg">
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
