import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, MessageSquare, Plus, Search, MapPin, Star, Clock } from "lucide-react";
import { CreateOrderDialog } from "@/components/CreateOrderDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { VendorStats } from "@/components/DashboardStats";
import { BackButton } from "@/components/BackButton";
import { VendorOrdersTab } from "@/components/VendorOrdersTab";
import { VendorFavoritesTab } from "@/components/VendorFavoritesTab";
import { SearchableSuppliers } from "@/components/SearchableSuppliers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function VendorDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [suppliers, setSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
    fetchRealStats();
    
    // Set up real-time subscriptions
    const suppliersSubscription = supabase
      .channel('suppliers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers' }, (payload) => {
        console.log('Supplier change received:', payload);
        fetchSuppliers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(suppliersSubscription);
    };
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select(`
          *,
          profiles (
            full_name,
            business_name,
            city,
            state
          )
        `)
        .limit(10);

      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast({
        title: "Error",
        description: "Failed to load suppliers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRealStats = async () => {
    try {
      // Get current user's orders
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Get total orders
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('vendor_id', profile.id);

      // Get active suppliers count
      const { count: activeSuppliers } = await supabase
        .from('suppliers')
        .select('*', { count: 'exact', head: true });

      // Get monthly spending (current month)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('vendor_id', profile.id)
        .gte('created_at', startOfMonth.toISOString());

      const monthlySpending = monthlyOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      setRealStats({
        totalOrders: totalOrders || 0,
        activeSuppliers: activeSuppliers || 0,
        monthlySpending,
        avgDeliveryTime: '2-3 days' // This could be calculated from actual delivery data
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const [realStats, setRealStats] = useState({
    totalOrders: 0,
    activeSuppliers: 0,
    monthlySpending: 0,
    avgDeliveryTime: '0 days'
  });

  const mockSuppliers = [
    {
      id: 1,
      name: "Green Valley Farms",
      location: "Haryana",
      rating: 4.6,
      deliveryTime: "2-3 days",
      products: ["Tomatoes", "Onions", "Potatoes"],
      priceRange: "₹45/kg",
      verified: true
    },
    {
      id: 2,
      name: "Masala Express",
      location: "Kerala", 
      rating: 4.8,
      deliveryTime: "1-2 days",
      products: ["Turmeric", "Red Chili", "Coriander"],
      priceRange: "₹250/kg",
      verified: true
    },
    {
      id: 3,
      name: "Protein Plus",
      location: "Gujarat",
      rating: 4.5,
      deliveryTime: "3-4 days", 
      products: ["Chicken", "Mutton", "Fish"],
      priceRange: "₹180/kg",
      verified: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-6 py-8">
        <BackButton to="/" />
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('vendorDashboard')}</h1>
            <p className="text-muted-foreground">
              Welcome back, Rajesh! Manage your sourcing efficiently.
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              {t('messages')}
            </Button>
            <CreateOrderDialog onOrderCreated={fetchSuppliers} />
          </div>
        </div>

        {/* Stats */}
        <VendorStats {...realStats} />

        {/* Main Content */}
        <div className="mt-8">
          <Tabs defaultValue="suppliers" className="space-y-6">
            <TabsList>
              <TabsTrigger value="suppliers">Find Suppliers</TabsTrigger>
              <TabsTrigger value="orders">My Orders</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>

            <TabsContent value="suppliers" className="space-y-6">
              <SearchableSuppliers />
            </TabsContent>

            <TabsContent value="orders">
              <VendorOrdersTab />
            </TabsContent>

            <TabsContent value="favorites">
              <VendorFavoritesTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}