import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    home: 'Home',
    findSuppliers: 'Find Suppliers',
    pricing: 'Pricing',
    about: 'About',
    login: 'Login',
    getStarted: 'Get Started',
    
    // Hero Section
    heroTitle: 'Connect with Verified Suppliers for Your Street Food Business',
    heroSubtitle: 'Find affordable, high-quality raw materials from trusted suppliers. Streamline your sourcing process and grow your street food business.',
    startSourcing: 'Start Sourcing Now',
    browseSuppliers: 'Browse Suppliers',
    freeToJoin: 'Free to join',
    verifiedSuppliersOnly: 'Verified suppliers only',
    
    // Auth
    welcomeBack: 'Welcome Back',
    signInToAccount: 'Sign in to your account',
    vendor: 'Vendor',
    supplier: 'Supplier',
    vendorLogin: 'Vendor Login',
    supplierLogin: 'Supplier Login',
    signInToVendorDashboard: 'Sign in to access your vendor dashboard',
    signInToSupplierDashboard: 'Sign in to access your supplier dashboard',
    email: 'Email',
    password: 'Password',
    signInAsVendor: 'Sign In as Vendor',
    signInAsSupplier: 'Sign In as Supplier',
    forgotPassword: 'Forgot your password?',
    dontHaveAccount: "Don't have an account?",
    signUpHere: 'Sign up here',
    
    // Dashboard
    vendorDashboard: 'Vendor Dashboard',
    supplierDashboard: 'Supplier Dashboard',
    welcomeBackMessage: 'Welcome back, {name}! Manage your sourcing efficiently.',
    welcomeBackSupplierMessage: 'Welcome back, {name}! Manage your products and orders.',
    messages: 'Messages',
    newOrder: 'New Order',
    analytics: 'Analytics',
    addProduct: 'Add Product',
    
    // Stats
    totalOrders: 'Total Orders',
    activeSuppliers: 'Active Suppliers',
    monthlySpending: 'Monthly Spending',
    avgDeliveryTime: 'Avg. Delivery Time',
    totalRevenue: 'Total Revenue',
    activeProducts: 'Active Products',
    averageRating: 'Average Rating',
    
    // Footer
    quickLinks: 'Quick Links',
    forVendors: 'For Vendors',
    forSuppliers: 'For Suppliers',
    aboutUs: 'About Us',
    contact: 'Contact',
    becomeVendor: 'Become a Vendor',
    becomeSupplier: 'Become a Supplier',
    vendorDashboardLink: 'Vendor Dashboard',
    supplierDashboardLink: 'Supplier Dashboard',
    helpCenter: 'Help Center',
    verificationProcess: 'Verification Process',
    
    // Stats Section
    activeVendors: 'Active Vendors',
    verifiedSuppliers: 'Verified Suppliers',
    ordersCompleted: 'Orders Completed',
    satisfactionRate: 'Satisfaction Rate',
    
    // Features Section
    whyChooseSourceMart: 'Why Choose SourceMart?',
    trustedMarketplace: "We're building India's most trusted marketplace for street food vendors and suppliers",
    verifiedSuppliersFeature: 'Verified Suppliers',
    verifiedSuppliersDesc: 'All suppliers are thoroughly vetted and verified for quality and reliability.',
    secureTransactions: 'Secure Transactions',
    secureTransactionsDesc: 'Safe and secure payment processing with buyer protection.',
    realtimeAnalytics: 'Real-time Analytics',
    realtimeAnalyticsDesc: 'Track your orders, expenses, and supplier performance in real-time.',
    
    // Testimonials
    whatUsersSay: 'What Our Users Say',
    thousandsTrust: 'Thousands of vendors and suppliers trust SourceMart',
    
    // CTA Section
    readyToTransform: 'Ready to Transform Your Sourcing?',
    joinThousands: 'Join thousands of vendors and suppliers who are already growing their business with SourceMart',
    getStartedFree: 'Get Started Free',
    learnMore: 'Learn More'
  },
  hi: {
    // Navigation
    home: 'होम',
    findSuppliers: 'आपूर्तिकर्ता खोजें',
    pricing: 'मूल्य निर्धारण',
    about: 'हमारे बारे में',
    login: 'लॉगिन',
    getStarted: 'शुरू करें',
    
    // Hero Section
    heroTitle: 'अपने स्ट्रीट फूड व्यवसाय के लिए सत्यापित आपूर्तिकर्ताओं से जुड़ें',
    heroSubtitle: 'विश्वसनीय आपूर्तिकर्ताओं से किफायती, उच्च गुणवत्ता वाली कच्ची सामग्री प्राप्त करें। अपनी सोर्सिंग प्रक्रिया को सुव्यवस्थित करें और अपने स्ट्रीट फूड व्यवसाय को बढ़ाएं।',
    startSourcing: 'अभी सोर्सिंग शुरू करें',
    browseSuppliers: 'आपूर्तिकर्ता ब्राउज़ करें',
    freeToJoin: 'मुफ्त में शामिल हों',
    verifiedSuppliersOnly: 'केवल सत्यापित आपूर्तिकर्ता',
    
    // Auth
    welcomeBack: 'वापस स्वागत है',
    signInToAccount: 'अपने खाते में साइन इन करें',
    vendor: 'विक्रेता',
    supplier: 'आपूर्तिकर्ता',
    vendorLogin: 'विक्रेता लॉगिन',
    supplierLogin: 'आपूर्तिकर्ता लॉगिन',
    signInToVendorDashboard: 'अपने विक्रेता डैशबोर्ड तक पहुंचने के लिए साइन इन करें',
    signInToSupplierDashboard: 'अपने आपूर्तिकर्ता डैशबोर्ड तक पहुंचने के लिए साइन इन करें',
    email: 'ईमेल',
    password: 'पासवर्ड',
    signInAsVendor: 'विक्रेता के रूप में साइन इन करें',
    signInAsSupplier: 'आपूर्तिकर्ता के रूप में साइन इन करें',
    forgotPassword: 'अपना पासवर्ड भूल गए?',
    dontHaveAccount: 'खाता नहीं है?',
    signUpHere: 'यहाँ साइन अप करें',
    
    // Dashboard
    vendorDashboard: 'विक्रेता डैशबोर्ड',
    supplierDashboard: 'आपूर्तिकर्ता डैशबोर्ड',
    welcomeBackMessage: 'वापस स्वागत है, {name}! अपनी सोर्सिंग को कुशलता से प्रबंधित करें।',
    welcomeBackSupplierMessage: 'वापस स्वागत है, {name}! अपने उत्पादों और ऑर्डर प्रबंधित करें।',
    messages: 'संदेश',
    newOrder: 'नया ऑर्डर',
    analytics: 'विश्लेषण',
    addProduct: 'उत्पाद जोड़ें',
    
    // Stats
    totalOrders: 'कुल ऑर्डर',
    activeSuppliers: 'सक्रिय आपूर्तिकर्ता',
    monthlySpending: 'मासिक खर्च',
    avgDeliveryTime: 'औसत डिलीवरी समय',
    totalRevenue: 'कुल राजस्व',
    activeProducts: 'सक्रिय उत्पाद',
    averageRating: 'औसत रेटिंग',
    
    // Footer
    quickLinks: 'त्वरित लिंक',
    forVendors: 'विक्रेताओं के लिए',
    forSuppliers: 'आपूर्तिकर्ताओं के लिए',
    aboutUs: 'हमारे बारे में',
    contact: 'संपर्क',
    becomeVendor: 'विक्रेता बनें',
    becomeSupplier: 'आपूर्तिकर्ता बनें',
    vendorDashboardLink: 'विक्रेता डैशबोर्ड',
    supplierDashboardLink: 'आपूर्तिकर्ता डैशबोर्ड',
    helpCenter: 'सहायता केंद्र',
    verificationProcess: 'सत्यापन प्रक्रिया',
    
    // Stats Section
    activeVendors: 'सक्रिय विक्रेता',
    verifiedSuppliers: 'सत्यापित आपूर्तिकर्ता',
    ordersCompleted: 'पूर्ण किए गए ऑर्डर',
    satisfactionRate: 'संतुष्टि दर',
    
    // Features Section
    whyChooseSourceMart: 'SourceMart क्यों चुनें?',
    trustedMarketplace: 'हम स्ट्रीट फूड विक्रेताओं और आपूर्तिकर्ताओं के लिए भारत का सबसे विश्वसनीय मार्केटप्लेस बना रहे हैं',
    verifiedSuppliersFeature: 'सत्यापित आपूर्तिकर्ता',
    verifiedSuppliersDesc: 'सभी आपूर्तिकर्ता गुणवत्ता और विश्वसनीयता के लिए पूरी तरह से जांचे और सत्यापित हैं।',
    secureTransactions: 'सुरक्षित लेनदेन',
    secureTransactionsDesc: 'खरीदार सुरक्षा के साथ सुरक्षित भुगतान प्रसंस्करण।',
    realtimeAnalytics: 'वास्तविक समय विश्लेषण',
    realtimeAnalyticsDesc: 'अपने ऑर्डर, खर्च और आपूर्तिकर्ता प्रदर्शन को वास्तविक समय में ट्रैक करें।',
    
    // Testimonials
    whatUsersSay: 'हमारे उपयोगकर्ता क्या कहते हैं',
    thousandsTrust: 'हजारों विक्रेता और आपूर्तिकर्ता SourceMart पर भरोसा करते हैं',
    
    // CTA Section
    readyToTransform: 'अपनी सोर्सिंग को बदलने के लिए तैयार हैं?',
    joinThousands: 'हजारों विक्रेताओं और आपूर्तिकर्ताओं के साथ जुड़ें जो पहले से ही SourceMart के साथ अपना व्यवसाय बढ़ा रहे हैं',
    getStartedFree: 'मुफ्त में शुरू करें',
    learnMore: 'और जानें'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('sourcemart-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('sourcemart-language', lang);
  };

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};