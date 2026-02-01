"use client";

import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import apiService from "@/api/api";
import { ADMIN_PASSWORD_RESET_API, WEBSITE_INFO_API } from "@/api/apiEndPoint";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const AccountSettings = () => {
  const [formData, setFormData] = useState({
    old_password: "",
    password: "",
    confirm_password: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Website settings state
  const [website, setWebsite] = useState({
    email: "",
    phone: "",
    address: "",
    facebook_link: "",
    instagram_link: "",
    tiktok_link: "",
    whatsapp_link: "",
  });
  const [isUpdatingWebsite, setIsUpdatingWebsite] = useState(false);

  const queryClient = useQueryClient();

  // Tab state: 'password' | 'website'
  const [activeTab, setActiveTab] = useState("password");

  const togglePassword = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Fetch website settings
  const {
    data: websiteData,
    isLoading: isWebsiteLoading,
    isError: isWebsiteError,
  } = useQuery({
    queryKey: ["website-info"],
    queryFn: async () => {
      const res = await apiService.get(WEBSITE_INFO_API);
      return res.data?.data || null;
    },
    onError: (err) => {
      console.error("Failed to fetch website info:", err);
      toast.error("Failed to load website settings");
    },
  });

  useEffect(() => {
    if (websiteData) {
      setWebsite((prev) => ({ ...prev, ...websiteData }));
    }
  }, [websiteData]);

  const websiteMutation = useMutation({
    mutationFn: async (payload) => {
      return await apiService.put(WEBSITE_INFO_API, payload);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries(["website-info"]);
    },
    onError: (err) => {
      console.error("Failed to update website info:", err);
      toast.error(
        err?.response?.data?.message || "Failed to update website settings",
      );
      throw err;
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null); // clear error on input
  };

  const handleWebsiteChange = (e) => {
    const { name, value } = e.target;
    setWebsite((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic client-side validation
    if (!formData.old_password) {
      setError("Please enter your current password");
      return;
    }
    if (!formData.password) {
      setError("Please enter a new password");
      return;
    }
    if (formData.password.length < 3) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        old_password: formData.old_password,
        password: formData.password,
      };

      const response = await apiService.post(ADMIN_PASSWORD_RESET_API, payload);
      console.log(response);
      // Success
      await Swal.fire({
        title: "Success!",
        text: "Your password has been updated successfully.",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      // Reset form
      setFormData({
        old_password: "",
        password: "",
        confirm_password: "",
      });
    } catch (err) {
      console.error("Password reset failed:", err);

      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to update password. Please check your current password and try again.";

      setError(errorMessage);

      await Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebsiteSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!website.email) return toast.error("Email is required");
    if (!website.phone) return toast.error("Phone is required");

    setIsUpdatingWebsite(true);
    try {
      await websiteMutation.mutateAsync(website);
      await Swal.fire({
        title: "Success",
        text: "Website settings updated successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
    } finally {
      setIsUpdatingWebsite(false);
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-4 py-4">
        <button
          type="button"
          onClick={() => setActiveTab("password")}
          aria-pressed={activeTab === "password"}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === "password"
              ? "bg-[#38bdf8] text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Change Password
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("website")}
          aria-pressed={activeTab === "website"}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === "website"
              ? "bg-[#38bdf8] text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Website Settings
        </button>
      </div>

      {/* Panels */}
      {activeTab === "password" && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h1 className="text-xl font-semibold text-gray-800">
              Change Password
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Update your account password for better security.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-6 items-center *:flex-1">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 pb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.old ? "text" : "password"}
                    name="old_password"
                    value={formData.old_password}
                    onChange={handleInputChange}
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33B1E5]/30 focus:border-[#33B1E5]"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword("old")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPasswords.old ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 pb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33B1E5]/30 focus:border-[#33B1E5]"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword("new")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPasswords.new ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 pb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33B1E5]/30 focus:border-[#33B1E5]"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => togglePassword("confirm")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-10 py-3 rounded-lg font-medium text-white transition-all flex items-center gap-2 ${
                  isLoading
                    ? "bg-[#33B1E5]/70 cursor-not-allowed"
                    : "bg-[#33B1E5] hover:opacity-90 shadow-md"
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "website" && (
        <div className="bg-white  border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">
              Website Settings
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage contact and social links for the website.
            </p>
          </div>

          <form onSubmit={handleWebsiteSubmit} className="p-6 space-y-6">
            {isWebsiteLoading ? (
              <div className="flex items-center gap-3">
                <span className="animate-spin h-5 w-5 border-2 border-[#38bdf8] border-t-transparent rounded-full"></span>
                <span className="text-gray-500">
                  Loading website settings...
                </span>
              </div>
            ) : isWebsiteError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                Failed to load website settings.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={website.email}
                    onChange={handleWebsiteChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30 focus:border-[#38bdf8]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={website.phone}
                    onChange={handleWebsiteChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30 focus:border-[#38bdf8]"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Address
                  </label>
                  <textarea
                    name="address"
                    value={website.address}
                    onChange={handleWebsiteChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30 focus:border-[#38bdf8]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Facebook Link
                  </label>
                  <input
                    type="url"
                    name="facebook_link"
                    value={website.facebook_link}
                    onChange={handleWebsiteChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30 focus:border-[#38bdf8]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Instagram Link
                  </label>
                  <input
                    type="url"
                    name="instagram_link"
                    value={website.instagram_link}
                    onChange={handleWebsiteChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30 focus:border-[#38bdf8]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    TikTok Link
                  </label>
                  <input
                    type="url"
                    name="tiktok_link"
                    value={website.tiktok_link}
                    onChange={handleWebsiteChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30 focus:border-[#38bdf8]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    WhatsApp Link
                  </label>
                  <input
                    type="url"
                    name="whatsapp_link"
                    value={website.whatsapp_link}
                    onChange={handleWebsiteChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30 focus:border-[#38bdf8]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 pb-2">
                    Youtube Link
                  </label>
                  <input
                    type="url"
                    name="youtube_link"
                    value={website.youtube_link}
                    onChange={handleWebsiteChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#38bdf8]/30 focus:border-[#38bdf8]"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isUpdatingWebsite}
                    className={`px-6 py-3 rounded-lg font-medium text-white transition-all flex items-center gap-2 ${
                      isUpdatingWebsite
                        ? "bg-[#38bdf8]/70 cursor-not-allowed"
                        : "bg-[#38bdf8] hover:opacity-90"
                    }`}
                  >
                    {isUpdatingWebsite ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
