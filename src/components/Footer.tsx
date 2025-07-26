import { ShoppingCart, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-muted/30 py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold text-primary">SourceMart</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Connecting street food vendors with verified suppliers for fresh, affordable raw materials.
            </p>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>support@sourcemart.com</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('quickLinks')}</h3>
            <div className="space-y-2">
              <a href="/about" className="block text-muted-foreground hover:text-primary transition-smooth">
                {t('aboutUs')}
              </a>
              <a href="/suppliers" className="block text-muted-foreground hover:text-primary transition-smooth">
                {t('findSuppliers')}
              </a>
              <a href="/pricing" className="block text-muted-foreground hover:text-primary transition-smooth">
                {t('pricing')}
              </a>
              <a href="/contact" className="block text-muted-foreground hover:text-primary transition-smooth">
                {t('contact')}
              </a>
            </div>
          </div>

          {/* For Vendors */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('forVendors')}</h3>
            <div className="space-y-2">
              <a href="/auth" className="block text-muted-foreground hover:text-primary transition-smooth">
                {t('becomeVendor')}
              </a>
              <a href="/vendor-dashboard" className="block text-muted-foreground hover:text-primary transition-smooth">
                {t('vendorDashboardLink')}
              </a>
              <a href="/help" className="block text-muted-foreground hover:text-primary transition-smooth">
                {t('helpCenter')}
              </a>
            </div>
          </div>

          {/* For Suppliers */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t('forSuppliers')}</h3>
            <div className="space-y-2">
              <a href="/auth" className="block text-muted-foreground hover:text-primary transition-smooth">
                {t('becomeSupplier')}
              </a>
              <a href="/supplier-dashboard" className="block text-muted-foreground hover:text-primary transition-smooth">
                {t('supplierDashboardLink')}
              </a>
              <a href="/verification" className="block text-muted-foreground hover:text-primary transition-smooth">
                {t('verificationProcess')}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground">
            © 2024 SourceMart. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/privacy" className="text-muted-foreground hover:text-primary transition-smooth">
              Privacy Policy
            </a>
            <a href="/terms" className="text-muted-foreground hover:text-primary transition-smooth">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};