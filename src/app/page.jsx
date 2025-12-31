"use client";

import React from "react";

const WelcomeSimple = () => {
  return (
    <div className="flex items-center justify-center h-screen text-center">
      <div className="py-6">
        <h1 className="text-3xl font-bold text-dark">
          Welcome to <span className="text-[#33B1E5]">Admin Dashboard</span>
        </h1>
        <p className="text-gray-500 mt-2">
          Manage your store, blogs, and settings all in one place.
        </p>
      </div>
    </div>
  );
};

export default WelcomeSimple;
