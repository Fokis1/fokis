import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Poll, Vote } from "@shared/schema";
import { useLanguage } from "@/lib/i18n";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function PollWidget() {
  const { currentLanguage, t } = useLanguage();
  const { toast } = useToast();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  
  // Get active poll
  const { data: polls, isLoading } = useQuery<Poll[]>({
    queryKey: ["/api/polls", currentLanguage],
    queryFn: async () => {
      const response = await fetch(`/api/polls?language=${currentLanguage}`);
      if (!response.ok) throw new Error('Failed to fetch polls');
      return response.json();
    }
  });
  
  // Get the first active poll
  const activePoll = polls?.find(poll => poll.active);
  
  // Reset state when language changes
  useEffect(() => {
    setSelectedOption(null);
    setHasVoted(false);
  }, [currentLanguage]);
  
  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ pollId, option }: Vote) => {
      const res = await apiRequest("POST", "/api/polls/vote", { pollId, option });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls", currentLanguage] });
      setHasVoted(true);
      toast({
        title: t("thankYou"),
        description: t("voteRecorded"),
      });
    },
    onError: (error: Error) => {
      toast({
        title: t("voteFailed"),
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle poll submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePoll || !selectedOption) return;
    
    voteMutation.mutate({
      pollId: activePoll.id,
      option: selectedOption
    });
  };
  
  // Calculate percentage for results
  const calculatePercentage = (option: string) => {
    if (!activePoll) return 0;
    
    const totalVotes = Object.values(activePoll.results).reduce((sum, count) => sum + count, 0);
    if (totalVotes === 0) return 0;
    
    return Math.round((activePoll.results[option] || 0) / totalVotes * 100);
  };
  
  // Calculate total votes
  const totalVotes = activePoll 
    ? Object.values(activePoll.results).reduce((sum, count) => sum + count, 0)
    : 0;
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-5">
        <h3 className="text-lg font-bold mb-4 pb-2 border-b border-neutral-200">{t("poll")}</h3>
        <Skeleton className="h-5 w-4/5 mb-4" />
        <div className="space-y-3 mb-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center">
              <Skeleton className="h-4 w-4 mr-3" />
              <Skeleton className="h-4 flex-grow" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }
  
  if (!activePoll) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-5">
        <h3 className="text-lg font-bold mb-4 pb-2 border-b border-neutral-200">{t("poll")}</h3>
        <p className="text-center py-4 text-neutral-600">{t("noPollsActive")}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <h3 className="text-lg font-bold mb-4 pb-2 border-b border-neutral-200">{t("poll")}</h3>
      
      <div>
        <h4 className="font-bold mb-3">{activePoll.question}</h4>
        
        {!hasVoted ? (
          <form className="space-y-3" onSubmit={handleSubmit}>
            <RadioGroup value={selectedOption || ""} onValueChange={setSelectedOption}>
              {activePoll.options.map((option) => (
                <div key={option} className="flex items-center">
                  <RadioGroupItem id={option} value={option} className="mr-3" />
                  <Label htmlFor={option} className="text-neutral-700 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            <Button 
              type="submit" 
              className="w-full py-2 mt-2" 
              disabled={!selectedOption || voteMutation.isPending}
            >
              {voteMutation.isPending ? t("voting") : t("vote")}
            </Button>
          </form>
        ) : (
          <div className="mt-6">
            <h5 className="font-bold text-sm text-neutral-500 mb-3">{t("currentResults")}</h5>
            
            {activePoll.options.map((option) => {
              const percentage = calculatePercentage(option);
              return (
                <div key={option} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{option}</span>
                    <span>{percentage}%</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
            
            <p className="text-xs text-neutral-500 mt-4">
              {t("basedOnVotes", { count: totalVotes })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
