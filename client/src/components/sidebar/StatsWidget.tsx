import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Article } from "@shared/schema";
import { useLanguage } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function StatsWidget() {
  const { currentLanguage, t } = useLanguage();
  
  // Get popular articles
  const { data: popularArticles, isLoading: articlesLoading } = useQuery<Article[]>({
    queryKey: ["/api/stats/popular-articles", currentLanguage],
    queryFn: async () => {
      const response = await fetch(`/api/stats/popular-articles?language=${currentLanguage}`);
      if (!response.ok) throw new Error('Failed to fetch popular articles');
      return response.json();
    }
  });
  
  // Get popular categories
  const { data: rawCategoryData, isLoading: categoriesLoading } = useQuery<Record<string, number>>({
    queryKey: ["/api/stats/categories", currentLanguage],
    queryFn: async () => {
      const response = await fetch(`/api/stats/categories?language=${currentLanguage}`);
      if (!response.ok) throw new Error('Failed to fetch category stats');
      return response.json();
    }
  });
  
  // Process category data into sortable array
  const popularCategories = rawCategoryData 
    ? Object.entries(rawCategoryData)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4)
    : [];
  
  // Calculate percentages for categories
  const totalArticles = popularCategories.reduce((sum, cat) => sum + cat.count, 0);
  
  if (articlesLoading || categoriesLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-5">
        <h3 className="text-lg font-bold mb-4 pb-2 border-b border-neutral-200">{t("statistics")}</h3>
        
        <div className="space-y-5">
          <div>
            <h4 className="font-bold text-sm text-neutral-500 mb-3">{t("mostPopularArticles")}</h4>
            <ol className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <li key={i} className="flex gap-3">
                  <Skeleton className="flex-shrink-0 w-6 h-6 rounded-full" />
                  <Skeleton className="h-4 flex-grow" />
                </li>
              ))}
            </ol>
          </div>
          
          <div>
            <h4 className="font-bold text-sm text-neutral-500 mb-3">{t("mostPopularCategories")}</h4>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-16 rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <h3 className="text-lg font-bold mb-4 pb-2 border-b border-neutral-200">{t("statistics")}</h3>
      
      <div className="space-y-5">
        <div>
          <h4 className="font-bold text-sm text-neutral-500 mb-3">{t("mostPopularArticles")}</h4>
          {popularArticles && popularArticles.length > 0 ? (
            <ol className="space-y-3">
              {popularArticles.map((article, index) => (
                <li key={article.id} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <Link href={`/article/${article.id}`}>
                    <a className="text-sm line-clamp-2 hover:text-secondary transition-colors">
                      {article.title}
                    </a>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-neutral-500 text-center py-2">{t("noStatsYet")}</p>
          )}
        </div>
        
        <div>
          <h4 className="font-bold text-sm text-neutral-500 mb-3">{t("mostPopularCategories")}</h4>
          {popularCategories.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {popularCategories.map(({ category, count }) => (
                <div key={category} className="bg-neutral-100 rounded p-2 text-center">
                  <p className="text-sm font-bold">{t(`categories.${category}`)}</p>
                  <p className="text-xs text-neutral-500">
                    {totalArticles > 0 ? Math.round((count / totalArticles) * 100) : 0}%
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 text-center py-2">{t("noCategoryStats")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
