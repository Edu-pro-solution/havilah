import { Navigate, Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopHeader } from "./TopHeader";
import { useAuth } from "@/contexts/AuthContext";

export function AppLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-dvh flex w-full max-w-[100vw] overflow-x-hidden">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-h-0 min-w-0">
          <TopHeader />
          <main className="flex-1 min-h-0 w-full min-w-0 overflow-x-auto overflow-y-auto p-3 sm:p-4 md:p-6">
            <div className="mx-auto w-full max-w-[1600px]">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
