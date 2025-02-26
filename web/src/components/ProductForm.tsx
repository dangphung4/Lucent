import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Product } from '@/lib/db';
import { DialogFooter } from './ui/dialog';

const PRODUCT_CATEGORIES = [
  'Cleanser',
  'Toner',
  'Serum',
  'Moisturizer',
  'Sunscreen',
  'Mask',
  'Exfoliant',
  'Eye Cream',
  'Treatment',
  'Other'
] as const;

interface ProductFormProps {
  defaultValues?: Partial<Product>;
  onSubmit: (data: Partial<Product>) => Promise<void>;
  submitText?: string;
}

export function ProductForm({ defaultValues = {}, onSubmit, submitText = 'Save' }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: defaultValues.name || '',
    brand: defaultValues.brand || '',
    category: defaultValues.category || '',
    description: defaultValues.description || '',
    size: defaultValues.size || '',
    price: defaultValues.price?.toString() || '',
    notes: defaultValues.notes || '',
    rating: defaultValues.rating?.toString() || '',
    status: defaultValues.status || 'active',
    wouldRepurchase: defaultValues.wouldRepurchase || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const price = formData.price ? parseFloat(formData.price) : undefined;
      const rating = formData.rating ? parseFloat(formData.rating) : undefined;
      
      await onSubmit({
        name: formData.name,
        brand: formData.brand,
        category: formData.category || undefined,
        description: formData.description || undefined,
        size: formData.size || undefined,
        price,
        rating,
        notes: formData.notes || undefined,
        status: formData.status,
        wouldRepurchase: formData.wouldRepurchase,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="brand">Brand *</Label>
          <Input
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {PRODUCT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category.toLowerCase()}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="size">Size</Label>
            <Input
              id="size"
              name="size"
              value={formData.size}
              onChange={handleChange}
              placeholder="e.g. 30ml"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="rating">Rating</Label>
            <Input
              id="rating"
              name="rating"
              type="number"
              min="0"
              max="5"
              step="0.5"
              value={formData.rating}
              onChange={handleChange}
              placeholder="0-5"
            />
          </div>
          <div className="grid gap-2">
            <Label>Product Status</Label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status === 'finished'}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.checked ? 'finished' : 'active',
                      wouldRepurchase: e.target.checked ? prev.wouldRepurchase : false,
                    }))
                  }
                />
                Mark as Finished
              </label>
              {formData.status === 'finished' && (
                <label className="flex items-center gap-2 text-sm pl-6">
                  <input
                    type="checkbox"
                    name="wouldRepurchase"
                    checked={formData.wouldRepurchase}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        wouldRepurchase: e.target.checked,
                      }))
                    }
                  />
                  Would Repurchase
                </label>
              )}
            </div>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="resize-none"
            placeholder="Any additional notes about the product..."
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : submitText}
        </Button>
      </DialogFooter>
    </form>
  );
} 