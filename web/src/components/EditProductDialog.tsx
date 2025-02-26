import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Product } from '@/lib/db';
import { updateProduct } from '@/lib/db';
import { toast } from 'sonner';
import { ProductForm } from './ProductForm';

interface EditProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductUpdated?: () => void;
}

export function EditProductDialog({ product, open, onOpenChange, onProductUpdated }: EditProductDialogProps) {
  if (!product) return null;

  const handleSubmit = async (data: Partial<Product>) => {
    try {
      await updateProduct(product.id, data);
      onProductUpdated?.();
      onOpenChange(false);
      toast.success('Product updated', {
        description: 'Your product has been successfully updated.'
      });
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error updating product', {
        description: 'Please try again later.'
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <ProductForm 
          defaultValues={product}
          onSubmit={handleSubmit}
          submitText="Save Changes"
        />
      </DialogContent>
    </Dialog>
  );
} 