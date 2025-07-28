-- Create vendor_favorites table for managing vendor's favorite suppliers
CREATE TABLE public.vendor_favorites (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID NOT NULL,
    supplier_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Add unique constraint to prevent duplicate favorites
    UNIQUE(vendor_id, supplier_id)
);

-- Enable Row Level Security
ALTER TABLE public.vendor_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies for vendor_favorites
CREATE POLICY "Vendors can view their own favorites" 
ON public.vendor_favorites 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = vendor_favorites.vendor_id 
    AND profiles.user_id = auth.uid()
));

CREATE POLICY "Vendors can create their own favorites" 
ON public.vendor_favorites 
FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = vendor_favorites.vendor_id 
    AND profiles.user_id = auth.uid()
));

CREATE POLICY "Vendors can delete their own favorites" 
ON public.vendor_favorites 
FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = vendor_favorites.vendor_id 
    AND profiles.user_id = auth.uid()
));

-- Add foreign key constraints for referential integrity
ALTER TABLE public.vendor_favorites
ADD CONSTRAINT vendor_favorites_vendor_id_fkey 
FOREIGN KEY (vendor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.vendor_favorites
ADD CONSTRAINT vendor_favorites_supplier_id_fkey 
FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_vendor_favorites_vendor_id ON public.vendor_favorites(vendor_id);
CREATE INDEX idx_vendor_favorites_supplier_id ON public.vendor_favorites(supplier_id);
CREATE INDEX idx_vendor_favorites_created_at ON public.vendor_favorites(created_at);

-- Add trigger for updated_at column (if we need it later)
-- We don't need updated_at for this table as favorites don't get updated, only added/removed