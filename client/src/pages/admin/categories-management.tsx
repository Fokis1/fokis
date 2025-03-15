
import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/components/ui/use-toast";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
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
import { apiRequest } from "@/lib/api";

export default function CategoriesManagement() {
  const { t, currentLanguage } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", label: "" });

  useEffect(() => {
    document.title = `${t("categoriesManagement")} - Nouvèl Ayiti`;
  }, [t]);

  // Fetch categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ["/api/admin/categories", currentLanguage],
    queryFn: async () => {
      const response = await fetch(`/api/admin/categories?language=${currentLanguage}`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    }
  });

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/categories", {
        name: newCategory.name,
        label: newCategory.label,
        language: currentLanguage
      });
    },
    onSuccess: () => {
      setNewCategory({ name: "", label: "" });
      toast({
        title: t("success"),
        description: t("categoryCreated"),
      });
    }
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/categories/${id}`);
    },
    onSuccess: () => {
      toast({
        title: t("success"),
        description: t("categoryDeleted"),
      });
    }
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">{t("categoriesManagement")}</h1>
          <p className="text-neutral-600 mt-1">{t("manageCategoriesDescription")}</p>
        </div>
      </div>

      {/* Add Category Form */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">{t("addNewCategory")}</h2>
        <div className="flex gap-4">
          <Input
            placeholder={t("categoryName")}
            value={newCategory.name}
            onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
          />
          <Input
            placeholder={t("categoryLabel")}
            value={newCategory.label}
            onChange={(e) => setNewCategory(prev => ({ ...prev, label: e.target.value }))}
          />
          <Button onClick={() => createMutation.mutate()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {t("addCategory")}
          </Button>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">{t("categories")}</h2>
          {isLoading ? (
            <div>{t("loading")}</div>
          ) : (
            <div className="space-y-4">
              {categories?.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded">
                  <div>
                    <div className="font-medium">{category.label}</div>
                    <div className="text-sm text-neutral-600">{category.name}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={() => setDeleteCategoryId(category.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteCategoryId !== null} onOpenChange={() => setDeleteCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteCategoryConfirmation")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (deleteCategoryId) {
                deleteMutation.mutate(deleteCategoryId);
                setDeleteCategoryId(null);
              }
            }}>
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
