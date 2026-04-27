"use client";

import { useState } from "react";
import {
  ChevronDown,
  Pencil,
  Trash2,
  Check,
  X,
  Plus,
  Loader2,
} from "lucide-react";
import { useFAQ } from "@/api/hooks/useFAQ";
import { toast, Toaster } from "react-hot-toast"; // Suggested for professional toasts

export default function FaqPage() {
  const {
    getFAQs: faqsData,
    isLoading,
    isError,
    createFAQ,
    updateFAQ,
    deleteFAQ,
  } = useFAQ();

  // State Management
  const [activeIndex, setActiveIndex] = useState<number | null>(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ question: "", answer: "" });
  const [showAddForm, setShowAddForm] = useState(false);

  // Delete Modal State
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Handlers ---

  const handleEditInit = (e: React.MouseEvent, faq: any) => {
    e.stopPropagation();
    setEditingId(String(faq.id));
    setEditForm({ question: faq.question, answer: faq.answer });
  };

  const handleUpdate = async (id: number) => {
    try {
      setIsSubmitting(true);
      await updateFAQ({ id, payload: editForm });
      setEditingId(null);
      toast.success("FAQ updated successfully!");
    } catch (err) {
      toast.error("Failed to update FAQ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeleting) return;
    try {
      setIsSubmitting(true);
      await deleteFAQ(isDeleting);
      toast.success("FAQ removed.");
      setIsDeleting(null);
    } catch (err) {
      toast.error("Error deleting FAQ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    try {
      setIsSubmitting(true);
      await createFAQ(editForm);
      setEditForm({ question: "", answer: "" });
      setShowAddForm(false);
      toast.success("New FAQ published!");
    } catch (err) {
      toast.error("Failed to create FAQ.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className=" p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-end gap-4 mb-8">
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditForm({ question: "", answer: "" });
          }}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm ${
            showAddForm
              ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
              : "bg-primary text-white hover:bg-sky-500 hover:shadow-md"
          }`}
        >
          {showAddForm ? <X size={20} /> : <Plus size={20} />}
          {showAddForm ? "Discard" : "Create FAQ"}
        </button>
      </div>

      {/* Create FAQ Block */}
      {showAddForm && (
        <div className="mb-8 p-6 bg-white border border-sky-100 rounded-2xl shadow-xl shadow-sky-900/5 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-4">
            New Entry
          </h3>
          <div className="space-y-4">
            <input
              className="w-full p-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-sky-500 transition-all outline-none"
              placeholder="What is the question?"
              value={editForm.question}
              onChange={(e) =>
                setEditForm({ ...editForm, question: e.target.value })
              }
            />
            <textarea
              className="w-full p-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-sky-500 transition-all outline-none min-h-32"
              placeholder="Provide a detailed answer..."
              value={editForm.answer}
              onChange={(e) =>
                setEditForm({ ...editForm, answer: e.target.value })
              }
            />
            <button
              onClick={handleCreate}
              disabled={isSubmitting || !editForm.question || !editForm.answer}
              className="w-full py-3.5 bg-primary text-white rounded-xl font-bold hover:bg-sky-500 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader2 className="animate-spin" size={18} />}
              Publish FAQ
            </button>
          </div>
        </div>
      )}

      {/* FAQ List */}
      <div className="space-y-3">
        {isLoading && <FaqSkeleton />}

        {!isLoading &&
          !isError &&
          faqsData?.map((faq, index) => {
            const isActive = activeIndex === index;
            const isEditing = editingId === String(faq.id);

            return (
              <div
                key={faq.id}
                className={`group border rounded-2xl transition-all duration-300 ${
                  isActive || isEditing
                    ? "bg-white border-sky-200 shadow-lg"
                    : "bg-white border-gray-100 hover:border-gray-300 shadow-sm"
                }`}
              >
                <div
                  onClick={() =>
                    !isEditing && setActiveIndex(isActive ? null : index)
                  }
                  className={`w-full flex items-center justify-between px-6 py-5 cursor-pointer ${isEditing ? "cursor-default" : ""}`}
                >
                  <div className="flex-1 mr-4">
                    {isEditing ? (
                      <input
                        autoFocus
                        className="w-full p-2 border-b-2 border-sky-400 outline-none text-gray-900 font-medium"
                        value={editForm.question}
                        onChange={(e) =>
                          setEditForm({ ...editForm, question: e.target.value })
                        }
                      />
                    ) : (
                      <span
                        className={`font-semibold text-lg transition-colors ${isActive ? "text-sky-500" : "text-gray-800"}`}
                      >
                        {faq.question}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleUpdate(faq.id)}
                          className="p-2 text-primary hover:bg-sky-50 rounded-lg"
                        >
                          {isSubmitting ? (
                            <Loader2 className="animate-spin" size={20} />
                          ) : (
                            <Check size={20} />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg"
                        >
                          <X size={20} />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1 mr-2 animate-in fade-in zoom-in duration-200">
                          <button
                            onClick={(e) => handleEditInit(e, faq)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-sky-50 rounded-lg transition-colors"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsDeleting(faq.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        <ChevronDown
                          className={`transition-transform duration-500 ${isActive ? "rotate-180 text-sky-500" : "text-gray-300"}`}
                          size={20}
                        />
                      </>
                    )}
                  </div>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${isActive || isEditing ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div className="px-6 pb-6 text-gray-600 border-t border-gray-50 pt-4">
                    {isEditing ? (
                      <textarea
                        className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 min-h-32 text-gray-700"
                        value={editForm.answer}
                        onChange={(e) =>
                          setEditForm({ ...editForm, answer: e.target.value })
                        }
                      />
                    ) : (
                      <p className="leading-relaxed">{faq.answer}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleting !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Delete FAQ?</h3>
            <p className="text-gray-500 mt-2">
              This action cannot be undone. This will permanently remove the
              question from the database.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                disabled={isSubmitting}
                onClick={() => setIsDeleting(null)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FaqSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="h-20 bg-gray-100 rounded-2xl w-full" />
    ))}
  </div>
);
