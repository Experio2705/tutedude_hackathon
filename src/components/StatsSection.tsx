import { useLanguage } from "@/contexts/LanguageContext";

export const StatsSection = () => {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-brand-gradient">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center text-white">
          <div className="space-y-2">
            <div className="text-4xl lg:text-5xl font-bold">10,000+</div>
            <div className="text-lg opacity-90">{t('activeVendors')}</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl lg:text-5xl font-bold">5,000+</div>
            <div className="text-lg opacity-90">{t('verifiedSuppliers')}</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl lg:text-5xl font-bold">1M+</div>
            <div className="text-lg opacity-90">{t('ordersCompleted')}</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl lg:text-5xl font-bold">98%</div>
            <div className="text-lg opacity-90">{t('satisfactionRate')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};