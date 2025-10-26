import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";

import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import CreateBot from "@/pages/CreateBot";
import BotsManagement from "@/pages/BotsManagement";
import TeamsManagement from "@/pages/TeamsManagement";
import CreateTeam from "@/pages/CreateTeam";
import TeamWorkspace from "@/pages/TeamWorkspace";
import TeamCollaborationWorkspace from "@/pages/TeamCollaborationWorkspace";
import Outputs from "@/pages/Outputs";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Home} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          <Route component={Home} />
        </>
      ) : (
        <>
          <Route path="/" component={() => <DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/privacy" component={Privacy} />
          <Route path="/terms" component={Terms} />
          
          <Route path="/dashboard">
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          </Route>
          
          <Route path="/bots">
            <ProtectedRoute>
              <DashboardLayout>
                <BotsManagement />
              </DashboardLayout>
            </ProtectedRoute>
          </Route>
          
          <Route path="/bots/create">
            <ProtectedRoute>
              <DashboardLayout>
                <CreateBot />
              </DashboardLayout>
            </ProtectedRoute>
          </Route>
          
          <Route path="/teams">
            <ProtectedRoute>
              <DashboardLayout>
                <TeamsManagement />
              </DashboardLayout>
            </ProtectedRoute>
          </Route>
          
          <Route path="/teams/create">
            <ProtectedRoute>
              <DashboardLayout>
                <CreateTeam />
              </DashboardLayout>
            </ProtectedRoute>
          </Route>
          
          <Route path="/teams/:id">
            <ProtectedRoute>
              <DashboardLayout>
                <TeamWorkspace />
              </DashboardLayout>
            </ProtectedRoute>
          </Route>
          
          <Route path="/teams/:id/collaborate">
            <ProtectedRoute>
              <DashboardLayout>
                <TeamCollaborationWorkspace />
              </DashboardLayout>
            </ProtectedRoute>
          </Route>
          
          <Route path="/outputs">
            <ProtectedRoute>
              <DashboardLayout>
                <Outputs />
              </DashboardLayout>
            </ProtectedRoute>
          </Route>
          
          <Route path="/settings">
            <ProtectedRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </ProtectedRoute>
          </Route>
          
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
