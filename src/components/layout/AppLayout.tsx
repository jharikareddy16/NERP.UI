import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Heart, Award, Trophy, History, Menu, X, ChevronsLeft, ChevronsRight, Sun, Moon, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/appreciate", label: "Send Appreciation", icon: Heart },

  // ✅ Show ONLY for manager/admin
  ...(user?.userRole !== "employee"
    ? [{ to: "/nominations", label: "Nominations", icon: Award }]
    : []),

  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/my-recognitions", label: "My Recognitions", icon: History },
];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      const saved = localStorage.getItem("theme");
      if (!saved) setDark(e.matches);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const avatar = user?.avatar || user?.name?.split(" ").map(n => n[0]).join("").slice(0, 2) || "??";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex-shrink-0 transition-all duration-300",
          collapsed ? "w-[68px]" : "w-64"
        )}
      >
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="flex justify-center">
            <img src="/logo.png" alt="Logo" className="h-5 object-contain" />
          </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-base text-sidebar-foreground">Employee Recognition</h1>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const linkContent = (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  collapsed && "justify-center px-2",
                  location.pathname === item.to
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && item.label}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.to} delayDuration={0}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }
            return linkContent;
          })}
        </nav>

        {/* User + controls */}
        <div className="border-t border-sidebar-border">
          {!collapsed && user && (
            <div className="p-4 pb-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 bg-sidebar-accent flex-shrink-0">
                  <AvatarFallback className="bg-sidebar-accent text-sidebar-foreground text-xs font-semibold">{avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
                  <p className="text-xs text-sidebar-muted capitalize">{user.userRole}</p>
                </div>
              </div>
            </div>
          )}
          <div className={cn("p-2 flex gap-1", collapsed ? "flex-col items-center" : "justify-end")}>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={() => setDark(!dark)} className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent">
                  {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"} sideOffset={8}>
                {dark ? "Light mode" : "Dark mode"}
              </TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent">
                  <LogOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side={collapsed ? "right" : "top"} sideOffset={8}>Logout</TooltipContent>
            </Tooltip>
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent">
              {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card flex-shrink-0">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-5 object-contain" />
            <span className="font-bold text-foreground">Employee Recognition</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </header>

        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm pt-16">
            <nav className="p-4 space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors",
                    location.pathname === item.to
                      ? "bg-primary/10 text-primary"
                      : "text-foreground/70 hover:bg-muted"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-destructive hover:bg-muted w-full">
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </nav>
          </div>
        )}

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
