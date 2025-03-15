import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Menu, X, ChevronDown, Globe, Search, User, ChevronRight, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [location] = useLocation();
  
  const [searchQuery, setSearchQuery] = useState("");
  
  const categories = [
    { id: "news", label: "Nouvèl", icon: <Calendar className="h-4 w-4" /> },
    { 
      id: "politics", 
      label: "Politik", 
      icon: <ChevronRight className="h-4 w-4" />,
      subcategories: [
        { id: "government", label: t("subcategories.government") },
        { id: "elections", label: t("subcategories.elections") },
        { id: "parliament", label: t("subcategories.parliament") },
        { id: "diplomacy", label: t("subcategories.diplomacy") }
      ]
    },
    { 
      id: "economy", 
      label: "Ekonomi", 
      icon: <ChevronRight className="h-4 w-4" />,
      subcategories: [
        { id: "markets", label: t("subcategories.markets") },
        { id: "finance", label: t("subcategories.finance") },
        { id: "jobs", label: t("subcategories.jobs") },
        { id: "trade", label: t("subcategories.trade") }
      ]
    },
    { 
      id: "sports", 
      label: "Espò", 
      icon: <ChevronRight className="h-4 w-4" />,
      subcategories: [
        { id: "football", label: t("subcategories.football") },
        { id: "basketball", label: t("subcategories.basketball") },
        { id: "olympics", label: t("subcategories.olympics") },
        { id: "athletics", label: t("subcategories.athletics") }
      ]
    },
    { 
      id: "health", 
      label: "Sante", 
      icon: <ChevronRight className="h-4 w-4" />,
      subcategories: [
        { id: "medicine", label: t("subcategories.medicine") },
        { id: "wellness", label: t("subcategories.wellness") },
        { id: "hospitals", label: t("subcategories.hospitals") },
        { id: "diseases", label: t("subcategories.diseases") }
      ]
    },
    { 
      id: "culture", 
      label: "Kilti", 
      icon: <ChevronRight className="h-4 w-4" />,
      subcategories: [
        { id: "music", label: t("subcategories.music") },
        { id: "art", label: t("subcategories.art") },
        { id: "literature", label: t("subcategories.literature") },
        { id: "traditions", label: t("subcategories.traditions") }
      ]
    },
    { id: "technology", label: "Teknoloji", icon: <ChevronRight className="h-4 w-4" /> },
    { id: "education", label: "Edikasyon" },
    { id: "environment", label: "Anviwònman" },
    { id: "agriculture", label: "Agrikilti" },
    { id: "diaspora", label: "Dyaspora" },
    { id: "blog", label: "Blog" },
    { id: "polls", label: "Sondaj" }
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
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Search className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder={t("search")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      size="sm"
                      onClick={() => console.log('Search for:', searchQuery)}
                    >
                      <Search className="h-4 w-4 mr-2" />
                      {t("search")}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
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
            
            {/* Auth Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user ? (
                  <>
                    <DropdownMenuItem>
                      <span className="font-medium">{user.username}</span>
                    </DropdownMenuItem>
                    {user.isAdmin && (
                      <Link href="/admin">
                        <DropdownMenuItem>
                          {t("adminDashboard")}
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuItem>
                      {t("logout")}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <Link href="/auth">
                    <DropdownMenuItem>
                      {t("login")}
                    </DropdownMenuItem>
                  </Link>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
        </div>
        
        {/* Navigation - Desktop */}
        <nav className="hidden md:block border-b border-neutral-100">
          <div className="flex items-center justify-between py-2">
            <ul className="flex items-center space-x-1 overflow-x-auto">
              {categories.map(category => {
                if (category.subcategories) {
                  return (
                    <li key={category.id} className="relative">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className={cn(
                            "flex items-center gap-1", 
                            location === `/category/${category.id}` && "bg-secondary/20"
                          )}>
                            {category.label}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <Link href={`/category/${category.id}`}>
                            <DropdownMenuItem>
                              {t("seeAll")} {category.label}
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          {category.subcategories.map(sub => (
                            <Link key={sub.id} href={`/category/${category.id}/${sub.id}`}>
                              <DropdownMenuItem>
                                {sub.label}
                              </DropdownMenuItem>
                            </Link>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  )
                }
                return (
                  <li key={category.id}>
                    <Link href={category.id === "news" ? "/" : `/category/${category.id}`}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className={cn(
                          location === (category.id === "news" ? "/" : `/category/${category.id}`) && "bg-secondary/20"
                        )}
                      >
                        {category.label}
                      </Button>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>
        
        {/* Navigation - Mobile */}
        <nav className={cn(
          "py-3 overflow-y-auto max-h-[80vh]",
          mobileMenuOpen ? "block" : "hidden"
        )}>
          <div className="border rounded-md mb-3">
            <div className="p-2">
              <Input
                placeholder={t("search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="space-y-1">
            {categories.map(category => {
              if (category.subcategories) {
                return (
                  <div key={category.id} className="pb-2">
                    <Link href={`/category/${category.id}`}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="w-full justify-start font-semibold text-left"
                      >
                        {category.label}
                      </Button>
                    </Link>
                    <div className="pl-4 space-y-1 mt-1">
                      {category.subcategories.map(sub => (
                        <Link key={sub.id} href={`/category/${category.id}/${sub.id}`}>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="w-full justify-start"
                          >
                            {sub.label}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </div>
                )
              }
              return (
                <Link key={category.id} href={category.id === "news" ? "/" : `/category/${category.id}`}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="w-full justify-start"
                  >
                    {category.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </header>
  );
}
