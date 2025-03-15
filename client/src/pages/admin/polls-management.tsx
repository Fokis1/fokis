import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertPollSchema, Poll } from "@shared/schema";
import { useLanguage } from "@/lib/i18n";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Loader2,
  Edit,
  Eye,
  PlusCircle,
  X,
} from "lucide-react";

// Extend schema for the poll form
const createPollSchema = z.object({
  question: z.string().min(5, "Question must be at least 5 characters"),
  options: z.array(z.string()).min(2, "At least 2 options are required"),
  language: z.string(),
  active: z.boolean(),
});

type CreatePollFormValues = z.infer<typeof createPollSchema>;

export default function PollsManagement() {
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [deletePollId, setDeletePollId] = useState<number | null>(null);
  const [currentPoll, setCurrentPoll] = useState<Poll | null>(null);
  const [pollOptions, setPollOptions] = useState<string[]>([""]);
  
  // Set page title
  useEffect(() => {
    document.title = `${t("pollsManagement")} - Nouvèl Ayiti`;
  }, [t]);
  
  // Form setup
  const form = useForm<CreatePollFormValues>({
    resolver: zodResolver(createPollSchema),
    defaultValues: {
      question: "",
      options: [""],
      language: currentLanguage,
      active: true,
    },
  });
  
  // Fetch polls
  const { data: polls, isLoading } = useQuery<Poll[]>({
    queryKey: ["/api/polls", currentLanguage],
    queryFn: async () => {
      const response = await fetch(`/api/polls?language=${currentLanguage}`);
      if (!response.ok) throw new Error('Failed to fetch polls');
      return response.json();
    }
  });
  
  // Create poll mutation
  const createPollMutation = useMutation({
    mutationFn: async (data: CreatePollFormValues) => {
      const res = await apiRequest("POST", "/api/admin/polls", {
        question: data.question,
        options: data.options.filter(opt => opt.trim() !== ""),
        language: data.language,
        active: data.active,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: t("success"),
        description: t("pollCreated"),
      });
      setIsCreateDialogOpen(false);
      form.reset();
      setPollOptions([""]);
    },
    onError: (error: Error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update poll mutation
  const updatePollMutation = useMutation({
    mutationFn: async (data: { id: number; poll: Partial<CreatePollFormValues> }) => {
      const res = await apiRequest("PUT", `/api/admin/polls/${data.id}`, data.poll);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: t("success"),
        description: t("pollUpdated"),
      });
      setIsEditDialogOpen(false);
      setCurrentPoll(null);
    },
    onError: (error: Error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete poll mutation
  const deletePollMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/polls/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
      toast({
        title: t("success"),
        description: t("pollDeleted"),
      });
      setDeletePollId(null);
    },
    onError: (error: Error) => {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission for creating a poll
  const onSubmit = (values: CreatePollFormValues) => {
    const filteredOptions = values.options.filter(opt => opt.trim() !== "");
    if (filteredOptions.length < 2) {
      toast({
        title: t("error"),
        description: t("minimumTwoOptions"),
        variant: "destructive",
      });
      return;
    }
    
    createPollMutation.mutate({
      ...values,
      options: filteredOptions,
    });
  };
  
  // Handle form submission for updating a poll
  const onUpdateSubmit = (values: CreatePollFormValues) => {
    if (!currentPoll) return;
    
    const filteredOptions = values.options.filter(opt => opt.trim() !== "");
    if (filteredOptions.length < 2) {
      toast({
        title: t("error"),
        description: t("minimumTwoOptions"),
        variant: "destructive",
      });
      return;
    }
    
    updatePollMutation.mutate({
      id: currentPoll.id,
      poll: {
        ...values,
        options: filteredOptions,
      },
    });
  };
  
  // Handle adding a new option
  const addOption = () => {
    setPollOptions([...pollOptions, ""]);
    form.setValue("options", [...form.getValues("options"), ""]);
  };
  
  // Handle removing an option
  const removeOption = (index: number) => {
    const newOptions = [...pollOptions];
    newOptions.splice(index, 1);
    setPollOptions(newOptions);
    
    const formOptions = form.getValues("options");
    formOptions.splice(index, 1);
    form.setValue("options", formOptions);
  };
  
  // Handle editing a poll
  const handleEditPoll = (poll: Poll) => {
    setCurrentPoll(poll);
    form.reset({
      question: poll.question,
      options: poll.options,
      language: poll.language,
      active: poll.active,
    });
    setPollOptions(poll.options);
    setIsEditDialogOpen(true);
  };
  
  // Handle viewing poll results
  const handleViewResults = (poll: Poll) => {
    setCurrentPoll(poll);
    setIsViewDialogOpen(true);
  };
  
  // Calculate percentage for poll results
  const calculatePercentage = (poll: Poll, option: string) => {
    const totalVotes = Object.values(poll.results).reduce((sum, count) => sum + count, 0);
    if (totalVotes === 0) return 0;
    
    return Math.round((poll.results[option] || 0) / totalVotes * 100);
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (deletePollId !== null) {
      deletePollMutation.mutate(deletePollId);
    }
  };
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!isCreateDialogOpen && !isEditDialogOpen) {
      form.reset();
      setPollOptions([""]);
    }
  }, [isCreateDialogOpen, isEditDialogOpen, form]);
  
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
                <h1 className="text-2xl font-bold text-primary">{t("pollsManagement")}</h1>
              </div>
              <p className="text-neutral-600 mt-1">
                {t("managePollsDescription")}
              </p>
            </div>
            
            <div className="flex gap-4 items-center">
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
              
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("createNewPoll")}
              </Button>
            </div>
          </div>
          
          {/* Polls List */}
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : !polls || polls.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-xl font-medium mb-2">{t("noPollsFound")}</h2>
              <p className="text-neutral-600 mb-6">
                {t("createYourFirstPoll")}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t("createNewPoll")}
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("question")}</TableHead>
                    <TableHead>{t("options")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead>{t("responses")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {polls.map((poll) => (
                    <TableRow key={poll.id}>
                      <TableCell className="font-medium">{poll.question}</TableCell>
                      <TableCell>{poll.options.join(", ")}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className={`h-2 w-2 rounded-full mr-2 ${poll.active ? "bg-green-500" : "bg-red-500"}`}></span>
                          {poll.active ? t("active") : t("inactive")}
                        </div>
                      </TableCell>
                      <TableCell>
                        {Object.values(poll.results).reduce((a, b) => a + b, 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewResults(poll)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditPoll(poll)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => setDeletePollId(poll.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        
        {/* Create Poll Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("createNewPoll")}</DialogTitle>
              <DialogDescription>
                {t("createPollDescription")}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("question")}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t("pollQuestionPlaceholder")} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                
                <div>
                  <FormLabel>{t("options")}</FormLabel>
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2 mt-2">
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...pollOptions];
                          newOptions[index] = e.target.value;
                          setPollOptions(newOptions);
                          
                          const formOptions = form.getValues("options");
                          formOptions[index] = e.target.value;
                          form.setValue("options", formOptions);
                        }}
                        placeholder={`${t("option")} ${index + 1}`}
                      />
                      {pollOptions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="mt-2"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    {t("addOption")}
                  </Button>
                </div>
                
                <FormField
                  control={form.control}
                  name="active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>{t("activeStatus")}</FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    {t("cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={createPollMutation.isPending}
                  >
                    {createPollMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("creating")}
                      </>
                    ) : (
                      t("createPoll")
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        {/* Edit Poll Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("editPoll")}</DialogTitle>
              <DialogDescription>
                {t("editPollDescription")}
              </DialogDescription>
            </DialogHeader>
            {currentPoll && (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onUpdateSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("question")}</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder={t("pollQuestionPlaceholder")} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                  
                  <div>
                    <FormLabel>{t("options")}</FormLabel>
                    {pollOptions.map((option, index) => (
                      <div key={index} className="flex items-center gap-2 mt-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...pollOptions];
                            newOptions[index] = e.target.value;
                            setPollOptions(newOptions);
                            
                            const formOptions = form.getValues("options");
                            formOptions[index] = e.target.value;
                            form.setValue("options", formOptions);
                          }}
                          placeholder={`${t("option")} ${index + 1}`}
                        />
                        {pollOptions.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                      className="mt-2"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {t("addOption")}
                    </Button>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>{t("activeStatus")}</FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                    >
                      {t("cancel")}
                    </Button>
                    <Button
                      type="submit"
                      disabled={updatePollMutation.isPending}
                    >
                      {updatePollMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t("saving")}
                        </>
                      ) : (
                        t("saveChanges")
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            )}
          </DialogContent>
        </Dialog>
        
        {/* View Poll Results Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("pollResults")}</DialogTitle>
              <DialogDescription>
                {currentPoll?.question}
              </DialogDescription>
            </DialogHeader>
            {currentPoll && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold mb-2">{t("currentResults")}</h4>
                  {currentPoll.options.map((option) => {
                    const percentage = calculatePercentage(currentPoll, option);
                    const votes = currentPoll.results[option] || 0;
                    
                    return (
                      <div key={option} className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>{option}</span>
                          <span>{percentage}% ({votes})</span>
                        </div>
                        <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                  
                  <p className="text-xs text-neutral-500 mt-4">
                    {t("basedOnVotes", {
                      count: Object.values(currentPoll.results).reduce((a, b) => a + b, 0),
                    })}
                  </p>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">{t("status")}</span>
                    <div className="flex items-center">
                      <span className={`h-2 w-2 rounded-full mr-2 ${currentPoll.active ? "bg-green-500" : "bg-red-500"}`}></span>
                      {currentPoll.active ? t("active") : t("inactive")}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">{t("language")}</span>
                    <span>
                      {currentPoll.language === "ht"
                        ? "Kreyòl"
                        : currentPoll.language === "fr"
                        ? "Français"
                        : "English"}
                    </span>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button onClick={() => setIsViewDialogOpen(false)}>
                    {t("close")}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={deletePollId !== null}
          onOpenChange={(open) => !open && setDeletePollId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("deletePollWarning")}
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
