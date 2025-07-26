import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AddProductDialogProps {
  onProductAdded: () => void;
}

export const AddProductDialog = ({ onProductAdded }: AddProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    name_hindi: '',
    category: '',
    description: '',
    description_hindi: '',
    price_per_unit: '',
    unit: '',
    minimum_order_quantity: '1',
    available_quantity: ''
  });

  const categories = [
    'Vegetables', 'Fruits', 'Spices', 'Grains', 'Pulses', 'Dairy', 'Meat', 'Poultry', 'Seafood', 'Oil & Ghee'
  ];

  const units = ['kg', 'gram', 'liter', 'piece', 'dozen', 'quintal'];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        toast({
          title: "Error",
          description: "Please select only image files",
          variant: "destructive"
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "Error", 
          description: "Images must be under 10MB",
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });
    
    setImageFiles(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) return [];
    
    setUploadingImages(true);
    const uploadedUrls: string[] = [];
    
    try {
      for (const file of imageFiles) {
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;
        
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (error) throw error;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(data.path);
          
        uploadedUrls.push(publicUrl);
      }
      
      return uploadedUrls;
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error",
        description: "Failed to upload images",
        variant: "destructive"
      });
      return [];
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get supplier profile
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

      let supplierId = suppliers?.id;

      // If no supplier record exists, create one
      if (!supplierId) {
        const { data: newSupplier, error: createSupplierError } = await supabase
          .from('suppliers')
          .insert({
            profile_id: profiles.id,
            description: 'Fresh quality products supplier',
            specializations: [formData.category],
            delivery_time_days: 3,
            min_order_amount: 0
          })
          .select()
          .single();

        if (createSupplierError) throw createSupplierError;
        supplierId = newSupplier.id;
      }

      // Upload images first
      const imageUrls = await uploadImages();

      // Create the product
      const { error: productError } = await supabase
        .from('products')
        .insert({
          supplier_id: supplierId,
          name: formData.name,
          name_hindi: formData.name_hindi || null,
          category: formData.category,
          description: formData.description || null,
          description_hindi: formData.description_hindi || null,
          price_per_unit: parseFloat(formData.price_per_unit),
          unit: formData.unit,
          minimum_order_quantity: parseInt(formData.minimum_order_quantity),
          available_quantity: formData.available_quantity ? parseInt(formData.available_quantity) : null,
          image_urls: imageUrls.length > 0 ? imageUrls : null,
          is_active: true
        });

      if (productError) throw productError;

      toast({
        title: "Success",
        description: "Product added successfully!"
      });

      setOpen(false);
      setImageFiles([]);
      setFormData({
        name: '',
        name_hindi: '',
        category: '',
        description: '',
        description_hindi: '',
        price_per_unit: '',
        unit: '',
        minimum_order_quantity: '1',
        available_quantity: ''
      });
      
      onProductAdded();
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive"
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
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Add a new product to your inventory that vendors can order.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name (English) *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Fresh Tomatoes"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name_hindi">Product Name (Hindi)</Label>
              <Input
                id="name_hindi"
                value={formData.name_hindi}
                onChange={(e) => setFormData(prev => ({ ...prev, name_hindi: e.target.value }))}
                placeholder="e.g., ताजा टमाटर"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unit">Unit *</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_per_unit">Price per Unit (₹) *</Label>
              <Input
                id="price_per_unit"
                type="number"
                step="0.01"
                value={formData.price_per_unit}
                onChange={(e) => setFormData(prev => ({ ...prev, price_per_unit: e.target.value }))}
                placeholder="45.00"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minimum_order_quantity">Min Order Qty</Label>
              <Input
                id="minimum_order_quantity"
                type="number"
                value={formData.minimum_order_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, minimum_order_quantity: e.target.value }))}
                placeholder="1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="available_quantity">Available Qty</Label>
              <Input
                id="available_quantity"
                type="number"
                value={formData.available_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, available_quantity: e.target.value }))}
                placeholder="1000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (English)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Fresh, organic tomatoes directly from farm..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_hindi">Description (Hindi)</Label>
            <Textarea
              id="description_hindi"
              value={formData.description_hindi}
              onChange={(e) => setFormData(prev => ({ ...prev, description_hindi: e.target.value }))}
              placeholder="खेत से सीधे ताजा, जैविक टमाटर..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Product Images</Label>
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload images or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB each</p>
                <input
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              {imageFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {imageFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Product ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeImage(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploadingImages} className="bg-brand-gradient hover:opacity-90">
              {loading || uploadingImages ? 'Adding...' : 'Add Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};