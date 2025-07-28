import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Edit, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EditProductDialogProps {
  product: any;
  onProductUpdated: () => void;
}

export const EditProductDialog = ({ product, onProductUpdated }: EditProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(product.image_urls || []);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: product.name || '',
    name_hindi: product.name_hindi || '',
    category: product.category || '',
    description: product.description || '',
    description_hindi: product.description_hindi || '',
    price_per_unit: product.price_per_unit?.toString() || '',
    unit: product.unit || '',
    minimum_order_quantity: product.minimum_order_quantity?.toString() || '1',
    available_quantity: product.available_quantity?.toString() || '',
    is_active: product.is_active !== undefined ? product.is_active : true
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

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(img => img !== url));
  };

  const uploadNewImages = async () => {
    if (imageFiles.length === 0) return [];
    
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
        description: "Failed to upload new images",
        variant: "destructive"
      });
      return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload new images
      const newImageUrls = await uploadNewImages();
      
      // Combine existing and new image URLs
      const allImageUrls = [...existingImages, ...newImageUrls];

      // Update the product
      const { error } = await supabase
        .from('products')
        .update({
          name: formData.name,
          name_hindi: formData.name_hindi || null,
          category: formData.category,
          description: formData.description || null,
          description_hindi: formData.description_hindi || null,
          price_per_unit: parseFloat(formData.price_per_unit),
          unit: formData.unit,
          minimum_order_quantity: parseInt(formData.minimum_order_quantity),
          available_quantity: formData.available_quantity ? parseInt(formData.available_quantity) : null,
          image_urls: allImageUrls.length > 0 ? allImageUrls : null,
          is_active: formData.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully!"
      });

      setOpen(false);
      setImageFiles([]);
      onProductUpdated();
    } catch (error) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1">
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update your product information and settings.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label>Product Status</Label>
              <p className="text-sm text-muted-foreground">
                Toggle to activate or deactivate this product
              </p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name (English) *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name_hindi">Product Name (Hindi)</Label>
              <Input
                id="name_hindi"
                value={formData.name_hindi}
                onChange={(e) => setFormData(prev => ({ ...prev, name_hindi: e.target.value }))}
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
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="available_quantity">Available Qty</Label>
              <Input
                id="available_quantity"
                type="number"
                value={formData.available_quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, available_quantity: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (English)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description_hindi">Description (Hindi)</Label>
            <Textarea
              id="description_hindi"
              value={formData.description_hindi}
              onChange={(e) => setFormData(prev => ({ ...prev, description_hindi: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Product Images</Label>
            
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Current Images:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {existingImages.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Product ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                        onClick={() => removeExistingImage(url)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => document.getElementById('edit-image-upload')?.click()}
              >
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to add more images</p>
                <input
                  id="edit-image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              {/* New Images Preview */}
              {imageFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">New Images:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                          onClick={() => removeNewImage(index)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-brand-gradient hover:opacity-90">
              {loading ? 'Updating...' : 'Update Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
