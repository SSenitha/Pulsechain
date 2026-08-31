import { type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { Shell } from "@/components/layout/Shell";
import { Login } from "@/pages/login/Login";
import { Track } from "@/pages/track/Track";
import { NotFound } from "@/pages/NotFound";
import { Fleet } from "@/pages/fleet/Fleet";
import { Packages } from "@/pages/packages/Packages";
import { Analytics } from "@/pages/analytics/Analytics";
import { Operations } from "@/pages/operations/Operations";
import { Admin } from "@/pages/admin/Admin";
import { AppProvider, useApp } from "@/context/AppContext";

const queryClient = new QueryClient();

function AuthenticatedRoute({ children }: { children: ReactNode }) {
  const { role } = useApp();
  const [location] = useLocation();
  if (location === "/admin" && role !== "Super Admin")
    return <Redirect to="/fleet" />;
  if (location === "/operations" && role === "Viewer")
    return <Redirect to="/fleet" />;
  return <Shell>{children}</Shell>;
}
function Router() {
  return (
    <Switch>
      <Route path="/login">
        <Login />
      </Route>
      <Route path="/track">
        <Track />
      </Route>
      <Route path="/fleet">
        <AuthenticatedRoute>
          <Fleet />
        </AuthenticatedRoute>
      </Route>
      <Route path="/packages">
        <AuthenticatedRoute>
          <Packages />
        </AuthenticatedRoute>
      </Route>
      <Route path="/analytics">
        <AuthenticatedRoute>
          <Analytics />
        </AuthenticatedRoute>
      </Route>
      <Route path="/operations">
        <AuthenticatedRoute>
          <Operations />
        </AuthenticatedRoute>
      </Route>
      <Route path="/admin">
        <AuthenticatedRoute>
          <Admin />
        </AuthenticatedRoute>
      </Route>
      <Route path="/">
        <Redirect to="/fleet" />
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AppProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
export default App;