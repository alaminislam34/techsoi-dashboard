import React from "react";
import { Pencil } from "lucide-react";

export default function ReadOnlyField({ label, value, onEditClick, changed }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-gray-100">
      <div className="flex-1">
        <div className="text-sm text-gray-500">{label}</div>
        <div className="mt-1 text-gray-800">{value ?? "-"}</div>
      </div>
      <div className="w-12 flex justify-end">
        {changed ? (
          <button
            onClick={onEditClick}
            className="p-2 bg-white border rounded hover:bg-gray-50"
            aria-label={`Edit ${label}`}
            title="Edit"
          >
            <Pencil size={16} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
