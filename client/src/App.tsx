import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import Dashboard from "@/pages/Dashboard";
import TransactionsPage from "@/pages/TransactionsPage";
import SalesPage from "@/pages/SalesPage";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";

// ProtectedRoute component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoadingUser } = useAuth();

  if (isLoadingUser) {
    return <div>Loading authentication...</div>;
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
        <Route path="/transactions" component={TransactionsPage} />
        <Route path="/sales" component={SalesPage} />
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