import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Product, addProduct } from '@/lib/db';
import { toast } from 'sonner';
import { ProductForm } from './ProductForm';

interface AddProductDialogProps {
  onProductAdded?: () => void;
  children?: React.ReactNode;
}

export function AddProductDialog({ onProductAdded, children }: AddProductDialogProps) {
  const [open, setOpen] = useState(false);
  const { currentUser } = useAuth();

  const handleSubmit = async (data: Partial<Product>) => {
    if (!currentUser) return;

    try {
      await addProduct({
        ...data,
        userId: currentUser.uid,
      } as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>);
      
      setOpen(false);
      onProductAdded?.();
      toast.success('Product added', {
        description: 'Your product has been successfully added.'
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Error adding product', {
        description: 'Please try again later.'
      });
    }
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {children || (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
          </DialogHeader>
          <ProductForm 
            onSubmit={handleSubmit}
            submitText="Add Product"
          />
        </DialogContent>
      </Dialog>
    </>
  );
} 