import React from "react";
import { Plus, X } from "lucide-react";

const SpecsEditor = ({ specs, onChangeSpec, onRemoveSpec, onAddSpec }) => (
  <div className="space-y-4">
    <label className="text-[15px] font-medium text-[#64748b]">
      Specifications
    </label>
    {specs.map((spec, idx) => (
      <div key={idx} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <input
            type="text"
            value={spec.name}
            onChange={(e) => onChangeSpec(idx, "name", e.target.value)}
            placeholder="Spec Name"
            className="custom-input"
          />
        </div>
        <div className="flex-1 w-full">
          <input
            type="text"
            value={spec.value}
            onChange={(e) => onChangeSpec(idx, "value", e.target.value)}
            placeholder="Value"
            className="custom-input"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onRemoveSpec(idx)}
            className="h-13 w-13 flex items-center justify-center bg-[#ff0000] text-white rounded-lg"
          >
            <X size={20} />
          </button>
          {idx === specs.length - 1 && (
            <button
              type="button"
              onClick={onAddSpec}
              className="h-13 w-13 flex items-center justify-center bg-[#38bdf8] text-white rounded-lg"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>
    ))}

    <style jsx>{`
      .custom-input,
      .custom-select {
        width: 100%;
        height: 52px;
        padding: 0 1rem;
        background: #fff;
        border: 1.5px solid #e2e8f0;
        border-radius: 8px;
        font-size: 15px;
        color: #1e293b;
        outline: none;
        transition: border-color 0.2s;
      }
      .custom-input:focus,
      .custom-select:focus {
        border-color: #38bdf8;
      }
      .custom-select {
        appearance: none;
        cursor: pointer;
      }
    `}</style>
  </div>
);

export default SpecsEditor;
