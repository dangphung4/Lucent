import { useState } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { CalendarIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { addJournalEntry } from '@/lib/db';

interface AddJournalEntryDialogProps {
  productId: string;
  productName: string;
  onEntryAdded?: () => void;
  children?: React.ReactNode;
}

export function AddJournalEntryDialog({ 
  productId, 
  productName,
  onEntryAdded,
  children 
}: AddJournalEntryDialogProps) {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState('');
  const [effects, setEffects] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid) return;
    
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
        notes,
        type: 'product'
      });
      
      toast.success('Product review added');
      setOpen(false);
      onEntryAdded?.();
      
      // Reset form
      setDate(new Date());
      setRating(0);
      setReview('');
      setEffects('');
      setNotes('');
    } catch (error) {
      console.error('Error adding product review:', error);
      toast.error('Error adding product review');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button variant="ghost" size="sm">Add Review</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl">Add Product Review</DialogTitle>
            <DialogDescription>
              Record your experience with {productName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="date" className="text-sm font-medium">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="rating" className="text-sm font-medium">Rating (0-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  value={rating}
                  onChange={(e) => setRating(parseFloat(e.target.value))}
                  className="w-24 text-right"
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="review" className="text-sm font-medium">Review</Label>
              <Textarea
                id="review"
                placeholder="How did this product work for you?"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="min-h-[120px] resize-none border-muted-foreground/20 focus-visible:ring-primary/30"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Share your thoughts on this product's effectiveness, texture, scent, and how it works for your skin.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="effects" className="text-sm font-medium">Effects (comma-separated)</Label>
              <Input
                id="effects"
                placeholder="e.g., hydrating, soothing, brightening"
                value={effects}
                onChange={(e) => setEffects(e.target.value)}
                className="border-muted-foreground/20 focus-visible:ring-primary/30"
              />
              <p className="text-xs text-muted-foreground mt-1">
                List the effects you've noticed, separated by commas
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-sm font-medium">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any other observations or notes?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[80px] resize-none border-muted-foreground/20 focus-visible:ring-primary/30"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-end pt-2">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setOpen(false)} 
                type="button"
                size="sm"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saving}
                size="sm"
                className="px-4"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Review
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 