// client/src/layouts/DashboardLayout.jsx

import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-2xl items-center">
          <Link to="/dashboard" className="font-bold mr-6">OdooExpense</Link>
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/dashboard" className="transition-colors hover:text-foreground">Dashboard</Link>
            {user && (user.role === 'ADMIN' || user.role === 'MANAGER') && (
              <Link to="/approvals" className="transition-colors hover:text-foreground">Approvals</Link>
            )}
            {user && user.role === 'ADMIN' && (
              <>
                <Link to="/manage-users" className="transition-colors hover:text-foreground">Users</Link>
                <Link to="/manage-managers" className="transition-colors hover:text-foreground">Managers</Link>
              </>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8"><AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback></Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1"><p className="text-sm font-medium leading-none">{user?.name}</p><p className="text-xs leading-none text-muted-foreground">{user?.email}</p></div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <main className="flex-1 container max-w-screen-2xl py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;