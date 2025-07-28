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
import { ProductViewDialog } from "@/components/ProductViewDialog";
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
              {/* Search */}
              <Card>
                <CardHeader>
                  <CardTitle>Search Suppliers</CardTitle>
                  <CardDescription>
                    Find verified suppliers for your raw materials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Search for products, suppliers, or locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <Button className="bg-brand-gradient hover:opacity-90">
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Available Suppliers */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Available Suppliers</h2>
                
                <div className="space-y-4">
                  {suppliers.length === 0 ? (
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-muted-foreground text-center">
                          {loading ? "Loading suppliers..." : "No suppliers found. Contact suppliers to start seeing them here."}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    suppliers.map((supplier: any) => (
                      <Card key={supplier.id} className="hover:shadow-medium transition-all">
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold">
                                  {supplier.profiles?.business_name || supplier.profiles?.full_name || 'Unnamed Supplier'}
                                </h3>
                                <Badge variant="secondary" className="bg-success/10 text-success">
                                  ✓ Verified
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{supplier.profiles?.city || 'Location not set'}, {supplier.profiles?.state || ''}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span>{supplier.rating || 0}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{supplier.delivery_time_days || 3} days</span>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <p className="text-sm font-medium">Specializations:</p>
                                <div className="flex flex-wrap gap-2">
                                  {supplier.specializations?.map((spec: string, idx: number) => (
                                    <Badge key={idx} variant="outline">
                                      {spec}
                                    </Badge>
                                  )) || <span className="text-sm text-muted-foreground">No specializations listed</span>}
                                </div>
                              </div>
                              
                              <p className="text-sm font-medium text-primary">
                                Min Order: ₹{supplier.min_order_amount || 0}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Message
                              </Button>
                              <ProductViewDialog 
                                supplierId={supplier.id}
                                supplierName={supplier.profiles?.business_name || supplier.profiles?.full_name || 'Unnamed Supplier'}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
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