import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const VendorOrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    
    // Set up real-time subscription
    const ordersSubscription = supabase
      .channel('vendor-orders-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(ordersSubscription);
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          suppliers (
            id,
            profiles (
              full_name,
              business_name,
              city,
              state
            )
          ),
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (
              name,
              unit
            )
          )
        `)
        .eq('vendor_id', profile.id)
        .order('created_at', { ascending: false });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredOrders = orders.filter((order: any) => 
    statusFilter === 'all' || order.status === statusFilter
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading orders...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>My Orders</CardTitle>
              <CardDescription>Track and manage your orders</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {statusFilter === 'all' ? 'No orders yet. Start by placing your first order!' : `No ${statusFilter} orders found.`}
            </p>
          ) : (
            filteredOrders.map((order: any) => (
              <div key={order.id} className="border rounded-lg p-4 hover:shadow-soft transition-all">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">{order.order_number}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Package className="w-4 h-4" />
                        <span>
                          Supplier: {order.suppliers?.profiles?.business_name || order.suppliers?.profiles?.full_name || 'No supplier assigned'}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {order.suppliers?.profiles?.city || ''}, {order.suppliers?.profiles?.state || ''}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Ordered: {new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      {order.delivery_date && (
                        <div className="flex items-center space-x-2 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>Delivery: {new Date(order.delivery_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {order.order_items && order.order_items.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Items:</p>
                        <div className="space-y-1">
                          {order.order_items.map((item: any, idx: number) => (
                            <div key={idx} className="text-sm text-muted-foreground flex justify-between">
                              <span>
                                {item.products?.name || 'Product'} × {item.quantity} {item.products?.unit || ''}
                              </span>
                              <span>₹{Number(item.total_price).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-lg font-semibold text-primary">
                        Total: ₹{Number(order.total_amount).toLocaleString()}
                      </span>
                      <div className="text-sm text-muted-foreground">
                        Delivery: {order.delivery_address}
                      </div>
                    </div>
                    
                    {order.notes && (
                      <div className="text-sm">
                        <span className="font-medium">Notes:</span> {order.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};