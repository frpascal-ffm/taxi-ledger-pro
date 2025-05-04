
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Car, ChartBar, DollarSign, FileText, Home, Users } from "lucide-react";

type SidebarItemProps = {
  href: string;
  icon: React.ElementType;
  title: string;
  active?: boolean;
};

const SidebarItem = ({ href, icon: Icon, title, active }: SidebarItemProps) => (
  <Link
    to={href}
    className={cn(
      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
      active
        ? "bg-sidebar-accent text-sidebar-accent-foreground"
        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
    )}
  >
    <Icon className="h-5 w-5" />
    <span>{title}</span>
  </Link>
);

export function AppSidebar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-14 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-2">
          <Car className="h-6 w-6 text-sidebar-primary" />
          <span className="font-semibold text-sidebar-foreground">Taxi-Ledger Pro</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-4 px-3">
        <nav className="flex flex-col gap-1">
          <SidebarItem
            href="/"
            icon={Home}
            title="Dashboard"
            active={pathname === "/"}
          />
          <SidebarItem
            href="/fahrzeuge"
            icon={Car}
            title="Fahrzeuge"
            active={pathname === "/fahrzeuge"}
          />
          <SidebarItem
            href="/mitarbeiter"
            icon={Users}
            title="Mitarbeiter"
            active={pathname === "/mitarbeiter"}
          />
          <SidebarItem
            href="/umsaetze"
            icon={DollarSign}
            title="Umsätze"
            active={pathname === "/umsaetze"}
          />
          <SidebarItem
            href="/abrechnung"
            icon={FileText}
            title="Abrechnung"
            active={pathname === "/abrechnung"}
          />
          <SidebarItem
            href="/statistik"
            icon={ChartBar}
            title="Statistik"
            active={pathname === "/statistik"}
          />
        </nav>
      </div>
      <div className="mt-auto border-t border-sidebar-border p-4">
        <div className="text-xs text-sidebar-foreground/70">
          © {new Date().getFullYear()} Taxi-Ledger Pro
        </div>
      </div>
    </div>
  );
}
