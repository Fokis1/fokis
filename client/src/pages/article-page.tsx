import { useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Article } from "@shared/schema";
import { useLanguage, formatDate } from "@/lib/i18n";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StatsWidget from "@/components/sidebar/StatsWidget";
import PollWidget from "@/components/sidebar/PollWidget";
import SocialMediaWidget from "@/components/sidebar/SocialMediaWidget";
import { Eye, MessageSquare, Facebook, Twitter, Link as LinkIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function ArticlePage() {
  const [, params] = useRoute("/article/:id");
  const { currentLanguage, t } = useLanguage();
  const { toast } = useToast();
  const articleId = params?.id ? parseInt(params.id) : null;
  
  const { data: article, isLoading, error } = useQuery<Article>({
    queryKey: [`/api/articles/${articleId}`, currentLanguage],
    queryFn: async () => {
      const response = await fetch(`/api/articles/${articleId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      return response.json();
    },
    enabled: !!articleId
  });
  
  // Update page title when article loads
  useEffect(() => {
    if (article) {
      document.title = `${article.title} - Nouvèl Ayiti`;
    }
  }, [article]);
  
  // Share article functions
  const shareUrl = window.location.href;
  
  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };
  
  const shareOnTwitter = () => {
    const text = article?.title || '';
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
  };
  
  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: t("linkCopied"),
        description: t("linkCopiedMessage")
      });
    });
  };
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-100">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">{t("articleNotFound")}</h2>
            <p className="mb-6">{t("articleMayBeRemoved")}</p>
            <Button onClick={() => window.history.back()}>
              {t("goBack")}
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Article Content */}
          <div className="lg:col-span-8">
            {isLoading ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <Skeleton className="h-10 w-3/4 mb-4" />
                <div className="flex items-center justify-between mb-6">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-80 w-full mb-6" />
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ) : article ? (
              <article className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Article Header */}
                <div className="p-6">
                  <span className="inline-block mb-3 px-3 py-1 bg-secondary text-white text-xs font-medium uppercase tracking-wider rounded-full">
                    {t(`categories.${article.category}`)}
                  </span>
                  <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
                  <div className="flex flex-wrap items-center justify-between text-sm text-neutral-600 mb-6">
                    <div className="flex items-center mb-2 md:mb-0">
                      <span className="font-medium">{article.author}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="flex items-center mr-4">
                        <Eye className="h-4 w-4 mr-1" /> {article.viewCount}
                      </span>
                      <span className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" /> {article.commentCount}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Featured Image */}
                {article.coverImage && (
                  <div className="relative h-[400px] w-full">
                    <img 
                      src={article.coverImage} 
                      alt={article.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Article Content */}
                <div className="p-6">
                  <div className="prose prose-lg max-w-none">
                    {article.content.split('\n').map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))}
                  </div>
                  
                  {/* Share Buttons */}
                  <div className="mt-8 pt-6 border-t border-neutral-200">
                    <h4 className="font-bold mb-3">{t("shareArticle")}</h4>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={shareOnFacebook}>
                        <Facebook className="h-4 w-4 mr-2" /> Facebook
                      </Button>
                      <Button variant="outline" size="sm" onClick={shareOnTwitter}>
                        <Twitter className="h-4 w-4 mr-2" /> Twitter
                      </Button>
                      <Button variant="outline" size="sm" onClick={copyLink}>
                        <LinkIcon className="h-4 w-4 mr-2" /> {t("copyLink")}
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ) : null}
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
