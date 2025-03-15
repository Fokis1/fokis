import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Video } from "@shared/schema";
import { useLanguage } from "@/lib/i18n";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Play } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export default function VideoSection() {
  const { currentLanguage, t } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  
  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos", currentLanguage],
    queryFn: async () => {
      const response = await fetch(`/api/videos?language=${currentLanguage}`);
      if (!response.ok) throw new Error('Failed to fetch videos');
      return response.json();
    }
  });
  
  if (isLoading) {
    return (
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{t("videos")}</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i}>
              <Skeleton className="aspect-video w-full rounded-lg mb-3" />
              <Skeleton className="h-5 w-4/5 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      </section>
    );
  }
  
  if (!videos || videos.length === 0) {
    return (
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{t("videos")}</h2>
        </div>
        
        <div className="p-8 bg-white rounded-lg shadow-sm text-center">
          <h3 className="text-lg font-medium mb-2">{t("noVideosYet")}</h3>
          <p className="text-neutral-600">{t("videosComingSoon")}</p>
        </div>
      </section>
    );
  }
  
  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">{t("videos")}</h2>
        <a href="#" className="text-sm text-secondary font-medium hover:underline">
          {t("seeAll")} <ChevronRight className="ml-1 h-4 w-4 inline" />
        </a>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.slice(0, 2).map(video => (
          <Dialog key={video.id}>
            <DialogTrigger asChild>
              <div className="group cursor-pointer" onClick={() => setSelectedVideo(video)}>
                <div className="relative overflow-hidden rounded-lg aspect-video">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="h-8 w-8 text-white" fill="white" />
                    </div>
                  </div>
                  <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    {video.duration}
                  </span>
                </div>
                <h3 className="mt-3 font-bold group-hover:text-secondary transition-colors">
                  {video.title}
                </h3>
                <p className="text-sm text-neutral-500 mt-1">
                  {new Date(video.publishedAt).toLocaleDateString()}
                </p>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
              <div className="aspect-video w-full">
                <iframe 
                  src={video.videoUrl} 
                  title={video.title}
                  className="w-full h-full"
                  allowFullScreen
                ></iframe>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </section>
  );
}
