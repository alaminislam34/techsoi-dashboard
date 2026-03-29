"use client";

import apiService from "@/api/api";
import { BLOG_SINGLE_API } from "@/api/apiEndPoint";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2 } from "lucide-react";

const BlogDetails = () => {
  const params = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const id = params.id;
  const router = useRouter();

  useEffect(() => {
    const fetchBlog = async (id) => {
      setLoading(true);
      try {
        const res = await apiService.get(BLOG_SINGLE_API(id));
        if (res?.status === 200 || res?.data?.status === true) {
          setBlog(res.data.data);
        } else {
          console.error("Blog fetching failed", res?.data || res);
        }
      } catch (error) {
        console.error("Fetch blog error", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBlog(id);
  }, [id]);

  const formatDate = (d) => {
    if (!d) return "-";
    try {
      const parsed = new Date(d);
      if (isNaN(parsed)) return d;
      return parsed.toLocaleString();
    } catch (e) {
      return d;
    }
  };

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [editState, setEditState] = useState({
    title: "",
    title_bn: "",
    short_description: "",
    full_description: "",
    status: 1,
    imageFile: null,
    imagePreview: null,
  });
  const editFileRef = useRef(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (blog) {
      setEditState((s) => ({
        ...s,
        title: blog.title || "",
        title_bn: blog.title_bn || "",
        short_description: blog.short_description || "",
        full_description: blog.full_description || "",
        status: blog.status ?? 1,
        imageFile: null,
        imagePreview: blog.image || null,
      }));
    }
  }, [blog]);

  const handleUpdateBlog = async () => {
    setEditLoading(true);

    if (!editState.title || !String(editState.title).trim()) {
      toast.error("Title is required");
      return setEditLoading(false);
    }

    try {
      let res;

      if (editState.imageFile) {
        const f = editState.imageFile;
        const allowedMimes = [
          "image/jpeg",
          "image/png",
          "image/jpg",
          "image/gif",
          "image/svg+xml",
        ];
        const allowedExts = ["jpeg", "png", "jpg", "gif", "svg"];
        const fileExt = (f.name || "").split(".").pop()?.toLowerCase();
        if (!(allowedMimes.includes(f.type) || allowedExts.includes(fileExt))) {
          toast.error("Invalid image type. Allowed: jpeg, png, jpg, gif, svg.");
          setEditLoading(false);
          return;
        }
        if (f.size > 5 * 1024 * 1024) {
          toast.error("Image is too large. Max allowed size is 5MB.");
          setEditLoading(false);
          return;
        }
      }
      if (editState.imageFile instanceof File) {
        const form = new FormData();

        form.append("_method", "PUT");
        form.append("title", editState.title);
        form.append("title_bn", editState.title_bn);
        form.append("short_description", editState.short_description);
        form.append("full_description", editState.full_description || "");
        form.append("status", String(editState.status));
        form.append("image", editState.imageFile, editState.imageFile.name);

        res = await apiService.post(BLOG_SINGLE_API(id), form);
      } else {
        const payload = {
          title: editState.title,
          title_bn: editState.title_bn,
          short_description: editState.short_description,
          full_description: editState.full_description || "",
          status: editState.status,
        };

        if (
          typeof editState.imagePreview === "string" &&
          editState.imagePreview
        ) {
          payload.image = editState.imagePreview;
        }

        res = await apiService.put(BLOG_SINGLE_API(id), payload, {
          headers: { "Content-Type": "application/json" },
        });
      }

      if (res?.data?.status) {
        toast.success("Blog updated");
        setBlog(res.data.data);
        setIsEditOpen(false);

        if (
          editState.imageFile &&
          editState.imagePreview &&
          editState.imagePreview.startsWith("blob:")
        ) {
          try {
            URL.revokeObjectURL(editState.imagePreview);
          } catch (e) {}
        }
      } else {
        toast.error(res?.data?.message || "Update failed");
      }
    } catch (e) {
      console.error("Update blog error", e);

      const errMsg =
        e?.data?.message ||
        e?.message ||
        e?.response?.data?.message ||
        e?.response?.data?.errors?.image?.[0] ||
        "Update failed";

      if (e?.data?.errors) {
        const firstKey = Object.keys(e.data.errors)[0];
        const firstMsg = e.data.errors[firstKey] && e.data.errors[firstKey][0];
        if (firstMsg) toast.error(firstMsg);
        else toast.error(errMsg);
      } else {
        toast.error(errMsg);
      }

      if (e?.status && e.status >= 500) {
        console.error("Server error details:", e);
      }
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div>
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#0f172a]">Blog Details</h2>
          <p className="text-sm text-[#64748b] mt-1">
            Preview and manage the selected blog
          </p>
        </div>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : blog ? (
          <div className="md:flex">
            <div className="md:w-1/3 bg-gray-50 p-6 flex items-center justify-center">
              <img
                src={blog.image || "https://placehold.co/400x400?text=No+Image"}
                alt={blog.title}
                className="w-full h-64 object-cover rounded-md"
              />
            </div>
            <div className="md:w-2/3 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-[#0f172a]">
                    {blog.title_bn}
                  </h3>
                  <p className="text-sm text-[#64748b] mt-2">
                    {blog.short_description}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${blog.status === 1 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                  >
                    {blog.status === 1 ? "Published" : "Draft"}
                  </span>
                  <div className="text-xs text-[#94a3b8] mt-3">
                    Created: {formatDate(blog.created_at)}
                  </div>
                  <div className="text-xs text-[#94a3b8]">
                    Updated: {formatDate(blog.updated_at)}
                  </div>
                </div>
              </div>

              <hr className="my-4" />

              <div className="prose max-w-none text-[#1e293b]">
                {blog.full_description ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: blog.full_description }}
                  />
                ) : (
                  <p className="text-sm text-[#475569]">
                    No full description provided.
                  </p>
                )}
              </div>

              {/* Edit Modal */}
              {isEditOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                    <button
                      onClick={() => setIsEditOpen(false)}
                      className="absolute right-6 top-6 p-1 rounded-full border border-primary/30 text-primary hover:bg-secondary/50 transition-all"
                    >
                      ✕
                    </button>

                    <h3 className="text-xl font-bold mb-4">Edit Blog</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 inline-block">
                          Title
                        </label>
                        <input
                          value={editState.title}
                          onChange={(e) =>
                            setEditState({
                              ...editState,
                              title: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-white border border-[#e2e8f0] text-gray-600 focus:outline-primary rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 inline-block">
                          Title (Bengali)
                        </label>
                        <input
                          value={editState.title_bn}
                          onChange={(e) =>
                            setEditState({
                              ...editState,
                              title_bn: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-white border border-[#e2e8f0] text-gray-600 focus:outline-primary rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 inline-block">
                          Short Description
                        </label>
                        <input
                          value={editState.short_description}
                          onChange={(e) =>
                            setEditState({
                              ...editState,
                              short_description: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-white border border-[#e2e8f0] text-gray-600 focus:outline-primary rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 inline-block">
                          Full Description (HTML)
                        </label>
                        <textarea
                          rows={6}
                          value={editState.full_description || ""}
                          onChange={(e) =>
                            setEditState({
                              ...editState,
                              full_description: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-white border border-[#e2e8f0] text-gray-600 focus:outline-primary rounded-xl resize-none"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 inline-block">
                          Image
                        </label>
                        <div className="flex items-start justify-between gap-3 mt-2">
                          <div className="overflow-hidden space-y-2">
                            <img
                              src={
                                editState.imagePreview ||
                                "https://placehold.co/200x200?text=No+Image"
                              }
                              alt="preview"
                              className="w-full h-full max-w-30 aspect-4/3 object-cover"
                            />{" "}
                            <div>
                              <input
                                ref={editFileRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (!f) return;

                                  // Client-side validation: MIME, extension, size (max 5MB)
                                  const allowedMimes = [
                                    "image/jpeg",
                                    "image/png",
                                    "image/jpg",
                                    "image/gif",
                                    "image/svg+xml",
                                  ];

                                  const maxSize = 5 * 1024 * 1024; // 5MB

                                  const fileExt = (f.name || "")
                                    .split(".")
                                    .pop()
                                    ?.toLowerCase();
                                  const allowedExts = [
                                    "jpeg",
                                    "png",
                                    "jpg",
                                    "gif",
                                    "svg",
                                  ];

                                  if (
                                    !(
                                      allowedMimes.includes(f.type) ||
                                      allowedExts.includes(fileExt)
                                    )
                                  ) {
                                    toast.error(
                                      "Only JPEG, PNG, JPG, GIF or SVG images are allowed.",
                                    );
                                    return;
                                  }

                                  if (f.size > maxSize) {
                                    toast.error(
                                      "Image is too large. Max size is 5MB.",
                                    );
                                    return;
                                  }

                                  // Helpful debug log for server-side validation issues
                                  console.debug("Uploading image:", {
                                    name: f.name,
                                    type: f.type,
                                    size: f.size,
                                  });

                                  setEditState({
                                    ...editState,
                                    imageFile: f,
                                    imagePreview: URL.createObjectURL(f),
                                  });
                                }}
                              />
                              <button
                                onClick={() => editFileRef.current?.click()}
                                className="px-4 py-2 bg-[#38bdf8] text-white rounded-lg"
                              >
                                Change
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="text-sm">Status:</label>
                            <div className="border border-primary px-4 py-2 rounded">
                              <select
                                className="px-2 text-primary outline-none"
                                value={editState.status}
                                onChange={(e) =>
                                  setEditState({
                                    ...editState,
                                    status: Number(e.target.value),
                                  })
                                }
                              >
                                <option value={1}>Published</option>
                                <option value={0}>Draft</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 mt-4">
                        <button
                          onClick={() => setIsEditOpen(false)}
                          className="px-4 py-2 bg-white border border-primary text-primary rounded"
                        >
                          Cancel
                        </button>
                        <button
                          disabled={editLoading}
                          onClick={handleUpdateBlog}
                          className="px-4 py-2 bg-primary text-white rounded flex items-center gap-2"
                        >
                          {editLoading ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : null}
                          Save changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Delete Modal */}
              {isDeleteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                  <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                    <h3 className="text-xl font-bold">Delete Blog</h3>
                    <p className="text-sm text-[#475569] mt-3">
                      Are you sure you want to delete this blog? This action
                      cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        onClick={() => setIsDeleteOpen(false)}
                        className="px-4 py-2 bg-white border rounded"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={deleteLoading}
                        onClick={async () => {
                          setDeleteLoading(true);
                          try {
                            const res = await apiService.delete(
                              BLOG_SINGLE_API(id),
                            );
                            if (res?.data?.status) {
                              toast.success("Blog deleted");
                              window.location.href = "/dashboard/blog_manage";
                            } else {
                              toast.error("Delete failed");
                            }
                          } catch (e) {
                            console.error("Delete error", e);
                            toast.error(
                              e?.response?.data?.message || "Delete failed",
                            );
                          } finally {
                            setDeleteLoading(false);
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded flex items-center gap-2"
                      >
                        {deleteLoading ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : null}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-6 flex gap-3">
                <a
                  href={`/dashboard/blog_manage`}
                  className="inline-block px-4 py-2 bg-[#38bdf8] text-white rounded-lg"
                >
                  Back to Blogs
                </a>

                <button
                  onClick={() => setIsEditOpen(true)}
                  className="inline-block px-4 py-2 bg-white border border-[#e2e8f0] text-[#0f172a] rounded-lg"
                >
                  Edit
                </button>

                <button
                  onClick={() => setIsDeleteOpen(true)}
                  className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">Blog not found.</div>
        )}
      </div>
    </div>
  );
};

export default BlogDetails;
