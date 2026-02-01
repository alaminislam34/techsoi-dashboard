"use client";

import React from "react";
import { Plus, X } from "lucide-react";

type Spec = { name: string; value: string };

type Props = {
  className?: string;
  specs?: Spec[];
  onChangeSpec: (index: number, field: keyof Spec, value: string) => void;
  onRemoveSpec: (index: number) => void;
  onAddSpec: () => void;
};

export default function SpecsEditor({
  className,
  specs = [],
  onChangeSpec,
  onRemoveSpec,
  onAddSpec,
}: Props) {
  return (
    <div className={`space-y-4 ${className || ""}`}>
      <label className="text-[15px] font-medium text-[#64748b]">Specifications</label>
      {specs.map((spec, idx) => (
        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="w-full md:col-span-1">
            <label className="sr-only">Spec name</label>
            <input
              type="text"
              value={spec.name}
              onChange={(e) => onChangeSpec(idx, "name", e.target.value)}
              placeholder="Spec Name"
              className="custom-input w-full"
            />
          </div>
          <div className="w-full md:col-span-1">
            <label className="sr-only">Spec value</label>
            <input
              type="text"
              value={spec.value}
              onChange={(e) => onChangeSpec(idx, "value", e.target.value)}
              placeholder="Value"
              className="custom-input w-full"
            />
          </div>

          <div className="md:col-span-1 flex items-start md:items-end justify-start md:justify-end">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onRemoveSpec(idx)}
                aria-label={"Remove specification"}
                className="h-13 w-13 flex items-center justify-center bg-[#ff0000] text-white rounded-lg"
              >
                <X size={20} />
              </button>
              {idx === specs.length - 1 && (
                <button
                  type="button"
                  onClick={onAddSpec}
                  aria-label={"Add specification"}
                  className="h-13 w-13 flex items-center justify-center bg-[#38bdf8] text-white rounded-lg"
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
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
}
