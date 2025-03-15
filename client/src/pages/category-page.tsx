import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Article } from "@shared/schema";
import { useLanguage, formatDate } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Eye, MessageSquare, ArrowLeft, Calendar, User, Filter, Clock, LayoutGrid, LayoutList } from "lucide-react";

interface CategoryPageProps {
  category?: string;
  subcategory?: string;
}

export default function CategoryPage() {
  const [, params] = useRoute("/category/:category");
  const [, subParams] = useRoute("/category/:category/:subcategory");
  
  const { currentLanguage, t } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(8);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Get parameters from route
  const category = params?.category || "";
  const subcategory = subParams?.subcategory || "";
  
  // Get category display name and subcategories if available
  const getCategoryData = () => {
    // This should match your header categories structure
    const categories = [
      { id: "news", label: t("categories.news") },
      { 
        id: "politics", 
        label: t("categories.politics"),
        subcategories: [
          { id: "government", label: t("subcategories.government") },
          { id: "elections", label: t("subcategories.elections") },
          { id: "parliament", label: t("subcategories.parliament") },
          { id: "diplomacy", label: t("subcategories.diplomacy") }
        ]
      },
      { 
        id: "economy", 
        label: t("categories.economy"),
        subcategories: [
          { id: "markets", label: t("subcategories.markets") },
          { id: "finance", label: t("subcategories.finance") },
          { id: "jobs", label: t("subcategories.jobs") },
          { id: "trade", label: t("subcategories.trade") }
        ]
      },
      { 
        id: "sports", 
        label: t("categories.sports"),
        subcategories: [
          { id: "football", label: t("subcategories.football") },
          { id: "basketball", label: t("subcategories.basketball") },
          { id: "olympics", label: t("subcategories.olympics") },
          { id: "athletics", label: t("subcategories.athletics") }
        ]
      },
      { 
        id: "health", 
        label: t("categories.health"),
        subcategories: [
          { id: "medicine", label: t("subcategories.medicine") },
          { id: "wellness", label: t("subcategories.wellness") },
          { id: "hospitals", label: t("subcategories.hospitals") },
          { id: "diseases", label: t("subcategories.diseases") }
        ]
      },
      { 
        id: "culture", 
        label: t("categories.culture"),
        subcategories: [
          { id: "music", label: t("subcategories.music") },
          { id: "art", label: t("subcategories.art") },
          { id: "literature", label: t("subcategories.literature") },
          { id: "traditions", label: t("subcategories.traditions") }
        ]
      },
      { id: "technology", label: t("categories.technology") },
      { id: "education", label: t("categories.education") },
      { id: "environment", label: t("categories.environment") },
      { id: "agriculture", label: t("categories.agriculture") },
      { id: "diaspora", label: t("categories.diaspora") },
      { id: "blog", label: t("categories.blog") },
      { id: "polls", label: t("categories.polls") }
    ];
    
    const categoryData = categories.find(c => c.id === category);
    return categoryData || { id: category, label: category };
  };
  
  const categoryData = getCategoryData();
  const subcategoryData = categoryData.subcategories?.find(s => s.id === subcategory);
  
  const getTitle = () => {
    if (subcategory && subcategoryData) {
      return subcategoryData.label;
    }
    return categoryData.label;
  };
  
  // Fetch articles based on category and subcategory
  const apiPath = subcategory 
    ? `/api/articles?language=${currentLanguage}&category=${category}&subcategory=${subcategory}`
    : `/api/articles?language=${currentLanguage}&category=${category}`;
    
  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles", { language: currentLanguage, category, subcategory }],
    queryFn: async () => {
      const response = await fetch(apiPath);
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    }
  });
  
  // Update page title when category or language changes
  useEffect(() => {
    document.title = `${getTitle()} - FOKIS`;
  }, [category, subcategory, t]);
  
  // Reset visible count when category or language changes
  useEffect(() => {
    setVisibleCount(8);
  }, [category, subcategory, currentLanguage]);
  
  // Load more articles handler
  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + 8);
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col space-y-6">
        {/* Category Header with Breadcrumbs */}
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-500 mb-3">
            <Link href="/">
              <a className="hover:text-primary transition-colors">{t("home")}</a>
            </Link>
            <span>/</span>
            {!subcategory ? (
              <span className="font-medium text-primary">{categoryData.label}</span>
            ) : (
              <>
                <Link href={`/category/${category}`}>
                  <a className="hover:text-primary transition-colors">{categoryData.label}</a>
                </Link>
                <span>/</span>
                <span className="font-medium text-primary">{subcategoryData?.label}</span>
              </>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                {getTitle()}
              </h1>
              {subcategory && (
                <p className="text-neutral-600 mt-1">
                  {t("inCategory", { category: categoryData.label })}
                </p>
              )}
            </div>
            
            {/* View Toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="bg-neutral-100 rounded-md p-1 flex">
                <Button 
                  variant={viewMode === "grid" ? "default" : "ghost"} 
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 px-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 px-2"
                >
                  <LayoutList className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Display subcategories if we're on a main category page */}
        {!subcategory && categoryData.subcategories && categoryData.subcategories.length > 0 && (
          <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
            <h2 className="font-medium mb-3">{t("exploreSubcategories")}</h2>
            <div className="flex flex-wrap gap-2">
              {categoryData.subcategories.map(sub => (
                <Link key={sub.id} href={`/category/${category}/${sub.id}`}>
                  <a className="bg-white border border-neutral-200 rounded-full px-4 py-1.5 text-sm hover:bg-primary hover:text-white transition-colors">
                    {sub.label}
                  </a>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Articles Section */}
        {isLoading ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-6 w-full" />
                  </CardHeader>
                  <CardContent className="pb-2">
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-4 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col md:flex-row">
                  <Skeleton className="h-48 md:w-1/3 w-full" />
                  <div className="p-5 md:w-2/3">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : !articles || articles.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-neutral-200">
            <h2 className="text-xl font-medium mb-2">{t("noCategoryArticles")}</h2>
            <p className="text-neutral-600 mb-6">
              {subcategory 
                ? t("noSubcategoryArticles", { subcategory: subcategoryData?.label || subcategory, category: categoryData.label }) 
                : t("checkOtherCategories")}
            </p>
            {subcategory ? (
              <Link href={`/category/${category}`}>
                <Button>{t("backToCategory", { category: categoryData.label })}</Button>
              </Link>
            ) : (
              <Link href="/">
                <Button>{t("backToHome")}</Button>
              </Link>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {articles.slice(0, visibleCount).map(article => (
                <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  {article.coverImage && (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={article.coverImage}
                        alt={article.title} 
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(article.publishedAt)}
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2 text-base">
                      <Link href={`/article/${article.id}`}>
                        <a className="hover:text-primary transition-colors">
                          {article.title}
                        </a>
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-neutral-600 text-sm line-clamp-3">
                      {article.excerpt}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0 flex justify-between text-xs text-neutral-500">
                    <div className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {article.author}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center">
                        <Eye className="h-3 w-3 mr-1" /> {article.viewCount}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" /> {article.commentCount}
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            {articles.slice(0, visibleCount).map(article => (
              <article key={article.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col md:flex-row border border-neutral-200 hover:shadow-md transition-shadow">
                {article.coverImage && (
                  <div className="md:w-1/3 h-48 md:h-auto relative overflow-hidden">
                    <img 
                      src={article.coverImage}
                      alt={article.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-5 md:w-2/3 flex flex-col">
                  <div className="mb-1 flex flex-wrap items-center text-xs text-neutral-500 gap-2">
                    {subcategory && <Badge variant="outline">{categoryData.label}</Badge>}
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(article.publishedAt)}
                    </span>
                    <span className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {article.author}
                    </span>
                  </div>
                  <Link href={`/article/${article.id}`}>
                    <a className="hover:text-primary transition-colors">
                      <h3 className="text-xl font-bold mb-2">{article.title}</h3>
                    </a>
                  </Link>
                  <p className="text-neutral-600 mb-4 line-clamp-3">{article.excerpt}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center">
                      <Link href={`/article/${article.id}`}>
                        <a className="text-primary hover:text-primary-dark text-sm font-medium transition-colors">
                          {t("readMore")}
                        </a>
                      </Link>
                    </div>
                    <div className="flex items-center text-sm text-neutral-500">
                      <span className="flex items-center mr-3">
                        <Eye className="h-4 w-4 mr-1" /> {article.viewCount}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" /> {article.commentCount}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        
        {/* Load More Button */}
        {!isLoading && articles && visibleCount < articles.length && (
          <div className="text-center pt-6">
            <Button 
              variant="outline" 
              onClick={handleLoadMore}
              className="px-6 py-2"
            >
              {t("loadMore")} <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
