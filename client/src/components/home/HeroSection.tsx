import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Article } from "@shared/schema";
import { useLanguage, formatDate } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";

export default function HeroSection() {
  const { currentLanguage, t } = useLanguage();
  
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles", currentLanguage],
    queryFn: async () => {
      const response = await fetch(`/api/articles?language=${currentLanguage}`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    }
  });
  
  const mainArticle = articles ? articles[0] : null;
  const secondaryArticles = articles ? articles.slice(1, 3) : [];
  
  if (isLoading) {
    return (
      <section className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Featured Article Skeleton */}
          <div className="lg:col-span-8">
            <Skeleton className="h-[400px] md:h-[500px] w-full rounded-lg" />
          </div>
          
          {/* Secondary Featured Articles Skeletons */}
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-[240px] w-full rounded-lg" />
            <Skeleton className="h-[240px] w-full rounded-lg" />
          </div>
        </div>
      </section>
    );
  }
  
  if (!mainArticle) {
    return (
      <section className="mb-12">
        <div className="p-8 bg-neutral-100 rounded-lg text-center">
          <h2 className="text-xl font-bold mb-2">{t("noArticlesFound")}</h2>
          <p>{t("checkBackLater")}</p>
        </div>
      </section>
    );
  }
  
  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Featured Article */}
        <div className="lg:col-span-8 relative group">
          <Link href={`/article/${mainArticle.id}`}>
            <a className="block">
              <div className="relative overflow-hidden rounded-lg h-[400px] md:h-[500px]">
                <img 
                  src={mainArticle.coverImage || "https://images.unsplash.com/photo-1580251645806-186ce9489c97?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800&q=80"} 
                  alt={mainArticle.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <span className="inline-block mb-2 px-2 py-1 bg-secondary text-xs font-medium uppercase tracking-wider">
                    {t(`categories.${mainArticle.category}`)}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">{mainArticle.title}</h2>
                  <p className="text-neutral-200 text-sm md:text-base line-clamp-2 mb-3">{mainArticle.excerpt}</p>
                  <div className="flex items-center text-sm text-neutral-300">
                    <span>{mainArticle.author}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(mainArticle.publishedAt)}</span>
                  </div>
                </div>
              </div>
            </a>
          </Link>
        </div>
        
        {/* Secondary Featured Articles */}
        <div className="lg:col-span-4 space-y-6">
          {secondaryArticles.map(article => (
            <Link key={article.id} href={`/article/${article.id}`}>
              <a className="block group">
                <div className="relative overflow-hidden rounded-lg h-[240px]">
                  <img 
                    src={article.coverImage || `https://images.unsplash.com/photo-1533759413974-9e15f3b745ac?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80`} 
                    alt={article.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <span className="inline-block mb-2 px-2 py-1 bg-secondary text-xs font-medium uppercase tracking-wider">
                      {t(`categories.${article.category}`)}
                    </span>
                    <h3 className="text-lg font-bold leading-tight">{article.title}</h3>
                    <div className="flex items-center text-xs text-neutral-300 mt-2">
                      <span>{article.author}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              </a>
            </Link>
          ))}
          
          {/* Show placeholders if not enough articles */}
          {secondaryArticles.length < 2 && (
            <div className="relative overflow-hidden rounded-lg h-[240px] bg-neutral-100 flex items-center justify-center">
              <p className="text-neutral-500 text-center px-4">
                {t("moreArticlesSoon")}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
