import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { Article } from "@shared/schema";
import { formatDate } from "@/lib/i18n";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Calendar, User, Search, BookMarked, Filter } from "lucide-react";

export default function BlogPage() {
  const { t, currentLanguage } = useLanguage();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sort, setSort] = useState("newest");

  // Fetch all articles that are in the "blog" category
  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles", { language: currentLanguage, category: "blog" }],
  });

  // Filter articles based on search query and active subcategory
  const filteredArticles = articles.filter(article => {
    const matchesSearch = searchQuery === "" || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = activeCategory === "all" || article.category.toLowerCase() === activeCategory.toLowerCase();
    
    return matchesSearch && matchesCategory;
  });

  // Sort filtered articles
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    if (sort === "newest") {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    } else if (sort === "oldest") {
      return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
    } else if (sort === "popular") {
      return b.viewCount - a.viewCount;
    }
    return 0;
  });

  // Get list of subcategories from filtered articles
  const subcategories = Array.from(new Set(articles.map(article => article.category)));

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-4">
        {/* Blog Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl md:text-4xl font-bold">{t("categories.blog")}</h1>
          <p className="text-neutral-600 text-lg max-w-3xl">
            Eksplore dènye analiz ak opinyon sou aktyalite Ayiti ak mond lan. Jwenn pèspektiv divès ekspè ak jounalis nou yo.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
            <Input
              placeholder={t("search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tags/Categories */}
        <div className="flex flex-wrap gap-2 py-2">
          <Button 
            variant={activeCategory === "all" ? "default" : "outline"} 
            size="sm"
            onClick={() => setActiveCategory("all")}
          >
            All
          </Button>
          {subcategories.map(category => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        <Separator className="my-2" />

        {/* Blog Posts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-neutral-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-6 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : sortedArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedArticles.map(article => (
              <Card key={article.id} className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                {article.coverImage && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={article.coverImage} 
                      alt={article.title} 
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader className="flex-grow">
                  <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                      {article.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(article.publishedAt)}
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">
                    <Link href={`/article/${article.id}`}>
                      <a className="hover:text-primary transition-colors">
                        {article.title}
                      </a>
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-3 mt-2">
                    {article.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-between border-t pt-4">
                  <div className="flex items-center text-sm text-neutral-500">
                    <User className="h-3 w-3 mr-1" />
                    {article.author}
                  </div>
                  <div className="flex items-center text-sm text-neutral-500">
                    <BookMarked className="h-3 w-3 mr-1" />
                    {article.viewCount} {t("views")}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-neutral-400 mb-4">
              <BookMarked className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-1">{t("noArticlesFound")}</h3>
              <p>{t("checkBackLater")}</p>
            </div>
            <Button onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
            }}>
              {t("clearFilters")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}