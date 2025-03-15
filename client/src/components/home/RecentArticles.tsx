import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Article } from "@shared/schema";
import { useLanguage, formatDate } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown, Eye, MessageSquare } from "lucide-react";

export default function RecentArticles() {
  const { currentLanguage, t } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(3);
  
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles", currentLanguage],
    queryFn: async () => {
      const response = await fetch(`/api/articles?language=${currentLanguage}`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    }
  });
  
  // Skip the first 3 articles (shown in hero section)
  const recentArticles = articles ? articles.slice(3) : [];
  
  // Load more articles handler
  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + 3);
  };
  
  // Reset visible count when language changes
  useEffect(() => {
    setVisibleCount(3);
  }, [currentLanguage]);
  
  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{t("recentNews")}</h2>
        </div>
        
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
      </section>
    );
  }
  
  if (recentArticles.length === 0) {
    return (
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{t("recentNews")}</h2>
        </div>
        
        <div className="p-8 bg-white rounded-lg shadow-sm text-center">
          <h3 className="text-lg font-medium mb-2">{t("noMoreArticles")}</h3>
          <p className="text-neutral-600">{t("checkBackForUpdates")}</p>
        </div>
      </section>
    );
  }
  
  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{t("recentNews")}</h2>
        <Link href="/category/news">
          <a className="text-sm text-secondary font-medium hover:underline">
            {t("seeAll")} <ChevronDown className="ml-1 h-4 w-4 inline" />
          </a>
        </Link>
      </div>
      
      <div className="space-y-8">
        {recentArticles.slice(0, visibleCount).map(article => (
          <article key={article.id} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-1/3 relative h-48 md:h-auto">
              <img 
                src={article.coverImage || `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300&q=80`} 
                alt={article.title} 
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 px-2 py-1 bg-secondary text-white text-xs font-medium uppercase tracking-wider">
                {t(`categories.${article.category}`)}
              </span>
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
        
        {visibleCount < recentArticles.length && (
          <div className="text-center pt-4">
            <Button 
              variant="outline" 
              onClick={handleLoadMore}
              className="px-6 py-2 rounded-full"
            >
              {t("moreNews")} <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
