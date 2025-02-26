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
import { CalendarIcon, Loader2, Plus, X, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { addJournalEntry } from '@/lib/db';
import { Badge } from './ui/badge';

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
  const [effects, setEffects] = useState<string[]>([]);
  const [newEffect, setNewEffect] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddEffect = () => {
    if (newEffect.trim() && !effects.includes(newEffect.trim())) {
      setEffects([...effects, newEffect.trim()]);
      setNewEffect('');
    }
  };

  const handleRemoveEffect = (effectToRemove: string) => {
    setEffects(effects.filter(effect => effect !== effectToRemove));
  };

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
        effects: effects,
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
      setEffects([]);
      setNewEffect('');
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
              <Label className="text-sm font-medium">Rating</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "p-0 h-8 w-8",
                      star <= rating ? "text-amber-500" : "text-muted-foreground/30"
                    )}
                    onClick={() => setRating(star)}
                  >
                    <Star className="h-5 w-5" fill={star <= rating ? "currentColor" : "none"} />
                  </Button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating}/5
                </span>
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
              <Label className="text-sm font-medium">Effects</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {effects.map((effect, index) => (
                  <Badge key={index} variant="secondary" className="px-2 py-1 gap-1">
                    {effect}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveEffect(effect)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add effect (e.g., hydrating)"
                  value={newEffect}
                  onChange={(e) => setNewEffect(e.target.value)}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEffect();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={handleAddEffect}
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Add effects you've noticed from using this product
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