import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Article } from "@shared/schema";
import { useLanguage, formatDate } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PlusCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
  ArrowLeft,
} from "lucide-react";

export default function ArticlesManagement() {
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [deleteArticleId, setDeleteArticleId] = useState<number | null>(null);
  
  useEffect(() => {
    document.title = `${t("articlesManagement")} - Nouvèl Ayiti`;
  }, [t]);
  
  // Fetch articles
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles", currentLanguage],
    queryFn: async () => {
      const response = await fetch(`/api/articles?language=${currentLanguage}`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      return response.json();
    }
  });
  
  // Delete article mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/articles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      toast({
        title: t("success"),
        description: t("articleDeleted"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (deleteArticleId !== null) {
      deleteMutation.mutate(deleteArticleId);
      setDeleteArticleId(null);
    }
  };
  
  // Categories from schema
  const categories = [
    "news",
    "politics",
    "culture",
    "sports",
    "health",
    "economy",
  ];
  
  // Filter articles by search query and category
  const filteredArticles = articles
    ? articles.filter((article) => {
        const matchesSearch = 
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
          
        const matchesCategory = 
          selectedCategory === "all" || article.category === selectedCategory;
          
        return matchesSearch && matchesCategory;
      })
    : [];
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex flex-col gap-6">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/admin")}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  {t("back")}
                </Button>
                <h1 className="text-2xl font-bold text-primary">{t("articlesManagement")}</h1>
              </div>
              <p className="text-neutral-600 mt-1">
                {t("manageArticlesDescription")}
              </p>
            </div>
            
            <Link href="/admin/articles/create">
              <Button className="whitespace-nowrap">
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("createNewArticle")}
              </Button>
            </Link>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder={t("searchArticles")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-4">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("allCategories")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allCategories")}</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {t(`categories.${category}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select
                value={currentLanguage}
                onValueChange={(value) => setLanguage(value as "ht" | "fr" | "en")}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("language")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ht">Kreyòl</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Articles Table */}
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : filteredArticles.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-xl font-medium mb-2">{t("noArticlesFound")}</h2>
              <p className="text-neutral-600 mb-6">
                {searchQuery || selectedCategory !== "all"
                  ? t("tryDifferentFilters")
                  : t("createYourFirstArticle")}
              </p>
              {!(searchQuery || selectedCategory !== "all") && (
                <Link href="/admin/articles/create">
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {t("createNewArticle")}
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("title")}</TableHead>
                    <TableHead>{t("category")}</TableHead>
                    <TableHead>{t("author")}</TableHead>
                    <TableHead>{t("publishDate")}</TableHead>
                    <TableHead>{t("views")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium">{article.title}</TableCell>
                      <TableCell>{t(`categories.${article.category}`)}</TableCell>
                      <TableCell>{article.author}</TableCell>
                      <TableCell>{formatDate(article.publishedAt)}</TableCell>
                      <TableCell>{article.viewCount}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">{t("openMenu")}</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => setLocation(`/article/${article.id}`)}
                            >
                              {t("view")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setLocation(`/admin/articles/edit/${article.id}`)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              {t("edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setDeleteArticleId(article.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deleteArticleId !== null}
          onOpenChange={(open) => !open && setDeleteArticleId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("deleteArticleWarning")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
              >
                {t("delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
