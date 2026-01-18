"use client";

import apiService from "@/api/api";
import { ADMIN_LOGOUT_API } from "@/api/apiEndPoint";
import Cookies from "js-cookie";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
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

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const handleLogout = async () => {
    try {
      const res = await apiService.get(ADMIN_LOGOUT_API);

      if (res.data?.status === true) {
        toast.success("Logout successful");
      }
    } catch (error) {
      console.error("Logout error details:", error);
    } finally {
      Cookies.remove("admin_token");
      localStorage.removeItem("user");
      toast.success("Logged out");
      router.push("/login");
    }
  };

  return (
    <div className="lg:w-65 xl:w-72 border-r border-gray-300 h-screen bg-secondary flex justify-between flex-col fixed left-0 top-0 p-6">
      <div>
        <div className="flex items-center justify-center mt-6 mb-12">
          <Link href="/dashboard">
            <Image
              src="/logos/logo.png"
              height={135}
              width={600}
              unoptimized
              loading="eager"
              alt="Website logo"
              className="w-55 h-auto object-cover"
            />
          </Link>
        </div>

        <ul className="flex flex-col gap-4">
          {sidelinks.map((link) => {
            const active = link.match(pathname);

            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`py-2 px-4 rounded-xl xl:text-lg w-full inline-block transition
                    ${
                      active
                        ? "bg-primary text-white"
                        : "text-dark hover:bg-primary hover:text-white"
                    }
                  `}
                >
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <button
        onClick={handleLogout}
        className="text-primary_red hover:bg-primary_red hover:text-white duration-300 w-full flex items-center gap-2 rounded-xl py-2 px-4"
      >
        <HiOutlineLogout className="rotate-180" />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
