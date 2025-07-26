import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "./LanguageToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="flex items-center justify-between p-6 bg-background border-b">
      <div className="flex items-center space-x-2">
        <ShoppingCart className="w-8 h-8 text-primary" />
        <span className="text-xl font-bold text-primary">SourceMart</span>
      </div>
      
      <div className="hidden md:flex items-center space-x-8">
        <a href="/" className="text-foreground hover:text-primary transition-smooth">{t('home')}</a>
        <a href="/suppliers" className="text-foreground hover:text-primary transition-smooth">{t('findSuppliers')}</a>
        <a href="/pricing" className="text-foreground hover:text-primary transition-smooth">{t('pricing')}</a>
        <a href="/about" className="text-foreground hover:text-primary transition-smooth">{t('about')}</a>
        {user && (
          <a href="/messages" className="text-foreground hover:text-primary transition-smooth">{t('messages')}</a>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <LanguageToggle />
        {user ? (
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={() => navigate('/auth')}>
              {t('login')}
            </Button>
            <Button onClick={() => navigate('/auth')}>
              {t('getStarted')}
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};