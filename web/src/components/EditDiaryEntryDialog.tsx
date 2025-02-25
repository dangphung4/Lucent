import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendarshadcn';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Trash2, Star, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { updateJournalEntry, deleteJournalEntry, type JournalEntry } from '@/lib/db';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { Badge } from './ui/badge';
import { Input } from './ui/input';

interface EditDiaryEntryDialogProps {
  entry: JournalEntry;
  onEntryUpdated?: () => void;
  onEntryDeleted?: () => void;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditDiaryEntryDialog({ 
  entry,
  onEntryUpdated,
  onEntryDeleted,
  children,
  open: controlledOpen,
  onOpenChange: setControlledOpen
}: EditDiaryEntryDialogProps) {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(entry.date);
  const [title, setTitle] = useState(entry.title || 'Diary Entry');
  const [entryText, setEntryText] = useState(entry.review);
  const [rating, setRating] = useState(entry.rating);
  const [effects, setEffects] = useState<string[]>(entry.effects || []);
  const [newEffect, setNewEffect] = useState('');
  const [notes, setNotes] = useState(entry.notes || '');
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Determine if this is a diary entry or product review
  const isDiaryEntry = entry.type === 'diary' || entry.productId === 'diary-entry';
  
  // Handle controlled/uncontrolled state
  const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : open;
  const setIsOpen = isControlled ? setControlledOpen : setOpen;

  // Update local state when entry prop changes
  useEffect(() => {
    setDate(entry.date);
    setTitle(entry.title || 'Diary Entry');
    setEntryText(entry.review);
    setRating(entry.rating);
    setEffects(entry.effects || []);
    setNotes(entry.notes || '');
  }, [entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid) return;
    if (!entryText.trim()) {
      toast.error('Please write something in your journal entry');
      return;
    }
    
    setSaving(true);
    try {
      const updateData: Partial<JournalEntry> = {
        date,
        review: entryText,
        notes,
      };
      
      // Only update title for diary entries
      if (isDiaryEntry) {
        updateData.title = title.trim() || 'Diary Entry';
      } else {
        // For product reviews, update rating and effects
        updateData.rating = rating;
        updateData.effects = effects;
      }
      
      await updateJournalEntry(entry.id, updateData);
      
      toast.success(isDiaryEntry ? 'Diary entry updated' : 'Product review updated');
      setIsOpen(false);
      onEntryUpdated?.();
    } catch (error) {
      console.error('Error updating journal entry:', error);
      toast.error(isDiaryEntry ? 'Error updating diary entry' : 'Error updating product review');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUser?.uid) return;
    
    try {
      await deleteJournalEntry(entry.id);
      toast.success(isDiaryEntry ? 'Diary entry deleted' : 'Product review deleted');
      setDeleteDialogOpen(false);
      setIsOpen(false);
      onEntryDeleted?.();
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      toast.error(isDiaryEntry ? 'Error deleting diary entry' : 'Error deleting product review');
    }
  };

  const handleAddEffect = () => {
    if (newEffect.trim() && !effects.includes(newEffect.trim())) {
      setEffects([...effects, newEffect.trim()]);
      setNewEffect('');
    }
  };

  const handleRemoveEffect = (effectToRemove: string) => {
    setEffects(effects.filter(effect => effect !== effectToRemove));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-xl">
                {isDiaryEntry ? 'Edit Diary Entry' : 'Edit Product Review'}
              </DialogTitle>
              <DialogDescription>
                {isDiaryEntry 
                  ? 'Update your skincare diary entry'
                  : 'Update your product review and experience'
                }
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
              
              {isDiaryEntry && (
                <div className="grid gap-2">
                  <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                  <Input
                    id="title"
                    placeholder="Give your entry a title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="border-muted-foreground/20 focus-visible:ring-primary/30"
                  />
                </div>
              )}
              
              {!isDiaryEntry && (
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
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="entry" className="text-sm font-medium">
                  {isDiaryEntry ? 'Entry' : 'Review'}
                </Label>
                <Textarea
                  id="entry"
                  placeholder={isDiaryEntry 
                    ? "Dear diary, today my skin felt..." 
                    : "Write about your experience with this product..."
                  }
                  value={entryText}
                  onChange={(e) => setEntryText(e.target.value)}
                  className="min-h-[150px] resize-none border-muted-foreground/20 focus-visible:ring-primary/30"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isDiaryEntry
                    ? "Write freely about how your skin feels, what products you used, any changes you've noticed, etc."
                    : "Share your thoughts on this product's effectiveness, texture, scent, and how it works for your skin."
                  }
                </p>
              </div>
              
              {!isDiaryEntry && (
                <>
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
                </>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)} 
                  type="button"
                  size="sm"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving || !entryText.trim()}
                  size="sm"
                  className="px-4"
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your {isDiaryEntry ? 'diary entry' : 'product review'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 