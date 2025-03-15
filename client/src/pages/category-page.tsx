import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Article } from "@shared/schema";
import { useLanguage, formatDate } from "@/lib/i18n";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StatsWidget from "@/components/sidebar/StatsWidget";
import PollWidget from "@/components/sidebar/PollWidget";
import SocialMediaWidget from "@/components/sidebar/SocialMediaWidget";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown, Eye, MessageSquare } from "lucide-react";

export default function CategoryPage() {
  const [, params] = useRoute("/category/:category");
  const { currentLanguage, t } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(5);
  const category = params?.category || "";
  
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles", currentLanguage, category],
    queryFn: async () => {
      const response = await fetch(`/api/articles?language=${currentLanguage}&category=${category}`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    }
  });
  
  // Update page title when category or language changes
  useEffect(() => {
    document.title = `${t(`categories.${category}`)} - Nouvèl Ayiti`;
  }, [category, t]);
  
  // Reset visible count when category or language changes
  useEffect(() => {
    setVisibleCount(5);
  }, [category, currentLanguage]);
  
  // Load more articles handler
  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + 5);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary">
            {t(`categories.${category}`)}
          </h1>
          <p className="text-neutral-600 mt-2">
            {t("browsingCategory", { category: t(`categories.${category}`) })}
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Articles Column */}
          <div className="lg:col-span-8">
            {isLoading ? (
              <div className="space-y-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col md:flex-row">
                    <div className="md:w-1/3">
                      <Skeleton className="h-48 w-full" />
                    </div>
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
            ) : !articles || articles.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <h2 className="text-xl font-medium mb-2">{t("noCategoryArticles")}</h2>
                <p className="text-neutral-600 mb-6">{t("checkOtherCategories")}</p>
                <Link href="/">
                  <Button>{t("backToHome")}</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {articles.slice(0, visibleCount).map(article => (
                  <article key={article.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col md:flex-row">
                    <div className="md:w-1/3 relative h-48 md:h-auto">
                      <img 
                        src={article.coverImage || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80`} 
                        alt={article.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5 md:w-2/3 flex flex-col">
                      <Link href={`/article/${article.id}`}>
                        <a className="hover:text-secondary transition-colors">
                          <h3 className="text-xl font-bold mb-2">{article.title}</h3>
                        </a>
                      </Link>
                      <p className="text-neutral-600 mb-4 line-clamp-3">{article.excerpt}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center text-sm text-neutral-500">
                          <span>{article.author}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(article.publishedAt)}</span>
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
                
                {visibleCount < (articles?.length || 0) && (
                  <div className="text-center pt-4">
                    <Button 
                      variant="outline" 
                      onClick={handleLoadMore}
                      className="px-6 py-2 rounded-full"
                    >
                      {t("loadMore")} <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <StatsWidget />
            <PollWidget />
            <SocialMediaWidget />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
