import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, User, Building } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { LanguageToggle } from "@/components/LanguageToggle";
import { BackButton } from "@/components/BackButton";

export default function Auth() {
  const { t } = useLanguage();
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState<'vendor' | 'supplier'>('vendor');
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    businessName: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Success",
            description: "Logged in successfully!"
          });
          // Wait a moment for auth state to update, then redirect
          setTimeout(() => {
            navigate(userType === 'vendor' ? '/vendor-dashboard' : '/supplier-dashboard');
          }, 100);
        }
      } else {
        const { error } = await signUp(formData.email, formData.password, {
          full_name: formData.fullName,
          user_type: userType,
          business_name: formData.businessName,
          phone: formData.phone
        });
        
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please try logging in instead.",
              variant: "destructive"
            });
            setIsLogin(true);
          } else {
            toast({
              title: "Error", 
              description: error.message,
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Success",
            description: "Account created successfully! You are now logged in."
          });
          // Wait a moment for auth state to update, then redirect
          setTimeout(() => {
            navigate(userType === 'vendor' ? '/vendor-dashboard' : '/supplier-dashboard');
          }, 100);
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <BackButton to="/" className="fixed top-4 left-4" />
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <ShoppingCart className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary">SourceMart</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t('welcomeBack')}</h1>
            <p className="text-muted-foreground">{t('signInToAccount')}</p>
          </div>
        </div>

        {/* User Type Toggle */}
        <Tabs value={userType} onValueChange={(value) => setUserType(value as 'vendor' | 'supplier')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="vendor" className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{t('vendor')}</span>
            </TabsTrigger>
            <TabsTrigger value="supplier" className="flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>{t('supplier')}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Auth Form */}
        <Card>
          <CardHeader>
            <CardTitle>
              {userType === 'vendor' ? t('vendorLogin') : t('supplierLogin')}
            </CardTitle>
            <CardDescription>
              {userType === 'vendor' ? t('signInToVendorDashboard') : t('signInToSupplierDashboard')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={userType === 'vendor' ? 'vendor@example.com' : 'supplier@example.com'}
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-brand-gradient hover:opacity-90"
                disabled={loading}
              >
                {loading ? 'Please wait...' : 
                  isLogin ? 
                    (userType === 'vendor' ? t('signInAsVendor') : t('signInAsSupplier')) :
                    'Sign Up'
                }
              </Button>
            </form>
            
            {isLogin && (
              <div className="text-center mt-4">
                <a href="#" className="text-sm text-primary hover:underline">
                  {t('forgotPassword')}
                </a>
              </div>
            )}
            
            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                {isLogin ? t('dontHaveAccount') : 'Already have an account?'}{' '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline font-medium"
                >
                  {isLogin ? t('signUpHere') : 'Sign in here'}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}