"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import apiService from "@/api/api";
import { ADMIN_LOGIN_API } from "@/api/apiEndPoint";
import Cookies from "js-cookie";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      return toast.error("Please enter both email and password");
    }

    setIsLoading(true);

    try {
      const res = await apiService.post(ADMIN_LOGIN_API, { email, password });

      const { status, token, message } = res.data;

      console.log("Response Status:", status);
      console.log("Token received:", !!token);

      if (status === true && token) {
        Cookies.set("admin_token", token, {
          expires: 7,
          path: "/",
          secure: window.location.protocol === "https:",
          sameSite: "lax",
        });

        localStorage.setItem("user", JSON.stringify({ email }));

        toast.success(message || "Welcome back!");

        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 100);
      } else {
        toast.error(message || "Login failed!");
      }
    } catch (error) {
      console.error("Login Error Details:", error);
      const errorMsg = error.message || "Something went wrong";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Admin Login</h1>
          <p className="text-gray-500 mt-2">
            Enter your credentials to manage the portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="admin@techsoibd.com"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              disabled={isLoading}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white transition-colors
              ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <Toaster />
      </div>
    </div>
  );
};

export default LoginPage;
