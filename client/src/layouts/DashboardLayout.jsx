// client/src/layouts/DashboardLayout.jsx

import { Outlet, Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center justify-between">
          <a href="/" className="font-bold">
            OdooExpense
          </a>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link to="/dashboard" className="transition-colors hover:text-foreground">Dashboard</Link>
          <Link to="/manage-users" className="transition-colors hover:text-foreground">Users</Link>
        </nav>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex-1 container max-w-screen-2xl py-8">
        <Outlet /> {/* This is where HomePage and other pages will render */}
      </main>
    </div>
  );
};

export default DashboardLayout;