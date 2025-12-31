"use client";

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

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="lg:w-65 xl:w-72 border-r border-gray-300 h-screen bg-secondary flex justify-between flex-col fixed left-0 top-0 p-6">
      <div>
        <div className="flex items-center justify-center mt-6 mb-12">
          <Link href="/dashboard">
            <Image
              src="/logos/logo.png"
              height={400}
              width={600}
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

      <button className="text-primary_red hover:bg-primary_red hover:text-white duration-300 w-full flex items-center gap-2 rounded-xl py-2 px-4">
        <HiOutlineLogout className="rotate-180" />
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
