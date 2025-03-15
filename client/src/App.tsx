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
import AuthPage from "@/pages/auth-page";
import AdminPage from "@/pages/admin/admin-page";
import NotFound from "@/pages/not-found";
import ArticlesManagement from "@/pages/admin/articles-management";
import CreateArticle from "@/pages/admin/create-article";
import EditArticle from "@/pages/admin/edit-article";
import PollsManagement from "@/pages/admin/polls-management";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={HomePage} />
      <Route path="/article/:id" component={ArticlePage} />
      <Route path="/category/:category" component={CategoryPage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Admin Routes */}
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
      
      {/* Fallback 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
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
