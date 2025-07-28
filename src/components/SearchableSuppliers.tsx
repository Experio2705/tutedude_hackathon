import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Star, Clock, MessageSquare, Heart } from "lucide-react";
import { ProductViewDialog } from "./ProductViewDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SearchableSuppliersProps {
  onSupplierSelect?: (supplierId: string) => void;
}

export const SearchableSuppliers = ({ onSupplierSelect }: SearchableSuppliersProps) => {
  const [suppliers, setSuppliers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchSuppliers();
    
    // Set up real-time subscriptions
    const suppliersSubscription = supabase
      .channel('suppliers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers' }, () => {
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
        .limit(20);

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

  const handleSearch = () => {
    // Filter suppliers based on search query
    if (!searchQuery.trim()) {
      fetchSuppliers();
      return;
    }

    const filtered = suppliers.filter((supplier: any) => {
      const name = supplier.profiles?.business_name || supplier.profiles?.full_name || '';
      const city = supplier.profiles?.city || '';
      const state = supplier.profiles?.state || '';
      const specializations = supplier.specializations?.join(' ') || '';
      
      const searchText = `${name} ${city} ${state} ${specializations}`.toLowerCase();
      return searchText.includes(searchQuery.toLowerCase());
    });
    
    setSuppliers(filtered);
  };

  const toggleFavorite = (supplierId: string) => {
    setFavorites(prev => {
      const isFavorite = prev.includes(supplierId);
      const newFavorites = isFavorite 
        ? prev.filter(id => id !== supplierId)
        : [...prev, supplierId];
      
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite 
          ? "Supplier removed from your favorites" 
          : "Supplier added to your favorites"
      });
      
      return newFavorites;
    });
  };

  const filteredSuppliers = suppliers;

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search for products, suppliers, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full"
              />
            </div>
            <Button onClick={handleSearch} className="bg-brand-gradient hover:opacity-90">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suppliers List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Available Suppliers</h2>
        
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Loading suppliers...</p>
            </CardContent>
          </Card>
        ) : filteredSuppliers.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">
                {searchQuery ? 'No suppliers found matching your search.' : 'No suppliers found. Contact suppliers to start seeing them here.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSuppliers.map((supplier: any) => (
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
                        {favorites.includes(supplier.id) && (
                          <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                            <Heart className="w-3 h-3 mr-1 fill-current" />
                            Favorite
                          </Badge>
                        )}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFavorite(supplier.id)}
                        className={favorites.includes(supplier.id) 
                          ? "hover:bg-destructive/10 hover:text-destructive hover:border-destructive" 
                          : "hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                        }
                      >
                        <Heart className={`w-4 h-4 mr-2 ${favorites.includes(supplier.id) ? 'fill-current' : ''}`} />
                        {favorites.includes(supplier.id) ? 'Remove' : 'Favorite'}
                      </Button>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};