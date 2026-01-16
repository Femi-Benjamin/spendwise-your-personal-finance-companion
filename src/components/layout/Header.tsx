import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  Wallet,
  LayoutDashboard,
  Receipt,
  Settings as SettingsIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export function Header() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/expenses", label: "Expenses", icon: Receipt },
    { path: "/settings", label: "Settings", icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto px-4 h-16">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            className="flex items-center gap-2 transition-all duration-300 hover:scale-105"
          >
            <img
              src="/logo.png"
              alt="SpendWise"
              className="h-8 w-8 rounded-lg"
            />
            <span className="font-bold text-xl text-primary transition-colors duration-300 hover:text-primary-glow">
              SpendWise
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} to={path}>
                <Button
                  variant={location.pathname === path ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2 transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:block truncate max-w-[200px] transition-colors duration-300">
              {user?.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="gap-2 transition-all duration-200 hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
