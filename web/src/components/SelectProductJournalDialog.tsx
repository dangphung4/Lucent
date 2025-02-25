import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendarshadcn';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { addJournalEntry, getUserProducts, type Product } from '@/lib/db';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SelectProductJournalDialogProps {
  onEntryAdded?: () => void;
  children?: React.ReactNode;
}

/**
 * A dialog component for selecting a product and adding a journal entry.
 * This component allows users to record their experiences with products.
 *
 * @param {Object} props - The properties for the component.
 * @param {function} props.onEntryAdded - Callback function to be called when a new journal entry is added.
 * @param {React.ReactNode} props.children - Optional children to be rendered as the dialog trigger.
 *
 * @returns {JSX.Element} The rendered dialog component.
 *
 * @example
 * <SelectProductJournalDialog onEntryAdded={() => console.log('Entry added!')}>
 *   <Button>Add Journal Entry</Button>
 * </SelectProductJournalDialog>
 *
 * @throws {Error} Throws an error if there is an issue loading products or adding a journal entry.
 */
export function SelectProductJournalDialog({ 
  onEntryAdded,
  children 
}: SelectProductJournalDialogProps) {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [productId, setProductId] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState('');
  const [effects, setEffects] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Load products when dialog opens
  useEffect(() => {
    if (open && currentUser) {
      loadProducts();
    }
  }, [open, currentUser]);

  /**
   * Asynchronously loads products for the current user.
   *
   * This function checks if there is a current user. If not, it exits early.
   * It sets a loading state to true while fetching the user's products from the server.
   * If the fetch is successful, the products are stored in the state.
   * If an error occurs during the fetch, it logs the error and displays a toast notification to the user.
   * Finally, it resets the loading state to false.
   *
   * @async
   * @function loadProducts
   * @returns {Promise<void>} A promise that resolves when the products are loaded or an error occurs.
   *
   * @throws {Error} Throws an error if fetching products fails, which is caught and handled within the function.
   *
   * @example
   * // Load products for the current user
   * loadProducts().then(() => {
   *   console.log('Products loaded successfully');
   * }).catch((error) => {
   *   console.error('Failed to load products:', error);
   * });
   */
  const loadProducts = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const fetchedProducts = await getUserProducts(currentUser.uid);
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the submission of a journal entry form.
   *
   * This function is triggered when the form is submitted. It prevents the default form submission behavior,
   * checks for the presence of a current user and product ID, and if valid, it proceeds to add a journal entry.
   * It also manages the UI state by displaying success or error messages and resetting the form fields after submission.
   *
   * @param {React.FormEvent} e - The event object representing the form submission.
   *
   * @throws {Error} Throws an error if adding the journal entry fails, which is caught and logged.
   *
   * @returns {Promise<void>} A promise that resolves when the journal entry has been successfully added.
   *
   * @example
   * // Example usage in a React component
   * const onSubmit = (event) => {
   *   handleSubmit(event);
   * };
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid || !productId) {
      toast.error('Please select a product');
      return;
    }
    
    setSaving(true);
    try {
      await addJournalEntry({
        userId: currentUser.uid,
        productId,
        date,
        rating,
        review,
        effects: effects.split(',').map(e => e.trim()).filter(Boolean),
        usageDuration: Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24)),
        notes
      });
      
      toast.success('Journal entry added');
      setOpen(false);
      onEntryAdded?.();
      
      // Reset form
      setProductId('');
      setDate(new Date());
      setRating(0);
      setReview('');
      setEffects('');
      setNotes('');
    } catch (error) {
      console.error('Error adding journal entry:', error);
      toast.error('Error adding journal entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Journal Entry
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Journal Entry</DialogTitle>
            <DialogDescription>
              Record your experience with a product
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="product">Product</Label>
              {loading ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2 border rounded-md">
                  No products found. Please add products first.
                </div>
              ) : (
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.brand})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.5"
                value={rating}
                onChange={(e) => setRating(parseFloat(e.target.value))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="review">Review</Label>
              <Textarea
                id="review"
                placeholder="How did this product work for you?"
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="effects">Effects (comma-separated)</Label>
              <Input
                id="effects"
                placeholder="e.g., hydrating, soothing, brightening"
                value={effects}
                onChange={(e) => setEffects(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any other observations or notes?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !productId}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Entry
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 