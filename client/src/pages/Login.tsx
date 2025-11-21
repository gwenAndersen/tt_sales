import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const { login, isLoggingIn } = useAuth();

  const onSubmit = (data: LoginFormInputs) => {
    login(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your username and password to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="john.doe"
                {...register("username")}
              />
              {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <Input
                id="remember"
                type="checkbox"
                {...register("remember")}
                className="h-4 w-4"
              />
              <Label htmlFor="remember">Remember me</Label>
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <a href="/register" className="underline">
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}