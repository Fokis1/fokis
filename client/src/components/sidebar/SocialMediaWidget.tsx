import { useLanguage } from "@/lib/i18n";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function SocialMediaWidget() {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <h3 className="text-lg font-bold mb-4 pb-2 border-b border-neutral-200">{t("followUs")}</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <a 
          href="https://facebook.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center py-3 rounded bg-[#4267B2] text-white font-medium transition-opacity hover:opacity-90"
        >
          <Facebook className="mr-2 h-4 w-4" /> Facebook
        </a>
        <a 
          href="https://twitter.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center py-3 rounded bg-[#1DA1F2] text-white font-medium transition-opacity hover:opacity-90"
        >
          <Twitter className="mr-2 h-4 w-4" /> Twitter
        </a>
        <a 
          href="https://instagram.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center py-3 rounded bg-[#E1306C] text-white font-medium transition-opacity hover:opacity-90"
        >
          <Instagram className="mr-2 h-4 w-4" /> Instagram
        </a>
        <a 
          href="https://youtube.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center py-3 rounded bg-[#FF0000] text-white font-medium transition-opacity hover:opacity-90"
        >
          <Youtube className="mr-2 h-4 w-4" /> YouTube
        </a>
      </div>
    </div>
  );
}
