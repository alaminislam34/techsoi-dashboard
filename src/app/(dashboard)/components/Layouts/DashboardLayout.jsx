import Sidebar from "../Sidebar/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <main className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 border-r bg-background">
        <Sidebar />
      </aside>

      {/* Content */}
      <section className="flex-1 bg-primary/50 p-4 lg:p-6">{children}</section>
    </main>
  );
}
