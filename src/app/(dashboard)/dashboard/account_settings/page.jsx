"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Swal from "sweetalert2";
import apiService from "@/api/api";
import { ADMIN_PASSWORD_RESET_API } from "@/api/apiEndPoint";

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

  const togglePassword = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null); // clear error on input
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

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 p-4 md:p-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
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

          <div className="space-y-6">
            {/* Current Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.old ? "text" : "password"}
                  name="old_password"
                  value={formData.old_password}
                  onChange={handleInputChange}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33B1E5]/30 focus:border-[#33B1E5]"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePassword("old")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33B1E5]/30 focus:border-[#33B1E5]"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePassword("new")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#33B1E5]/30 focus:border-[#33B1E5]"
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
    </div>
  );
};

export default AccountSettings;
