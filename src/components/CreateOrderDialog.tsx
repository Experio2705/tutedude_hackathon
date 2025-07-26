import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateOrderDialogProps {
  supplierId?: string;
  onOrderCreated: () => void;
}

export const CreateOrderDialog = ({ supplierId, onOrderCreated }: CreateOrderDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    supplier_id: supplierId || '',
    delivery_address: '',
    delivery_date: '',
    notes: '',
    items: [
  {
    product_id: '',         // ✅ Add this
    product_name: '',
    quantity: '',
    unit_price: '',
    total_price: '',
  },
]
  });

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
  {
    product_id: '',         // ✅ Add this
    product_name: '',
    quantity: '',
    unit_price: '',
    total_price: '',
  },
]
    }));
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate total price if quantity or unit_price changes
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const unitPrice = parseFloat(newItems[index].unit_price) || 0;
      newItems[index].total_price = (quantity * unitPrice).toString();
    }
    
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (parseFloat(item.total_price) || 0);
    }, 0);
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     // Get current user
  //     const { data: { user } } = await supabase.auth.getUser();
  //     if (!user) throw new Error('Not authenticated');

  //     // Get vendor profile
  //     const { data: profiles, error: profileError } = await supabase
  //       .from('profiles')
  //       .select('id')
  //       .eq('user_id', user.id)
  //       .single();

  //     if (profileError) throw profileError;

  //     const totalAmount = calculateTotal();
  //     const orderNumber = `ORD-${Date.now()}`;

  //     // Create order
  //     const { data: order, error: orderError } = await supabase
  //       .from('orders')
  //       .insert({
  //         order_number: orderNumber,
  //         vendor_id: profiles.id,
  //         supplier_id: formData.supplier_id || null,
  //         total_amount: totalAmount,
  //         delivery_address: formData.delivery_address,
  //         delivery_date: formData.delivery_date || null,
  //         notes: formData.notes || null,
  //         status: 'pending'
  //       })
  //       .select()
  //       .single();

  //     if (orderError) throw orderError;

  //     // Create order items
  //     for (const item of formData.items) {
  //       if (item.product_name && item.quantity && item.unit_price) {
  //         const { error: itemError } = await supabase
  //           .from('order_items')
  //           .insert({
  //             order_id: order.id,
  //             product_id: null, // We'll use product name for now
  //             quantity: parseFloat(item.quantity),
  //             unit_price: parseFloat(item.unit_price),
  //             total_price: parseFloat(item.total_price)
  //           });

  //         if (itemError) throw itemError;
  //       }
  //     }

  //     toast({
  //       title: "Success",
  //       description: `Order ${orderNumber} created successfully!`
  //     });

  //     setOpen(false);
  //     setFormData({
  //       supplier_id: supplierId || '',
  //       delivery_address: '',
  //       delivery_date: '',
  //       notes: '',
  //       items: [{ product_name: '', quantity: '', unit_price: '', total_price: '' }]
  //     });
      
  //     onOrderCreated();
  //   } catch (error) {
  //     console.error('Error creating order:', error);
  //     toast({
  //       title: "Error",
  //       description: "Failed to create order. Please try again.",
  //       variant: "destructive"
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Get vendor profile
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (profileError) throw profileError;

    const totalAmount = calculateTotal();
    const orderNumber = `ORD-${Date.now()}`;

    // 1. Create order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        supplier_id: formData.supplier_id || null,
        delivery_address: formData.delivery_address,
        delivery_date: formData.delivery_date,
        notes: formData.notes,
        total_amount: totalAmount,
        vendor_id: profiles.id
      })
      .select() // To return inserted data
      .single();

    if (orderError) throw orderError;

    const orderId = orderData.id;

    // // 2. Prepare order_items payload
    // const itemsPayload = formData.items.map(item => ({
    //   order_id: orderId,
    //   product_id: item.product_id,
    //   quantity: parseFloat(item.quantity),
    //   unit_price: parseFloat(item.unit_price),
    //   total_price: parseFloat(item.total_price)
    // }));

    // // 3. Insert order items
    // const { error: itemsError } = await supabase
    //   .from('order_items')
    //   .insert(itemsPayload);

    // if (itemsError) throw itemsError;
    // 2. Insert order items with product_id lookup
for (const item of formData.items) {
  if (item.product_name && item.quantity && item.unit_price) {
    // Look up product_id by product name
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('name', item.product_name)
      .maybeSingle();

    if (productError) throw productError;

    const productId = product ? product.id : null;

    // Insert each order item (product_id can be null)
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: orderId,
        product_id: productId,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price),
        total_price: parseFloat(item.total_price)
      });

    if (itemError) throw itemError;
  }
}


    toast({
      title: 'Order created successfully',
    });

    setOpen(false);
    setFormData({
      supplier_id: supplierId || '',
      delivery_address: '',
      delivery_date: '',
      notes: '',
      items: [
  {
    product_id: '',         // ✅ Add this
    product_name: '',
    quantity: '',
    unit_price: '',
    total_price: '',
  },
]
    });
    onOrderCreated();
  } catch (error: any) {
    console.error(error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to create order',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-brand-gradient hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          New Order
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Create a new order for raw materials from suppliers.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery_address">Delivery Address *</Label>
              <Textarea
                id="delivery_address"
                value={formData.delivery_address}
                onChange={(e) => setFormData(prev => ({ ...prev, delivery_address: e.target.value }))}
                placeholder="Enter full delivery address..."
                required
                rows={3}
              />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="delivery_date">Preferred Delivery Date</Label>
                <Input
                  id="delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery_date: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any special instructions..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Order Items</h3>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>
            
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input
                    value={item.product_name}
                    onChange={(e) => updateItem(index, 'product_name', e.target.value)}
                    placeholder="e.g., Tomatoes"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    placeholder="50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Unit Price (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                    placeholder="45.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Total (₹)</Label>
                  <Input
                    value={item.total_price}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>&nbsp;</Label>
                  {formData.items.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="w-full"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <div className="text-right">
              <div className="text-lg font-semibold">
                Total Amount: ₹{calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-brand-gradient hover:opacity-90">
              {loading ? 'Creating...' : 'Create Order'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};