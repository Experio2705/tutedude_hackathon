import { Shield, TrendingUp, Users } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const FeaturesSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">{t('whyChooseSourceMart')}</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('trustedMarketplace')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">{t('verifiedSuppliersFeature')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('verifiedSuppliersDesc')}
            </p>
          </div>

          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">{t('secureTransactions')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('secureTransactionsDesc')}
            </p>
          </div>

          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">{t('realtimeAnalytics')}</h3>
            <p className="text-muted-foreground leading-relaxed">
              {t('realtimeAnalyticsDesc')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};