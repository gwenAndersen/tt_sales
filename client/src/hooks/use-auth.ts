import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface AuthUser {
  id: string;
  username: string;
}

interface Credentials {
  username: string;
  password?: string;
  remember?: boolean;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading, isError } = useQuery<AuthUser | null>({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (res.status === 401) {
        return null;
      }
      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }
      return res.json();
    },
    staleTime: Infinity,
    retry: false,
  });

  const loginMutation = useMutation<AuthUser, Error, Credentials>({
    mutationFn: async (credentials) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
          remember: credentials.remember,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["authUser"], data);
      toast({ title: "Login successful", description: "Welcome back!" });
      setLocation("/");
    },
    onError: (error) => {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    },
  });

  const registerMutation = useMutation<AuthUser, Error, Credentials>({
    mutationFn: async (credentials) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["authUser"], data);
      toast({ title: "Registration successful", description: "Welcome! You are now logged in." });
      setLocation("/");
    },
    onError: (error) => {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    },
  });

  const logoutMutation = useMutation<void, Error>({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) {
        throw new Error("Logout failed");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData(["authUser"], null);
      toast({ title: "Logged out", description: "See you soon!" });
      setLocation("/login");
    },
    onError: (error) => {
      toast({ title: "Logout failed", description: error.message, variant: "destructive" });
    },
  });

  return {
    user,
    isLoadingUser: isLoading,
    isLoggedIn: !!user,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    register: registerMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
