// app/dashboard/layout.js
import "../globals.css";
import DashboardNavbar from "./components/DashboardNavbar/DashboardNavbar";
import Sidebar from "./components/Sidebar/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <main className="flex min-h-screen">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:block lg:w-72 shrink-0">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <section className="flex-1 min-h-screen p-4 lg:p-6 relative z-10">
        <DashboardNavbar />
        {children}
      </section>
    </main>
  );
}
