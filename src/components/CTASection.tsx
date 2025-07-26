import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

export const CTASection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-brand-gradient">
      <div className="container mx-auto px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-8 text-white">
          <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
            {t('readyToTransform')}
          </h2>
          
          <p className="text-xl opacity-90 leading-relaxed">
            {t('joinThousands')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-primary hover:bg-white/90 shadow-medium"
              onClick={() => navigate('/auth')}
            >
              {t('getStartedFree')}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-primary"
            >
              {t('learnMore')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};