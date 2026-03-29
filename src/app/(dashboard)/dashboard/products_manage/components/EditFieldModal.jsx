import React, { useState } from "react";
import InputWrapper from "../add_product/components/InputWrapper";
import SpecsEditor from "../add_product/components/SpecsEditor";
import ImageUploader from "../add_product/components/ImageUploader";
import { Loader2 } from "lucide-react";

export default function EditFieldModal({ open, onClose, fieldKey, originalValue, onSave }) {
  const [local, setLocal] = useState(() => {
    if (Array.isArray(originalValue)) return originalValue;
    if (originalValue && typeof originalValue === "string") return [originalValue];
    return originalValue;
  });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (fieldKey === "main_image") {
      if (Array.isArray(originalValue)) setLocal(originalValue);
      else if (originalValue && typeof originalValue === "string") setLocal([originalValue]);
      else setLocal([]);
    } else {
      setLocal(originalValue);
    }
  }, [originalValue, fieldKey]);

  if (!open) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(local);
      onClose();
    } catch (e) {
      console.error("save field error", e);
    } finally {
      setLoading(false);
    }
  };

  // Render modal content based on fieldKey
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Edit {fieldKey}</h3>

        <div className="space-y-4">
          {(fieldKey === "name" || fieldKey === "short_description") && (
            <InputWrapper label={fieldKey}>
              <input
                value={local || ""}
                onChange={(e) => setLocal(e.target.value)}
                className="custom-input"
              />
            </InputWrapper>
          )}

          {fieldKey === "full_description" && (
            <InputWrapper label="Full Description">
              <textarea
                value={local || ""}
                onChange={(e) => setLocal(e.target.value)}
                rows={6}
                className="custom-input resize-none"
              />
            </InputWrapper>
          )}

          {fieldKey === "specifications" && (
            <SpecsEditor
              specs={local || []}
              onChangeSpec={(i, f, v) => {
                const copy = [...(local || [])];
                copy[i][f] = v;
                setLocal(copy);
              }}
              onRemoveSpec={(i) => setLocal((p) => p.filter((_, idx) => idx !== i))}
              onAddSpec={() => setLocal((p) => [...(p || []), { name: "", value: "" }])}
            />
          )}

          {fieldKey === "main_image" && (
            <ImageUploader
              images={Array.isArray(local) ? local : []}
              onFileChange={(e) => {
                const files = Array.from(e.target?.files || []);
                if (!files.length) return;
                setLocal((p) => [...(Array.isArray(p) ? p : []), ...files]);
              }}
              onRemoveImage={(i) => setLocal((p) => (Array.isArray(p) ? p.filter((_, idx) => idx !== i) : p))}
            />
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#32afe2] text-white rounded flex items-center gap-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
