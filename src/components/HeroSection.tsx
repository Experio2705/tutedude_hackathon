import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-image.jpg";
import { useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-brand-gradient opacity-5"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-gradient-light border">
              <span className="text-sm font-medium text-primary">📈 {t('trustedMarketplace')}</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              {t('heroTitle').split(' ').map((word, index) => {
                if (word === 'Verified' || word === 'सत्यापित') {
                  return (
                    <span key={index} className="text-transparent bg-clip-text bg-brand-gradient">
                      {word}{' '}
                    </span>
                  );
                }
                return `${word} `;
              })}
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              {t('heroSubtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-brand-gradient hover:opacity-90 text-white shadow-medium"
                onClick={() => navigate('/auth')}
              >
                {t('startSourcing')}
              </Button>
              <Button size="lg" variant="outline">
                {t('browseSuppliers')}
              </Button>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-success" />
                <span className="text-sm font-medium">{t('freeToJoin')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-success" />
                <span className="text-sm font-medium">{t('verifiedSuppliersOnly')}</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-gradient rounded-3xl blur-3xl opacity-20"></div>
              <img 
                src={heroImage} 
                alt="Street food vendors sourcing fresh ingredients"
                className="relative z-10 w-full h-auto rounded-3xl shadow-large"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};