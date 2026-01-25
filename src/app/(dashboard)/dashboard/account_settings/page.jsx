"use client";

import React, { useState } from "react";
import { Pencil, Eye, EyeOff, Trash2, Eye as ViewIcon } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import apiService from "@/api/api";
import { ADMIN_PASSWORD_RESET_API } from "@/api/apiEndPoint";
import ForgotPasswordFlow from "./components/Modals";
import SocialLinkModal from "./components/SocialLinkModal";

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState("password");
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
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

  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      toast.error("New password and confirm password must match");
      return;
    }

    setIsPasswordSaving(true);
    try {
      await apiService.post(ADMIN_PASSWORD_RESET_API, {
        old_password: passwordForm.current,
        password: passwordForm.new,
      });

      setPasswordForm({ current: "", new: "", confirm: "" });
      setShowPasswords({ current: false, new: false, confirm: false });
    } catch (error) {
      const msg =
        error?.message || error?.data?.message || "Unable to update password";
      toast.error(msg);
    } finally {
      setIsPasswordSaving(false);
    }
  };

  return (
    <div className="w-full space-y-8 p-4">
      {/* --- Tab Navigation --- */}
      <div className="flex flex-wrap gap-4">
        {["password", "social", "contact"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-37.5 py-4 rounded-xl text-center font-medium transition-all border ${
              activeTab === tab
                ? "bg-[#33B1E5] text-white border-[#33B1E5] shadow-md"
                : "bg-white text-gray-400 border-gray-100 hover:bg-gray-50"
            }`}
          >
            {tab === "password"
              ? "Change Password"
              : tab === "social"
                ? "Social Links"
                : "Contact Information"}
          </button>
        ))}
      </div>

      {/* --- Password Tab --- */}
      {activeTab === "password" && (
        <div className="space-y-10 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["Current", "New", "Confirm"].map((label) => (
              <div key={label} className="space-y-3">
                <label className="text-sm font-medium text-dark/80">
                  {label} Password
                </label>
                <div className="relative group">
                  <input
                    type={
                      showPasswords[label.toLowerCase()] ? "text" : "password"
                    }
                    placeholder="Enter password"
                    value={passwordForm[label.toLowerCase()]}
                    onChange={(e) =>
                      handlePasswordChange(label.toLowerCase(), e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white border border-[#33B1E5]/30 rounded-lg focus:outline-none focus:border-[#33B1E5] text-dark"
                  />
                  <button
                    onClick={() => togglePassword(label.toLowerCase())}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPasswords[label.toLowerCase()] ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
            <button
              onClick={() => setIsForgotModalOpen(true)}
              className="px-10 py-3 rounded-lg border-2 border-red-500 text-red-500 font-medium hover:bg-red-500 hover:text-white transition-all"
            >
              Forget Password ?
            </button>
            <button
              onClick={handleChangePassword}
              disabled={isPasswordSaving}
              className={`px-12 py-3.5 rounded-lg font-medium shadow-lg transition-all text-white ${
                isPasswordSaving
                  ? "bg-[#33B1E5]/70 cursor-not-allowed"
                  : "bg-[#33B1E5] hover:opacity-90"
              }`}
            >
              {isPasswordSaving ? "Updating..." : "Change Password"}
            </button>
          </div>
        </div>
      )}

      {/* --- Contact Information Tab --- */}
      {activeTab === "contact" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Short Brief
            </label>
            <input
              type="text"
              placeholder="Enter URL"
              className="w-full px-4 py-3 border border-[#33B1E5]/30 rounded-lg focus:outline-none focus:border-[#33B1E5]"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Whatsapp/Phone Number
              </label>
              <input
                type="text"
                placeholder="Enter Number"
                className="w-full px-4 py-3 border border-[#33B1E5]/30 rounded-lg focus:outline-none focus:border-[#33B1E5]"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                placeholder="Enter Email"
                className="w-full px-4 py-3 border border-[#33B1E5]/30 rounded-lg focus:outline-none focus:border-[#33B1E5]"
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Shop Location
              </label>
              <input
                type="text"
                placeholder="Enter Location"
                className="w-full px-4 py-3 border border-[#33B1E5]/30 rounded-lg focus:outline-none focus:border-[#33B1E5]"
              />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button className="px-12 py-3 bg-[#33B1E5] text-white rounded-lg font-medium shadow-md">
              Save Changes
            </button>
          </div>
        </div>
      )}

      <ForgotPasswordFlow
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
      <SocialLinkModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
      />
      <Toaster position="top-right" />
    </div>
  );
};

export default AccountSettings;
