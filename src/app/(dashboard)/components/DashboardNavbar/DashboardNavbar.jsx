"use client";

import { Bell, Mail, Menu, Search } from "lucide-react";

const DashboardNavbar = () => {
  return (
    <div className="p-2 md:p-3 lg:p-5 rounded-xl bg-secondary flex items-center justify-between border border-[#D4DAE6]">
      <div className="lg:hidden">
        <button className="p-2 border border-primary/50 rounded-xl text-primary hover:bg-primary hover:text-white duration-300 cursor-pointer">
          <Menu />
        </button>
      </div>
      <div className="max-w-2xl w-full">
        <div className="relative">
          <input
            type="text"
            placeholder="Search products"
            className="border bg-white border-primary/50  focus:outline-primary text-gray-500 py-2 px-6 pr-12  rounded-xl w-full"
          />
          <Search className="absolute top-1/2 -translate-y-1/2 right-6 text-primary" />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <button className="p-2 hover:bg-primary hover:text-white duration-300 rounded-xl text-primary bg-white cursor-pointer border border-primary/80">
          <Mail />
        </button>
        <button className="p-2 hover:bg-primary hover:text-white duration-300 rounded-xl text-primary bg-white cursor-pointer border border-primary/80">
          <Bell />
        </button>
      </div>
    </div>
  );
};

export default DashboardNavbar;
