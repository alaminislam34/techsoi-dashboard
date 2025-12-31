"use client";

import { useGlobalState } from "@/app/providers/StateProvider";
import { Bell, Mail, Menu, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiOutlineLogout } from "react-icons/hi";

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

const DashboardNavbar = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useGlobalState();
  const pathname = usePathname();

  return (
    <div className="p-2 md:p-3 lg:p-4 rounded-xl bg-secondary flex items-center justify-between gap-3 relative z-30">
      {/* Mobile Menu Button */}
      <div className="lg:hidden shrink-0">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 border border-primary/50 rounded-xl text-primary hover:bg-primary hover:text-white duration-300 cursor-pointer"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search products"
            className="border bg-white border-primary/50 focus:outline-primary text-gray-500 py-2 px-4 md:px-6 pr-10 md:pr-12 rounded-xl w-full text-sm md:text-base transition-all"
          />
          <Search
            size={18}
            className="absolute top-1/2 -translate-y-1/2 right-3 md:right-6 text-primary pointer-events-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 xl:gap-4 shrink-0">
        <button className="p-2 hover:bg-primary hover:text-white duration-300 rounded-xl text-primary bg-white cursor-pointer border border-primary/80 transition-all">
          <Mail size={20} />
        </button>

        <button className="p-2 hover:bg-primary hover:text-white duration-300 rounded-xl text-primary bg-white cursor-pointer border border-primary/80 relative transition-all">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary_red rounded-full border border-white"></span>
        </button>
      </div>

      {/* --- SIDEBAR OVERLAY & PANEL --- */}
      <div
        className={`fixed inset-0 z-100 transition-all duration-300 ${
          isSidebarOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        {/* Dark Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Sidebar Content */}
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

export default DashboardNavbar;
