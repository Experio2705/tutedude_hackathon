import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, BarChart3, Plus, Check, X } from "lucide-react";
import { AddProductDialog } from "@/components/AddProductDialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { SupplierStats } from "@/components/SupplierStats";
import { BackButton } from "@/components/BackButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function SupplierDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    fetchProducts();
    fetchRealStats();
    // Set up real-time subscriptions
    const ordersSubscription = supabase
      .channel('orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        console.log('Order change received:', payload);
        fetchOrders();
      })
      .subscribe();

    const productsSubscription = supabase
      .channel('products-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        console.log('Product change received:', payload);
        fetchProducts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
      supabase.removeChannel(productsSubscription);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (
            full_name,
            business_name
          )
        `)
        .eq('status', 'pending')
        .limit(10);

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's profile
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Get supplier record
      const { data: suppliers, error: supplierError } = await supabase
        .from('suppliers')
        .select('id')
        .eq('profile_id', profiles.id)
        .single();

      if (supplierError) {
        console.log('No supplier record found');
        setProducts([]);
        return;
      }

      // Get products
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', suppliers.id)
        .eq('is_active', true);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const fetchRealStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data: supplier } = await supabase
        .from('suppliers')
        .select('id, rating')
        .eq('profile_id', profile.id)
        .single();

      if (!supplier) return;

      // Get total orders for this supplier
      const { count: totalOrders } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('supplier_id', supplier.id);

      // Get total revenue
      const { data: completedOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('supplier_id', supplier.id)
        .eq('status', 'confirmed');

      const totalRevenue = completedOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      // Get active products count
      const { count: activeProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('supplier_id', supplier.id)
        .eq('is_active', true);

      setRealStats({
        totalRevenue,
        totalOrders: totalOrders || 0,
        activeProducts: activeProducts || 0,
        averageRating: supplier.rating || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleOrderAction = async (orderId: string, action: 'accept' | 'decline') => {
    try {
      const newStatus = action === 'accept' ? 'confirmed' : 'cancelled';
      
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Order ${action}ed successfully!`
      });
      
      fetchOrders(); // Refresh the orders
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive"
      });
    }
  };

  const [realStats, setRealStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeProducts: 0,
    averageRating: 0
  });

  const mockPendingOrders = [
    {
      id: "ORD-101",
      vendor: "Raj Street Food",
      items: "Tomatoes (50kg), Onions (30kg)",
      amount: 3500,
      date: "2024-01-20",
      status: "Pending"
    },
    {
      id: "ORD-102", 
      vendor: "Spice Corner",
      items: "Red Chili Powder (10kg)",
      amount: 2800,
      date: "2024-01-20",
      status: "Pending"
    },
    {
      id: "ORD-103",
      vendor: "Delhi Delights", 
      items: "Basmati Rice (25kg)",
      amount: 3000,
      date: "2024-01-19",
      status: "Pending"
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
            <h1 className="text-3xl font-bold mb-2">{t('supplierDashboard')}</h1>
            <p className="text-muted-foreground">
              Welcome back, Fresh Veggies Co.! Manage your products and orders.
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              {t('analytics')}
            </Button>
            <AddProductDialog onProductAdded={fetchProducts} />
          </div>
        </div>

        {/* Stats */}
        <SupplierStats 
          totalProducts={realStats.activeProducts}
          totalOrders={realStats.totalOrders}
          averageRating={realStats.averageRating}
          totalRevenue={realStats.totalRevenue}
        />

        {/* Main Content */}
        <div className="mt-8">
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList>
              <TabsTrigger value="orders">Pending Orders</TabsTrigger>
              <TabsTrigger value="products">My Products</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Orders</CardTitle>
                  <CardDescription>
                    Review and manage incoming orders from vendors
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orders.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No pending orders at the moment.
                    </p>
                  ) : (
                    orders.map((order: any) => (
                      <div key={order.id} className="p-4 border rounded-lg hover:shadow-soft transition-all">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-semibold">{order.order_number}</h3>
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                {order.status}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              Vendor: {order.profiles?.business_name || order.profiles?.full_name || 'Unknown Vendor'}
                            </p>
                            
                            <p className="text-sm">
                              {order.notes || 'No specific items listed'}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span>Amount: ₹{Number(order.total_amount).toLocaleString()}</span>
                              <span>Date: {new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOrderAction(order.id, 'decline')}
                              className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Decline
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleOrderAction(order.id, 'accept')}
                              className="bg-success hover:bg-success/90 text-white"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Accept
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>My Products</CardTitle>
                    <CardDescription>Manage your product listings</CardDescription>
                  </div>
                  <AddProductDialog onProductAdded={fetchProducts} />
                </CardHeader>
                <CardContent>
                  {products.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No products yet. Add your first product to start receiving orders!
                    </p>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {products.map((product: any) => (
                        <div key={product.id} className="border rounded-lg p-4 hover:shadow-soft transition-all">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold">{product.name}</h3>
                              <Badge variant="secondary" className="bg-success/10 text-success">
                                Active
                              </Badge>
                            </div>
                            
                            {product.name_hindi && (
                              <p className="text-sm text-muted-foreground">{product.name_hindi}</p>
                            )}
                            
                            <div className="space-y-1">
                              <p className="text-sm">
                                <span className="font-medium">Category:</span> {product.category}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">Price:</span> ₹{product.price_per_unit}/{product.unit}
                              </p>
                              {product.available_quantity && (
                                <p className="text-sm">
                                  <span className="font-medium">Available:</span> {product.available_quantity} {product.unit}
                                </p>
                              )}
                            </div>
                            
                            {product.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {product.description}
                              </p>
                            )}
                            
                            <div className="flex gap-2 pt-2">
                              <Button variant="outline" size="sm" className="flex-1">
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="flex-1">
                                View Orders
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Dashboard</CardTitle>
                  <CardDescription>Track your business performance and insights</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Monthly Revenue Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-primary">₹{realStats.totalRevenue.toLocaleString()}</div>
                        <p className="text-sm text-muted-foreground">This month</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Order Success Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-success">95%</div>
                        <p className="text-sm text-muted-foreground">Order completion rate</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Top Selling Product</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-lg font-semibold">
                          {products.length > 0 ? products[0].name : 'No products yet'}
                        </div>
                        <p className="text-sm text-muted-foreground">Most ordered item</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Customer Rating</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">{realStats.averageRating.toFixed(1)}⭐</div>
                        <p className="text-sm text-muted-foreground">Average customer rating</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}