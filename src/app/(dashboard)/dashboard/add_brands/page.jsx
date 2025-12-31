"use client";

import React, { useState, useRef } from "react";
import { Upload, Pencil, Trash2 } from "lucide-react";

const AddBrands = () => {
  // 1. Selected file ebong tar name maintain korar jonno state
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState("Choose a file");

  // 2. Added brands list-er jonno state
  const [brands, setBrands] = useState([
    { id: 1, name: "Lenovo", size: "1.3 mb", preview: "" },
    { id: 2, name: "Apple", size: "2.3 mb", preview: "" },
    { id: 3, name: "A4Tech", size: "1.7 mb", preview: "" },
  ]);

  const fileInputRef = useRef(null);

  // File select korle size ebong name save korar logic
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  // Upload button-e click korle list-e brand add korar function
  const handleAddBrand = () => {
    if (!selectedFile) return;

    // File size-ke Bytes theke MB-te convert kora
    const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(1) + " mb";

    // Notun brand object create kora dynamic size-shoho
    const newBrand = {
      id: Date.now(),
      name: selectedFile.name.split(".")[0], // Extension chhara file name
      size: fileSizeMB, // Dynamic real-time size
      preview: URL.createObjectURL(selectedFile), // UI-te image dekhate preview URL
    };

    // Table state update kora
    setBrands([newBrand, ...brands]);
    
    // Form reset kora
    setFileName("Choose a file");
    setSelectedFile(null);
  };

  return (
    <div className="w-full space-y-8">
      {/* --- Upload Logo Section --- */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-gray-500">Upload Logo</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png"
            className="hidden"
          />

          <div
            onClick={handleUploadClick}
            className="flex-1 p-3 bg-white border border-primary/50 rounded-lg flex items-center gap-2 text-gray-400 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <Upload size={18} className="text-primary" />
            <span className={fileName !== "Choose a file" ? "text-dark" : ""}>
              {fileName}
            </span>
          </div>

          <button
            onClick={handleAddBrand}
            disabled={!selectedFile}
            className={`px-12 py-2.5 rounded-lg font-medium transition-all shrink-0 shadow-sm text-white ${
              selectedFile
                ? "bg-primary hover:opacity-90"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Upload
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Choosen file must be PNG format with transparent background
        </p>
      </div>

      <hr className="border-gray-100" />

      {/* --- Added Brands Table --- */}
      <div className="overflow-hidden rounded-lg bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-gray-500 text-sm border-b border-gray-100">
              <th className="p-4 font-medium">Added Brands</th>
              <th className="p-4 font-medium">Size</th>
              <th className="p-4 font-medium text-right pr-8">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {brands.map((brand) => (
              <tr
                key={brand.id}
                className="hover:bg-gray-50/50 transition-colors group"
              >
                <td className="p-4 flex items-center gap-4">
                  {/* Image Display Box */}
                  <div className="w-10 h-10 bg-gray-100 rounded-md shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                    {brand.preview ? (
                      <img
                        src={brand.preview}
                        alt={brand.name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  <span className="text-dark font-normal">{brand.name}</span>
                </td>
                <td className="p-4 text-gray-400 text-sm">{brand.size}</td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-5 pr-4">
                    <button className="text-dark hover:text-primary transition-colors">
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() =>
                        setBrands(brands.filter((b) => b.id !== brand.id))
                      }
                      className="text-primary_red hover:scale-110 transition-transform"
                    >
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

export default AddBrands;