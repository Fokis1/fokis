import { useEffect } from "react";
import { Link } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Article, Poll, Video } from "@shared/schema";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { 
  FileText, 
  BarChart2, 
  Video as VideoIcon, 
  Users, 
  TrendingUp,
  ArrowRight
} from "lucide-react";

export default function AdminPage() {
  const { t, currentLanguage } = useLanguage();
  const { user } = useAuth();
  
  useEffect(() => {
    document.title = `${t("adminDashboard")} - Nouvèl Ayiti`;
  }, [t]);
  
  // Get articles count by language
  const { data: articles } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
    queryFn: async () => {
      const response = await fetch(`/api/articles`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    }
  });
  
  // Get polls count by language
  const { data: polls } = useQuery<Poll[]>({
    queryKey: ["/api/polls"],
    queryFn: async () => {
      const response = await fetch(`/api/polls`);
      if (!response.ok) throw new Error('Failed to fetch polls');
      return response.json();
    }
  });
  
  // Get videos count by language
  const { data: videos } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
    queryFn: async () => {
      const response = await fetch(`/api/videos`);
      if (!response.ok) throw new Error('Failed to fetch videos');
      return response.json();
    }
  });
  
  // Count articles by category
  const articlesByCategory = articles ? 
    articles.filter(article => article.language === currentLanguage)
      .reduce((acc, article) => {
        acc[article.category] = (acc[article.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) : {};
  
  const categoryChartData = Object.entries(articlesByCategory).map(([category, count]) => ({
    category: t(`categories.${category}`),
    count
  }));
  
  // Articles by language
  const articlesByLanguage = articles ?
    articles.reduce((acc, article) => {
      acc[article.language] = (acc[article.language] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) : {};
  
  const languageChartData = [
    { name: "Kreyòl", value: articlesByLanguage["ht"] || 0 },
    { name: "Français", value: articlesByLanguage["fr"] || 0 },
    { name: "English", value: articlesByLanguage["en"] || 0 }
  ];
  
  // Articles, polls, videos counts
  const articleCount = {
    total: articles?.length || 0,
    ht: articles?.filter(a => a.language === "ht").length || 0,
    fr: articles?.filter(a => a.language === "fr").length || 0,
    en: articles?.filter(a => a.language === "en").length || 0,
  };
  
  const pollCount = {
    total: polls?.length || 0,
    ht: polls?.filter(p => p.language === "ht").length || 0,
    fr: polls?.filter(p => p.language === "fr").length || 0,
    en: polls?.filter(p => p.language === "en").length || 0,
  };
  
  const videoCount = {
    total: videos?.length || 0,
    ht: videos?.filter(v => v.language === "ht").length || 0,
    fr: videos?.filter(v => v.language === "fr").length || 0,
    en: videos?.filter(v => v.language === "en").length || 0,
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col gap-6">
          {/* Admin Welcome */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-primary">{t("adminDashboard")}</h1>
            <p className="text-neutral-600 mt-2">
              {t("adminWelcome")}, {user?.username}
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" /> {t("articlesManagement")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 mb-4">{t("totalArticles")}: {articleCount.total}</p>
                <Link href="/admin/articles">
                  <Button className="w-full">
                    {t("manage")} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <BarChart2 className="mr-2 h-5 w-5" /> {t("pollsManagement")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 mb-4">{t("totalPolls")}: {pollCount.total}</p>
                <Link href="/admin/polls">
                  <Button className="w-full">
                    {t("manage")} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <VideoIcon className="mr-2 h-5 w-5" /> {t("videosManagement")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-600 mb-4">{t("totalVideos")}: {videoCount.total}</p>
                <Link href="/admin/videos">
                  <Button className="w-full">
                    {t("manage")} <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
          
          {/* Stats Tabs */}
          <Tabs defaultValue="articles" className="w-full mt-6">
            <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6">
              <TabsTrigger value="articles">{t("articleStats")}</TabsTrigger>
              <TabsTrigger value="polls">{t("pollStats")}</TabsTrigger>
              <TabsTrigger value="languages">{t("languages")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="articles">
              <Card>
                <CardHeader>
                  <CardTitle>{t("articleStats")}</CardTitle>
                  <CardDescription>{t("mostPopularCategories")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {categoryChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryChartData}>
                          <XAxis dataKey="category" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#1A365D" name={t("articles")} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <p className="text-neutral-500">{t("noStatsYet")}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="polls">
              <Card>
                <CardHeader>
                  <CardTitle>{t("pollStats")}</CardTitle>
                  <CardDescription>{t("activePollsByLanguage")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border">
                      <h3 className="text-lg font-medium mb-2">Kreyòl</h3>
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-primary mr-3" />
                        <div>
                          <p className="text-2xl font-bold">{pollCount.ht}</p>
                          <p className="text-sm text-neutral-500">{t("polls")}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border">
                      <h3 className="text-lg font-medium mb-2">Français</h3>
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-primary mr-3" />
                        <div>
                          <p className="text-2xl font-bold">{pollCount.fr}</p>
                          <p className="text-sm text-neutral-500">{t("polls")}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border">
                      <h3 className="text-lg font-medium mb-2">English</h3>
                      <div className="flex items-center">
                        <Users className="h-8 w-8 text-primary mr-3" />
                        <div>
                          <p className="text-2xl font-bold">{pollCount.en}</p>
                          <p className="text-sm text-neutral-500">{t("polls")}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="languages">
              <Card>
                <CardHeader>
                  <CardTitle>{t("languageStats")}</CardTitle>
                  <CardDescription>{t("contentByLanguage")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={languageChartData}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#1A365D" name={t("articles")} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Recent Activity */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" /> {t("recentActivity")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {articles && articles.length > 0 ? (
                <div className="space-y-4">
                  {articles.slice(0, 5).map(article => (
                    <div key={article.id} className="flex items-center justify-between border-b pb-3">
                      <div>
                        <p className="font-medium">{article.title}</p>
                        <p className="text-sm text-neutral-500">
                          {new Date(article.publishedAt).toLocaleDateString()} - {article.author}
                        </p>
                      </div>
                      <Link href={`/admin/articles/edit/${article.id}`}>
                        <Button variant="outline" size="sm">
                          {t("edit")}
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-neutral-500">{t("noRecentActivity")}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
