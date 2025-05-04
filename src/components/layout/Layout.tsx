
import { AppSidebar } from "@/components/AppSidebar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 py-6">{children}</div>
        </main>
      </div>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  );
}
