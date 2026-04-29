"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import Cookies from "js-cookie";

const AppContext = createContext(undefined);

export const StateProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const adminToken = Cookies.get("admin_token");
    if (adminToken) {
      setToken(adminToken);
      setIsAuthenticated(true);
    }
  }, []);

  const value = useMemo(
    () => ({
      isSidebarOpen,
      setIsSidebarOpen,
      token,
      setToken,
      isAuthenticated,
      setIsAuthenticated,
    }),
    [isSidebarOpen, token, isAuthenticated],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useGlobalState = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useGlobalState must be used within a StateProvider");
  }
  return context;
};
