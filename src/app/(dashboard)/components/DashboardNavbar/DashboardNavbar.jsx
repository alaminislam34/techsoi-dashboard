"use client";

import { Bell, Mail, Menu, Search } from "lucide-react";

const DashboardNavbar = () => {
  return (
    <div className="p-2 md:p-3 lg:p-4 rounded-xl bg-secondary flex items-center justify-between border border-[#D4DAE6] gap-3 left-0">
      {/* Mobile Menu Button */}
      <div className="lg:hidden shrink-0">
        <button className="p-2 border border-primary/50 rounded-xl text-primary hover:bg-primary hover:text-white duration-300 cursor-pointer">
          <Menu size={20} />
        </button>
      </div>

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
        <button className="p-2 hover:bg-primary hover:text-white duration-300 rounded-xl text-primary bg-white cursor-pointer border border-primary/80">
          <Mail size={20} />
        </button>

        {/* We keep Bell visible even on mobile as it's high priority */}
        <button className="p-2 hover:bg-primary hover:text-white duration-300 rounded-xl text-primary bg-white cursor-pointer border border-primary/80 relative">
          <Bell size={20} />
          {/* Optional: Simple Notification Dot to show it's a real dashboard */}
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary_red rounded-full border border-white"></span>
        </button>
      </div>
    </div>
  );
};

export default DashboardNavbar;
