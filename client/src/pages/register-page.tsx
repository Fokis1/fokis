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

// Register form schema
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage: FC = () => {
  const { signUp } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Form setup for register
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle register form submission
  const onRegisterSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await signUp(values);
      setLocation("/");
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return React.createElement(
    "div",
    { className: "min-h-screen flex items-center justify-center bg-gray-100 p-4" },
    React.createElement(
      "div",
      { className: "w-full max-w-md p-8 bg-white rounded-lg shadow-md" },
      React.createElement(
        "h1",
        { className: "text-2xl font-bold mb-6 text-center" },
        "Sign Up"
      ),
      React.createElement(
        "form",
        {
          onSubmit: registerForm.handleSubmit(onRegisterSubmit),
          className: "space-y-4",
        },
        React.createElement(
          "div",
          null,
          React.createElement(Label, { htmlFor: "email" }, "Email"),
          React.createElement(Input, {
            id: "email",
            type: "email",
            ...registerForm.register("email"),
          }),
          registerForm.formState.errors.email &&
            React.createElement(
              "p",
              { className: "text-sm text-red-500 mt-1" },
              registerForm.formState.errors.email.message
            )
        ),
        React.createElement(
          "div",
          null,
          React.createElement(Label, { htmlFor: "password" }, "Password"),
          React.createElement(Input, {
            id: "password",
            type: "password",
            ...registerForm.register("password"),
          }),
          registerForm.formState.errors.password &&
            React.createElement(
              "p",
              { className: "text-sm text-red-500 mt-1" },
              registerForm.formState.errors.password.message
            )
        ),
        React.createElement(
          "div",
          null,
          React.createElement(Label, { htmlFor: "confirmPassword" }, "Confirm Password"),
          React.createElement(Input, {
            id: "confirmPassword",
            type: "password",
            ...registerForm.register("confirmPassword"),
          }),
          registerForm.formState.errors.confirmPassword &&
            React.createElement(
              "p",
              { className: "text-sm text-red-500 mt-1" },
              registerForm.formState.errors.confirmPassword.message
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
            : "Sign Up"
        )
      ),
      React.createElement(
        "p",
        { className: "text-sm text-center text-gray-600" },
        "Already have an account? ",
        React.createElement(
          "a",
          { href: "/auth", className: "text-blue-600 hover:text-blue-500 font-medium" },
          "Sign in"
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
  );
};

export default RegisterPage;