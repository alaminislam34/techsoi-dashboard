"use client";

import React, { useState } from "react";
import { Pencil, Eye, EyeOff, Trash2, Eye as ViewIcon } from "lucide-react";
import ForgotPasswordFlow from "./components/Modals";
import SocialLinkModal from "./components/SocialLinkModal";

const AccountSettings = () => {
  const [activeTab, setActiveTab] = useState("password");
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const togglePassword = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
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
            <button className="px-12 py-3.5 bg-[#33B1E5] text-white rounded-lg font-medium shadow-lg hover:opacity-90 transition-all">
              Change Password
            </button>
          </div>
        </div>
      )}

      {/* --- Social Links Tab --- */}
      {activeTab === "social" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex justify-end">
            <button
              onClick={() => setIsSocialModalOpen(true)}
              className="px-6 py-2 rounded-xl border border-[#33B1E5] text-[#33B1E5] font-medium hover:bg-[#33B1E5] hover:text-white transition-all"
            >
              Add New Social Link
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6">
            {[
              { name: "Facebook", visible: true },
              { name: "Instagram", visible: true },
              { name: "Tiktok", visible: false },
              { name: "Youtube", visible: false },
            ].map((social, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {social.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="text-[#33B1E5]">
                      {social.visible ? (
                        <ViewIcon size={16} />
                      ) : (
                        <EyeOff size={16} />
                      )}
                    </button>
                    <button className="text-gray-500">
                      <Pencil size={16} />
                    </button>
                    <button className="text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Enter URL"
                  className="w-full px-4 py-2 border border-[#33B1E5]/30 rounded-lg focus:outline-none focus:border-[#33B1E5]"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-end pt-4">
            <button className="px-12 py-3 bg-[#33B1E5] text-white rounded-lg font-medium shadow-md">
              Save Changes
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
    </div>
  );
};

export default AccountSettings;
