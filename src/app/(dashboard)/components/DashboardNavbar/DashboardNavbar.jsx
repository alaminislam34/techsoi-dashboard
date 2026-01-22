"use client";

import { useGlobalState } from "@/app/providers/StateProvider";
import { Bell, Menu, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HiOutlineLogout } from "react-icons/hi";
import React, { useEffect, useRef, useState, Suspense } from "react"; // Added Suspense
import apiService from "@/api/api";
import { PRODUCT_SEARCH_API } from "@/api/apiEndPoint";

const sidelinks = [
  {
    name: "Order Management",
    href: "/dashboard",
    match: (pathname) =>
      pathname === "/dashboard" || /^\/dashboard\/\d+$/.test(pathname),
  },
  {
    name: "Category Management",
    href: "/dashboard/category_manage",
    match: (pathname) => pathname.startsWith("/dashboard/category_manage"),
  },
  {
    name: "Products Management",
    href: "/dashboard/products_manage",
    match: (pathname) => pathname.startsWith("/dashboard/products_manage"),
  },
  {
    name: "Poster Banner",
    href: "/dashboard/banner_manage",
    match: (pathname) => pathname.startsWith("/dashboard/banner_manage"),
  },
  {
    name: "Add brands",
    href: "/dashboard/add_brands",
    match: (pathname) => pathname.startsWith("/dashboard/add_brands"),
  },
  {
    name: "Review Management",
    href: "/dashboard/review_manage",
    match: (pathname) => pathname.startsWith("/dashboard/review_manage"),
  },
  {
    name: "Blog Management",
    href: "/dashboard/blog_manage",
    match: (pathname) => pathname.startsWith("/dashboard/blog_manage"),
  },
  {
    name: "Account Settings",
    href: "/dashboard/account_settings",
    match: (pathname) => pathname.startsWith("/dashboard/account_settings"),
  },
];

// Inner component to handle the search logic and params
const NavbarContent = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useGlobalState();
  const pathname = usePathname();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef(null);
  const searchParams = useSearchParams();
  const activeQ = searchParams?.get("q") || "";

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const term = searchTerm?.trim();
    if (!term) {
      setSuggestions([]);
      setIsSearching(false);
      if (activeQ) router.replace("/dashboard/products_manage");
      return;
    }

    setIsSearching(true);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await apiService.get(PRODUCT_SEARCH_API(term));
        const list = res.data?.data || [];
        setSuggestions(list);

        router.replace(
          `/dashboard/products_manage?query=${encodeURIComponent(term)}`,
        );
      } catch (err) {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchTerm]);

  return (
    <div
      className={`flex p-2 md:p-3 lg:p-4 rounded-xl bg-secondary items-center justify-between gap-3 relative z-30`}
    >
      <div className="lg:hidden shrink-0">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 border border-primary/50 rounded-xl text-primary hover:bg-primary hover:text-white duration-300 cursor-pointer"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          {/* ---------- SEARCH ---------- */}
          <div className="hidden px-2 md:flex justify-between items-center md:w-xs lg:w-2xl relative mx-4 sm:mx-0 lg:mx-3 md:mx-4 py-2 rounded-xl bg-white border border-[#bee5f6]">
            <div className="relative flex-1">
              <input
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (searchTerm.trim()) {
                      router.push(
                        `/dashboard/products_manage?q=${encodeURIComponent(searchTerm.trim())}`,
                      );
                      setShowSuggestions(false);
                    }
                  }
                }}
                className="lg:text-lg w-full focus:outline-none"
                placeholder="Search products.."
              />

              {showSuggestions && (suggestions.length > 0 || isSearching) && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-[#e6f6fd] rounded-lg shadow-lg z-50 max-h-60 overflow-auto max-w-xl">
                  {isSearching ? (
                    <div className="p-3 text-sm text-gray-500">
                      Searching...
                    </div>
                  ) : (
                    suggestions.map((s) => (
                      <div
                        key={s.id}
                        onMouseDown={() => {
                          router.push(`/dashboard/products_manage/${s.id}`);
                          setShowSuggestions(false);
                        }}
                        className="p-3 hover:bg-[#f5fbff] cursor-pointer flex items-center gap-3"
                      >
                        <img
                          src={s.main_image || "/images/monitor.jpg"}
                          alt={s.name}
                          className="w-10 h-10 object-contain"
                          onError={(e) =>
                            (e.currentTarget.src = "/images/monitor.jpg")
                          }
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-800 truncate">
                            {s.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ৳{s.sale_price?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            {(searchTerm.trim() || activeQ) && (
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  router.push("/dashboard/products_manage");
                  setSearchTerm("");
                  setSuggestions([]);
                  setShowSuggestions(false);
                }}
                className="flex items-center relative gap-2.5 px-3 border-l border-[#9ed9f2] cursor-pointer"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}

            <button
              onClick={() => {
                if (searchTerm.trim()) {
                  router.push(
                    `/dashboard/products_manage?q=${encodeURIComponent(searchTerm.trim())}`,
                  );
                  setShowSuggestions(false);
                } else {
                  router.push("/dashboard/products_manage");
                }
              }}
              className="flex items-center relative gap-2.5 pl-3 border-l border-[#9ed9f2] cursor-pointer"
            >
              <svg
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.5 17.5L22 22"
                  stroke="#303030"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 11C20 6.02944 15.9706 2 11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 20C15.9706 20 20 15.9706 20 11Z"
                  stroke="#303030"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 xl:gap-4 shrink-0">
        <button className="p-2 hover:bg-primary hover:text-white duration-300 rounded-xl text-primary bg-white cursor-pointer border border-primary/80 relative transition-all">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary_red rounded-full border border-white"></span>
        </button>
      </div>

      <div
        className={`fixed inset-0 z-100 transition-all duration-300 ${
          isSidebarOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />

        <div
          className={`absolute top-0 left-0 w-80 h-full bg-secondary border-r border-gray-300 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute p-2 rounded-full border border-primary/30 hover:bg-primary hover:text-white duration-300 text-primary top-4 right-4"
          >
            <X size={20} />
          </button>

          <div>
            <div className="flex items-center justify-center mt-6 mb-12">
              <Link href="/dashboard" onClick={() => setIsSidebarOpen(false)}>
                <Image
                  src="/logos/logo.png"
                  height={100}
                  width={200}
                  alt="Website logo"
                  className="w-48 h-auto object-contain"
                />
              </Link>
            </div>

            <ul className="flex flex-col gap-3">
              {sidelinks.map((link) => {
                const active = link.match(pathname);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={`py-3 px-5 rounded-xl text-sm md:text-base w-full inline-block transition-all duration-200 font-medium ${
                        active
                          ? "bg-primary text-white shadow-lg shadow-primary/20"
                          : "text-dark hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <button className="text-primary_red hover:bg-primary_red hover:text-white duration-300 w-full flex items-center gap-3 rounded-xl py-3 px-5 font-semibold transition-all">
            <HiOutlineLogout className="rotate-180 text-xl" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Export wrapped in Suspense
const DashboardNavbar = () => {
  return (
    <Suspense
      fallback={
        <div className="flex p-2 md:p-3 lg:p-4 rounded-xl bg-secondary items-center justify-between animate-pulse">
          <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
          <div className="h-10 flex-1 max-w-2xl bg-gray-200 rounded-lg mx-4"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
        </div>
      }
    >
      <NavbarContent />
    </Suspense>
  );
};

export default DashboardNavbar;
