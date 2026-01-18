// app/dashboard/layout.js
import { Toaster } from "react-hot-toast";
import "../globals.css";
import { StateProvider } from "../providers/StateProvider";
import DashboardNavbar from "./components/DashboardNavbar/DashboardNavbar";
import Sidebar from "./components/Sidebar/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <main className="flex h-screen overflow-hidden bg-white">
      <StateProvider>
        <aside className="hidden lg:block lg:w-65 xl:w-72 shrink-0 border-r border-gray-100 overflow-y-auto">
          <Sidebar />
        </aside>

        <section className="flex-1 flex flex-col min-w-0 h-screen relative z-10">
          <header className="sticky shadow top-0 z-50 p-4 xl:p-6">
            <DashboardNavbar />
          </header>

          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 pt-0 space-y-6 scroll-smooth">
            {children}
          </div>
        </section>
        <Toaster position="top-center" />
      </StateProvider>
    </main>
  );
}
