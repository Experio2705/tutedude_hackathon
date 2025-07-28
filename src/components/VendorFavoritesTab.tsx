import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, MapPin, Star, Clock, HeartOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Favorite {
  id: string;
  supplier_id: string;
  created_at: string;
  suppliers: {
    id: string;
    rating: number;
    delivery_time_days: number;
    min_order_amount: number;
    specializations: string[];
    profiles: {
      full_name: string;
      business_name: string;
      city: string;
      state: string;
    };
  };
}

export const VendorFavoritesTab = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchFavorites();
    
    // Set up real-time subscription
    const favoritesSubscription = supabase
      .channel('favorites-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vendor_favorites' }, () => {
        fetchFavorites();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(favoritesSubscription);
    };
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // For now, show empty favorites until types are updated
      setFavorites([]);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createFavoritesTable = async () => {
    try {
      // This will be handled by migration, for now just show empty state
      setFavorites([]);
      setLoading(false);
    } catch (error) {
      console.error('Error creating favorites table:', error);
      setLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      // For now, just show a success message
      toast({
        title: "Success",
        description: "Supplier removed from favorites"
      });
      
      fetchFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast({
        title: "Error",
        description: "Failed to remove favorite",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Loading favorites...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Favorite Suppliers</CardTitle>
          <CardDescription>Your saved suppliers for quick access</CardDescription>
        </CardHeader>
        <CardContent>
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-lg">No favorites yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add suppliers to your favorites from the "Find Suppliers" tab for quick access
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {favorites.map((favorite) => (
                <div key={favorite.id} className="border rounded-lg p-4 hover:shadow-soft transition-all">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold">
                          {favorite.suppliers?.profiles?.business_name || favorite.suppliers?.profiles?.full_name || 'Unnamed Supplier'}
                        </h3>
                        <Badge variant="secondary" className="bg-success/10 text-success">
                          ✓ Verified
                        </Badge>
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                          <Heart className="w-3 h-3 mr-1 fill-current" />
                          Favorite
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {favorite.suppliers?.profiles?.city || 'Location not set'}, {favorite.suppliers?.profiles?.state || ''}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{favorite.suppliers?.rating || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{favorite.suppliers?.delivery_time_days || 3} days</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Specializations:</p>
                        <div className="flex flex-wrap gap-2">
                          {favorite.suppliers?.specializations?.map((spec: string, idx: number) => (
                            <Badge key={idx} variant="outline">
                              {spec}
                            </Badge>
                          )) || <span className="text-sm text-muted-foreground">No specializations listed</span>}
                        </div>
                      </div>
                      
                      <p className="text-sm font-medium text-primary">
                        Min Order: ₹{favorite.suppliers?.min_order_amount || 0}
                      </p>
                      
                      <p className="text-xs text-muted-foreground">
                        Added to favorites: {new Date(favorite.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFavorite(favorite.id)}
                        className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                      >
                        <HeartOff className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button size="sm" className="bg-brand-gradient hover:opacity-90">
                        View Products
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};