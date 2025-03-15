import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import RecentArticles from "@/components/home/RecentArticles";
import VideoSection from "@/components/home/VideoSection";
import PollWidget from "@/components/sidebar/PollWidget";
import StatsWidget from "@/components/sidebar/StatsWidget";
import SocialMediaWidget from "@/components/sidebar/SocialMediaWidget";
import { useLanguage } from "@/lib/i18n";

export default function HomePage() {
  const { t } = useLanguage();
  
  // Update page title when language changes
  useEffect(() => {
    document.title = `Nouvèl Ayiti - ${t("home")}`;
  }, [t]);
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <HeroSection />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Articles Column */}
          <div className="lg:col-span-8">
            <RecentArticles />
            <VideoSection />
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <PollWidget />
            <StatsWidget />
            <SocialMediaWidget />
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Admin Login Button (Fixed) */}
      <div className="fixed bottom-6 right-6">
        <a 
          href="/auth" 
          className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary-dark transition-colors"
          title={t("adminLogin")}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </a>
      </div>
    </div>
  );
}
