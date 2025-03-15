import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertArticleSchema, Article } from "@shared/schema";
import { useLanguage } from "@/lib/i18n";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Loader2 } from "lucide-react";

// Extend the insertArticleSchema
const editArticleSchema = insertArticleSchema.extend({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  content: z.string().min(50, "Content must be at least 50 characters long"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters long"),
  coverImage: z.string().url("Please enter a valid image URL"),
});

type EditArticleFormValues = z.infer<typeof editArticleSchema>;

export default function EditArticle() {
  const [, params] = useRoute("/admin/articles/edit/:id");
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const articleId = params?.id ? parseInt(params.id) : null;
  
  // Set page title
  useEffect(() => {
    document.title = `${t("editArticle")} - Nouvèl Ayiti`;
  }, [t]);
  
  // Form setup
  const form = useForm<EditArticleFormValues>({
    resolver: zodResolver(editArticleSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      coverImage: "",
      category: "news",
      author: "",
      language: "ht",
    },
  });
  
  // Fetch article
  const { data: article, isLoading, error } = useQuery<Article>({
    queryKey: [`/api/articles/${articleId}`],
    queryFn: async () => {
      const response = await fetch(`/api/articles/${articleId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      return response.json();
    },
    enabled: !!articleId,
  });
  
  // Set form values when article data is loaded
  useEffect(() => {
    if (article) {
      form.reset({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        coverImage: article.coverImage || "",
        category: article.category,
        author: article.author,
        language: article.language,
      });
    }
  }, [article, form]);
  
  // Update article mutation
  const updateArticleMutation = useMutation({
    mutationFn: async (data: EditArticleFormValues) => {
      const res = await apiRequest("PUT", `/api/admin/articles/${articleId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${articleId}`] });
      toast({
        title: t("success"),
        description: t("articleUpdated"),
      });
      setLocation("/admin/articles");
    },
    onError: (error: Error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: EditArticleFormValues) => {
    updateArticleMutation.mutate(values);
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
  
  // If there was an error fetching the article
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-100">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-grow">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">{t("articleNotFound")}</h2>
            <p className="mb-6">{t("articleMayBeRemoved")}</p>
            <Button onClick={() => setLocation("/admin/articles")}>
              {t("backToArticles")}
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="max-w-3xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/admin/articles")}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t("back")}
              </Button>
              <h1 className="text-2xl font-bold text-primary">
                {t("editArticle")}
              </h1>
            </div>
            <p className="text-neutral-600 mt-1">
              {t("updateArticleFields")}
            </p>
          </div>
          
          {/* Edit Article Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-40 w-full" />
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Title */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("title")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Category */}
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("category")}</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t("selectCategory")} />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {t(`categories.${category}`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Author */}
                  <FormField
                    control={form.control}
                    name="author"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("author")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Language */}
                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("language")}</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t("selectLanguage")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ht">Kreyòl</SelectItem>
                              <SelectItem value="fr">Français</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Cover Image */}
                  <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("coverImage")}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://example.com/image.jpg" />
                        </FormControl>
                        <FormDescription>
                          {t("enterImageUrl")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Excerpt */}
                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("excerpt")}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={2}
                            placeholder={t("excerptPlaceholder")}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("excerptDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Content */}
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("content")}</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={10}
                            placeholder={t("contentPlaceholder")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Form Actions */}
                  <div className="flex justify-end gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setLocation("/admin/articles")}
                    >
                      {t("cancel")}
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateArticleMutation.isPending}
                    >
                      {updateArticleMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("saving")}
                        </>
                      ) : (
                        t("saveChanges")
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
