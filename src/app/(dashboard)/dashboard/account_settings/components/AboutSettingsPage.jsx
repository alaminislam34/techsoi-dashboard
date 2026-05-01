"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import dynamic from "next/dynamic";
import "easymde/dist/easymde.min.css";
import toast from "react-hot-toast";
import { Save, Loader2 } from "lucide-react";

// Import SimpleMDE dynamically to avoid SSR issues with Next.js
const SimpleMDE = dynamic(() => import("react-simplemde-editor"), {
  ssr: false,
});

export default function AboutSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      content: "",
    },
  });

  /* ---------------- MEMOIZE OPTIONS TO FIX CURSOR JUMPING ---------------- */
  // By using useMemo, this object is only created once.
  // SimpleMDE won't re-initialize on every keystroke anymore.
  const mdeOptions = useMemo(() => {
    return {
      spellChecker: false,
      placeholder: "Start writing your story...",
      minHeight: "calc(100vh - 280px)",
      autofocus: true,
      toolbar: [
        "bold",
        "italic",
        {
          name: "heading",
          className: "fa fa-header",
          title: "Heading",
          children: ["heading-1", "heading-2", "heading-3"],
        },
        "|",
        "quote",
        "unordered-list",
        "ordered-list",
        "|",
        "link",
        "image",
        "table",
        "|",
        "preview",
        "side-by-side",
        "fullscreen",
        "|",
        "guide",
      ],
    };
  }, []);

  /* ---------------- FETCH EXISTING DATA ---------------- */
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/settings/about");
        if (res.ok) {
          const data = await res.json();
          setValue("content", data?.content || "");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Could not load existing content");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [setValue]);

  /* ---------------- SUBMIT ---------------- */
  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();
      toast.success("About page updated successfully!");
    } catch (err) {
      toast.error("Failed to update content");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            About Page Settings
          </h1>
          <p className="text-sm text-gray-500">
            Edit the content of your About Us page using Markdown
          </p>
        </div>

        <button
          onClick={handleSubmit(onSubmit)}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-md active:scale-95"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Editor Container */}
      <main className="flex-1 p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 h-full">
          <form className="h-full">
            <Controller
              name="content"
              control={control}
              render={({ field: { value, onChange } }) => (
                <SimpleMDE
                  value={value}
                  onChange={onChange}
                  options={mdeOptions}
                />
              )}
            />
          </form>
        </div>
      </main>

      {/* Custom Editor Styling */}
      <style jsx global>{`
        .CodeMirror {
          border-bottom-left-radius: 12px;
          border-bottom-right-radius: 12px;
          border: 1px solid #e5e7eb !important;
          font-family: inherit;
          font-size: 16px;
        }
        .editor-toolbar {
          border-top-left-radius: 12px;
          border-top-right-radius: 12px;
          border: 1px solid #e5e7eb !important;
          opacity: 1 !important;
          background: #f9fafb;
        }
      `}</style>
    </div>
  );
}
