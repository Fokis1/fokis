import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Globe } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [location] = useLocation();
  
  const categories = [
    { id: "news", label: t("categories.news") },
    { id: "politics", label: t("categories.politics") },
    { id: "culture", label: t("categories.culture") },
    { id: "sports", label: t("categories.sports") },
    { id: "health", label: t("categories.health") },
    { id: "economy", label: t("categories.economy") },
    { id: "polls", label: t("categories.polls") },
    { id: "statistics", label: t("categories.statistics") }
  ];
  
  const languages = [
    { id: "ht", label: "Kreyòl", flag: "🇭🇹" },
    { id: "fr", label: "Français", flag: "🇫🇷" },
    { id: "en", label: "English", flag: "🇺🇸" }
  ];
  
  const getCurrentDateFormatted = () => {
    const date = new Date();
    return date.toLocaleDateString(
      currentLanguage === "ht" ? "fr-HT" : 
      currentLanguage === "fr" ? "fr-FR" : "en-US", 
      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    );
  };
  
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        {/* Top Header */}
        <div className="flex items-center justify-between py-3 border-b border-neutral-200">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
              <Link href="/" className="flex items-center">
                <span>FOKIS</span>
              </Link>
            </h1>
            <div className="hidden md:block text-neutral-500 text-sm">
              {getCurrentDateFormatted()}
            </div>
          </div>
          
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Globe className="h-4 w-4 mr-1" />
                <span>
                  {languages.find(lang => lang.id === currentLanguage)?.label}
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map(lang => (
                <DropdownMenuItem 
                  key={lang.id}
                  onClick={() => setLanguage(lang.id as "ht" | "fr" | "en")}
                  className="flex items-center gap-2"
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex justify-between items-center py-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />} {t("menu")}
          </Button>
          
          {/* Mobile Admin/Auth Links */}
          {user ? (
            user.isAdmin && (
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  {t("adminDashboard")}
                </Button>
              </Link>
            )
          ) : (
            <Link href="/auth">
              <Button variant="outline" size="sm">
                {t("login")}
              </Button>
            </Link>
          )}
        </div>
        
        {/* Navigation */}
        <nav className={cn(
          "py-3 overflow-x-auto scrollbar-hide",
          mobileMenuOpen ? "block" : "hidden md:block"
        )}>
          <ul className="flex md:flex-row flex-col md:space-x-6 space-y-2 md:space-y-0 font-medium text-sm uppercase tracking-wider">
            {categories.map(category => (
              <li key={category.id}>
                <Link href={category.id === "news" ? "/" : `/category/${category.id}`}>
                  <a className={cn(
                    "block py-1 border-b-2 hover:text-secondary transition-colors",
                    location === (category.id === "news" ? "/" : `/category/${category.id}`) 
                      ? "border-secondary font-bold" 
                      : "border-transparent hover:border-secondary"
                  )}>
                    {category.label}
                  </a>
                </Link>
              </li>
            ))}
            
            {/* Desktop Admin/Auth Links */}
            <li className="hidden md:block ml-auto">
              {user ? (
                user.isAdmin && (
                  <Link href="/admin">
                    <a className="block py-1 border-b-2 border-transparent hover:border-secondary hover:text-secondary transition-colors">
                      {t("adminDashboard")}
                    </a>
                  </Link>
                )
              ) : (
                <Link href="/auth">
                  <a className="block py-1 border-b-2 border-transparent hover:border-secondary hover:text-secondary transition-colors">
                    {t("login")}
                  </a>
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
