import { Switch, Route, Redirect } from "wouter"; // Added Redirect
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import Dashboard from "@/pages/Dashboard";
import Sales from "@/pages/Sales";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth"; // New import

// ProtectedRoute component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoadingUser } = useAuth();

  if (isLoadingUser) {
    return <div>Loading authentication...</div>; // Or a spinner
  }

  if (!isLoggedIn) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      <ProtectedRoute>
        <Route path="/" component={Dashboard} />
        <Route path="/sales" component={Sales} />
      </ProtectedRoute>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;