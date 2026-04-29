import React from "react";
import { Plus, X } from "lucide-react";

const SpecsEditorManage = ({ specifications, setSpecifications }) => {
  const handleChangeSpec = (idx, field, value) => {
    setSpecifications((prev) =>
      prev.map((spec, i) =>
        i === idx ? { ...spec, [field]: value } : spec,
      ),
    );
  };

  const handleRemoveSpec = (idx) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddSpec = () => {
    setSpecifications((prev) => [...prev, { key: "", value: "" }]);
  };

  return (
    <div className="space-y-4">
      <label className="text-[15px] font-medium text-[#64748b]">
        Specifications
      </label>
      {specifications?.map((spec, idx) => (
        <div key={idx} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <input
              type="text"
              value={spec.key || ""}
              onChange={(e) => handleChangeSpec(idx, "key", e.target.value)}
              placeholder="Spec Name"
              className="custom-input"
            />
          </div>
          <div className="flex-1 w-full">
            <input
              type="text"
              value={spec.value || ""}
              onChange={(e) => handleChangeSpec(idx, "value", e.target.value)}
              placeholder="Value"
              className="custom-input"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleRemoveSpec(idx)}
              className="h-13 w-13 flex items-center justify-center bg-[#ff0000] text-white rounded-lg"
            >
              <X size={20} />
            </button>
            {idx === specifications.length - 1 && (
              <button
                type="button"
                onClick={handleAddSpec}
                className="h-13 w-13 flex items-center justify-center bg-[#32afe2] text-white rounded-lg"
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
          border-color: #32afe2;
        }
        .custom-select {
          appearance: none;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default SpecsEditorManage;
