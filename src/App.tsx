import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import VendorDashboard from "./pages/VendorDashboard";
import SupplierDashboard from "./pages/SupplierDashboard";
import AboutPage from "./pages/About";
import NotFound from "./pages/NotFound";
import { BackButton } from "./components/BackButton";

// Simple placeholder pages for navigation
const FindSuppliers = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-6 py-8">
      <BackButton to="/" />
      <div className="flex items-center justify-center min-h-[60vh]">
        <h1 className="text-3xl font-bold">Find Suppliers Page</h1>
      </div>
    </div>
  </div>
);

const Pricing = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-6 py-8">
      <BackButton to="/" />
      <div className="flex items-center justify-center min-h-[60vh]">
        <h1 className="text-3xl font-bold">Pricing Page</h1>
      </div>
    </div>
  </div>
);

const About = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-6 py-8">
      <BackButton to="/" />
      <div className="flex items-center justify-center min-h-[60vh]">
        <h1 className="text-3xl font-bold">About Page</h1>
      </div>
    </div>
  </div>
);

const Messages = () => (
  <div className="min-h-screen bg-background">
    <div className="container mx-auto px-6 py-8">
      <BackButton to="/" />
      <div className="flex items-center justify-center min-h-[60vh]">
        <h1 className="text-3xl font-bold">Messages Page</h1>
      </div>
    </div>
  </div>
);

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children, requiredUserType }: { children: React.ReactNode, requiredUserType?: string }) => {
  const { user, loading } = useAuth();
  
  console.log('ProtectedRoute - user:', user, 'loading:', loading);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Redirect based on user auth status
const AuthRedirect = () => {
  const { user, loading } = useAuth();
  
  console.log('AuthRedirect - user:', user, 'loading:', loading);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (user) {
    // Get user type from metadata
    const userType = user.user_metadata?.user_type || 'vendor';
    console.log('User type from metadata:', userType);
    return <Navigate to={userType === 'vendor' ? '/vendor-dashboard' : '/supplier-dashboard'} replace />;
  }
  
  return <Index />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AuthRedirect />} />
              <Route path="/auth" element={<Auth />} />
              <Route 
                path="/vendor-dashboard" 
                element={
                  <ProtectedRoute>
                    <VendorDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/supplier-dashboard" 
                element={
                  <ProtectedRoute>
                    <SupplierDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/suppliers" element={<FindSuppliers />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<AboutPage />} />
              <Route 
                path="/messages" 
                element={
                  <ProtectedRoute>
                    <Messages />
                  </ProtectedRoute>
                } 
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
