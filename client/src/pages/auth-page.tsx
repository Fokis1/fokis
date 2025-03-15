import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/lib/i18n";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Register form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { t } = useLanguage();
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  
  // Form setup for login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Form setup for registration
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  // Handle login form submission
  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        setLocation("/");
      }
    });
  };
  
  // Handle register form submission
  const onRegisterSubmit = (values: RegisterFormValues) => {
    const { username, password } = values;
    registerMutation.mutate({ username, password }, {
      onSuccess: () => {
        setLocation("/");
      }
    });
  };
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);
  
  // Set page title
  useEffect(() => {
    document.title = `${t("login")} - Nouvèl Ayiti`;
  }, [t]);
  
  // Don't show the login page if already logged in
  if (user) {
    return <div className="flex justify-center items-center h-screen">
      <Loader2 className="animate-spin h-6 w-6" />
    </div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Header />
      
      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="flex flex-col-reverse md:flex-row md:h-[600px] bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Auth Forms */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
            <Tabs defaultValue="login" className="w-full max-w-md mx-auto">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">{t("login")}</TabsTrigger>
                <TabsTrigger value="register">{t("register")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("login")}</CardTitle>
                    <CardDescription>{t("loginDescription")}</CardDescription>
                  </CardHeader>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-username">{t("username")}</Label>
                        <Input 
                          id="login-username"
                          type="text"
                          {...loginForm.register("username")}
                        />
                        {loginForm.formState.errors.username && (
                          <p className="text-sm text-red-500">{loginForm.formState.errors.username.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="login-password">{t("password")}</Label>
                        <Input 
                          id="login-password"
                          type="password"
                          {...loginForm.register("password")}
                        />
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("loggingIn")}</>
                        ) : t("login")}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("register")}</CardTitle>
                    <CardDescription>{t("registerDescription")}</CardDescription>
                  </CardHeader>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-username">{t("username")}</Label>
                        <Input 
                          id="register-username"
                          type="text"
                          {...registerForm.register("username")}
                        />
                        {registerForm.formState.errors.username && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.username.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-password">{t("password")}</Label>
                        <Input 
                          id="register-password"
                          type="password"
                          {...registerForm.register("password")}
                        />
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="register-confirm-password">{t("confirmPassword")}</Label>
                        <Input 
                          id="register-confirm-password"
                          type="password"
                          {...registerForm.register("confirmPassword")}
                        />
                        {registerForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("registering")}</>
                        ) : t("register")}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Hero Image / About */}
          <div className="w-full md:w-1/2 bg-primary p-6 md:p-12 flex items-center justify-center text-white">
            <div className="max-w-md">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Nouvèl Ayiti</h1>
              <p className="text-xl mb-6">{t("welcomeMessage")}</p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>{t("featureMultilingual")}</p>
                </div>
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1M19 8l-7 5-7-5M5 19h14a2 2 0 002-2v-3" />
                  </svg>
                  <p>{t("featureLatestNews")}</p>
                </div>
                <div className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p>{t("featureEngagement")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
