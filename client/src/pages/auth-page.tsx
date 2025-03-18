import React, { FC, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const AuthPage: FC = () => {
  const { user, signInWithGoogle, loginMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Form setup for login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Handle login form submission
  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      await loginMutation.mutateAsync(values);
      setLocation("/");
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      setLocation("/");
    } catch (error) {
      console.error("Google Sign-In failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if already logged in
  if (user) {
    setLocation("/");
    return null;
  }

  return React.createElement(
    "div",
    { className: "min-h-screen flex items-center justify-center bg-gray-100 p-4" },
    React.createElement(
      "div",
      { className: "w-full max-w-md p-8 bg-white rounded-lg shadow-md" },
      React.createElement(
        "h1",
        { className: "text-2xl font-bold mb-6 text-center" },
        "Login"
      ),
      React.createElement(
        "div",
        { className: "space-y-4" },
        React.createElement(
          Button,
          {
            variant: "outline",
            className: "w-full flex items-center justify-center gap-2",
            onClick: handleGoogleSignIn,
            disabled: isLoading,
          },
          React.createElement("img", {
            src: "https://www.google.com/favicon.ico",
            alt: "Google",
            className: "w-5 h-5",
          }),
          "Continue with Google"
        ),
        React.createElement(
          "div",
          { className: "relative" },
          React.createElement("div", { className: "absolute inset-0 flex items-center" },
            React.createElement("span", { className: "w-full border-t" })
          ),
          React.createElement(
            "div",
            { className: "relative flex justify-center text-xs uppercase" },
            React.createElement(
              "span",
              { className: "bg-white px-2 text-gray-500" },
              "Or continue with"
            )
          )
        ),
        React.createElement(
          "form",
          {
            onSubmit: loginForm.handleSubmit(onLoginSubmit),
            className: "space-y-4",
          },
          React.createElement(
            "div",
            null,
            React.createElement(Label, { htmlFor: "email" }, "Email"),
            React.createElement(Input, {
              id: "email",
              type: "email",
              ...loginForm.register("email"),
            }),
            loginForm.formState.errors.email &&
              React.createElement(
                "p",
                { className: "text-sm text-red-500 mt-1" },
                loginForm.formState.errors.email.message
              )
          ),
          React.createElement(
            "div",
            null,
            React.createElement(Label, { htmlFor: "password" }, "Password"),
            React.createElement(Input, {
              id: "password",
              type: "password",
              ...loginForm.register("password"),
            }),
            loginForm.formState.errors.password &&
              React.createElement(
                "p",
                { className: "text-sm text-red-500 mt-1" },
                loginForm.formState.errors.password.message
              )
          ),
          React.createElement(
            Button,
            {
              type: "submit",
              className: "w-full",
              disabled: isLoading,
            },
            isLoading
              ? React.createElement(Loader2, { className: "h-4 w-4 animate-spin" })
              : "Sign in"
          )
        ),
        React.createElement(
          "p",
          { className: "text-sm text-center text-gray-600" },
          "Don't have an account? ",
          React.createElement(
            "a",
            { href: "/register", className: "text-blue-600 hover:text-blue-500 font-medium" },
            "Sign up"
          )
        ),
        React.createElement(
          "p",
          { className: "text-sm text-center text-gray-600" },
          "Forgot your password? ",
          React.createElement(
            "a",
            { href: "/reset-password", className: "text-blue-600 hover:text-blue-500 font-medium" },
            "Reset it"
          )
        )
      )
    )
  );
};

export default AuthPage;