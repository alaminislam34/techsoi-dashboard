"use client";

import React, { createContext, useContext, useState, useMemo } from "react";

// 1. Create the Context
const AppContext = createContext(undefined);

// 2. Create the Provider Component
export const StateProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const value = {
    isSidebarOpen,
    setIsSidebarOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// 3. Create a Custom Hook for easy consumption
export const useGlobalState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a StateProvider");
  }
  return context;
};
