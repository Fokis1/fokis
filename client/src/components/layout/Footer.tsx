import { Link } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  const { t, currentLanguage, setLanguage } = useLanguage();
  
  const categories = [
    { id: "news", label: t("categories.news") },
    { id: "politics", label: t("categories.politics") },
    { id: "culture", label: t("categories.culture") },
    { id: "sports", label: t("categories.sports") },
    { id: "health", label: t("categories.health") },
    { id: "economy", label: t("categories.economy") }
  ];
  
  const languages = [
    { id: "ht", label: "Kreyòl", flag: "🇭🇹" },
    { id: "fr", label: "Français", flag: "🇫🇷" },
    { id: "en", label: "English", flag: "🇺🇸" }
  ];
  
  return (
    <footer className="bg-primary text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h4 className="text-xl font-bold mb-6">FOKIS</h4>
            <p className="text-neutral-300 mb-6">{t("footerDescription")}</p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">{t("categories.title")}</h4>
            <ul className="space-y-3">
              {categories.map(category => (
                <li key={category.id}>
                  <Link href={category.id === "news" ? "/" : `/category/${category.id}`}>
                    <a className="text-neutral-300 hover:text-white transition-colors">
                      {category.label}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">{t("languages")}</h4>
            <ul className="space-y-3">
              {languages.map(lang => (
                <li key={lang.id}>
                  <button 
                    onClick={() => setLanguage(lang.id as "ht" | "fr" | "en")} 
                    className="text-neutral-300 hover:text-white transition-colors flex items-center"
                  >
                    <span className="w-6 h-6 inline-block mr-2">{lang.flag}</span> {lang.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-bold mb-6">{t("information")}</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/contact">
                  <a className="text-neutral-300 hover:text-white transition-colors">
                    {t("contactUs")}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="text-neutral-300 hover:text-white transition-colors">
                    {t("team")}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/advertise">
                  <a className="text-neutral-300 hover:text-white transition-colors">
                    {t("advertising")}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="text-neutral-300 hover:text-white transition-colors">
                    {t("privacy")}
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/terms">
                  <a className="text-neutral-300 hover:text-white transition-colors">
                    {t("terms")}
                  </a>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-400 text-sm">&copy; {new Date().getFullYear()} FOKIS. {t("allRightsReserved")}</p>
          <div className="mt-4 md:mt-0">
            <Link href="/privacy">
              <a className="text-neutral-400 hover:text-white transition-colors text-sm mx-3">
                {t("privacy")}
              </a>
            </Link>
            <Link href="/terms">
              <a className="text-neutral-400 hover:text-white transition-colors text-sm mx-3">
                {t("terms")}
              </a>
            </Link>
            <Link href="/contact">
              <a className="text-neutral-400 hover:text-white transition-colors text-sm mx-3">
                {t("contact")}
              </a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
