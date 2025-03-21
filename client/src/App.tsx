import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Pages
import HomePage from "@/pages/home-page";
import ArticlePage from "@/pages/article-page";
import CategoryPage from "@/pages/category-page";
import BlogPage from "@/pages/blog-page";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

// Pages Admin
import AdminPage from "@/pages/admin/admin-page";
import ArticlesManagement from "@/pages/admin/articles-management";
import CreateArticle from "@/pages/admin/create-article";
import EditArticle from "@/pages/admin/edit-article";
import PollsManagement from "@/pages/admin/polls-management";

function Router() {
  return (
    <Switch>
      {/* Routes Publiques */}
      <Route path="/" component={HomePage} />
      <Route path="/article/:id" component={ArticlePage} />
      <Route path="/category/:category" component={CategoryPage} />
      <Route path="/category/:category/:subcategory" component={CategoryPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Routes Admin - complètement isolées de la navigation principale */}
      <Route path="/admin">
        <ProtectedRoute adminOnly path="/admin" component={AdminPage} />
      </Route>
      <Route path="/admin/articles">
        <ProtectedRoute adminOnly path="/admin/articles" component={ArticlesManagement} />
      </Route>
      <Route path="/admin/articles/create">
        <ProtectedRoute adminOnly path="/admin/articles/create" component={CreateArticle} />
      </Route>
      <Route path="/admin/articles/edit/:id">
        <ProtectedRoute adminOnly path="/admin/articles/edit/:id" component={EditArticle} />
      </Route>
      <Route path="/admin/polls">
        <ProtectedRoute adminOnly path="/admin/polls" component={PollsManagement} />
      </Route>
      
      {/* Route de secours 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

const App: FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
