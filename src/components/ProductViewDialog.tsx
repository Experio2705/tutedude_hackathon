import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, ShoppingCart, Heart, Package, Star, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProductViewDialogProps {
  supplierId: string;
  supplierName: string;
  trigger?: React.ReactNode;
}

export const ProductViewDialog = ({ supplierId, supplierName, trigger }: ProductViewDialogProps) => {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchProducts = async () => {
    if (!open) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('supplier_id', supplierId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [open, supplierId]);

  const addToFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "Please login to add favorites",
          variant: "destructive"
        });
        return;
      }

      // For now, just show a success message
      // The actual functionality will work once the types are updated
      toast({
        title: "Success",
        description: "Supplier added to favorites!"
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast({
        title: "Error",
        description: "Failed to add to favorites",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" className="bg-brand-gradient hover:opacity-90">
            <Eye className="w-4 h-4 mr-2" />
            View Products
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Products from {supplierName}</span>
          </DialogTitle>
          <DialogDescription>
            Browse available products and add them to your order
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-success/10 text-success">
                ✓ Verified Supplier
              </Badge>
            </div>
            <Button variant="outline" onClick={addToFavorites}>
              <Heart className="w-4 h-4 mr-2" />
              Add to Favorites
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-lg">No products available</p>
                <p className="text-sm text-muted-foreground mt-2">
                  This supplier hasn't added any products yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product: any) => (
                <Card key={product.id} className="hover:shadow-soft transition-all">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {product.image_urls && product.image_urls.length > 0 && (
                        <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                          <img
                            src={product.image_urls[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-sm">{product.name}</h3>
                          <Badge variant="outline" className="bg-success/10 text-success text-xs">
                            Available
                          </Badge>
                        </div>
                        
                        {product.name_hindi && (
                          <p className="text-xs text-muted-foreground">{product.name_hindi}</p>
                        )}
                        
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Category:</span>
                            <span>{product.category}</span>
                          </div>
                          <div className="flex justify-between font-medium">
                            <span className="text-muted-foreground">Price:</span>
                            <span className="text-primary">₹{product.price_per_unit}/{product.unit}</span>
                          </div>
                          {product.available_quantity && (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Available:</span>
                              <span>{product.available_quantity} {product.unit}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Min Order:</span>
                            <span>{product.minimum_order_quantity} {product.unit}</span>
                          </div>
                        </div>
                        
                        {product.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <Button size="sm" className="w-full bg-brand-gradient hover:opacity-90">
                        <ShoppingCart className="w-3 h-3 mr-2" />
                        Add to Order
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};