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
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendarshadcn';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { addJournalEntry } from '@/lib/db';
import { Input } from './ui/input';

interface DiaryEntryDialogProps {
  productId?: string;
  productName?: string;
  onEntryAdded?: () => void;
  children?: React.ReactNode;
}

export function DiaryEntryDialog({ 
  productId,
  productName,
  onEntryAdded,
  children 
}: DiaryEntryDialogProps) {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [title, setTitle] = useState('');
  const [entry, setEntry] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid) return;
    if (!entry.trim()) {
      toast.error('Please write something in your journal entry');
      return;
    }
    
    setSaving(true);
    try {
      await addJournalEntry({
        userId: currentUser.uid,
        productId: productId || 'diary-entry', // Use a special ID for diary entries without a product
        date,
        rating: 0, // Not applicable for diary entries
        review: entry,
        effects: [], // Not applicable for diary entries
        usageDuration: 0, // Not applicable for diary entries
        notes: '',
        type: 'diary', // Explicitly set type to diary
        title: title.trim() || 'Diary Entry' // Use default title if none provided
      });
      
      toast.success('Diary entry added');
      setOpen(false);
      onEntryAdded?.();
      
      // Reset form
      setDate(new Date());
      setTitle('');
      setEntry('');
    } catch (error) {
      console.error('Error adding diary entry:', error);
      toast.error('Error adding diary entry');
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
            New Diary Entry
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl">Add to Your Skincare Diary</DialogTitle>
            <DialogDescription>
              {productName 
                ? `Write about your experience with ${productName}` 
                : "Record your thoughts, observations, and skincare journey"}
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
              <Label htmlFor="title" className="text-sm font-medium">Title</Label>
              <Input
                id="title"
                placeholder="Give your entry a title (optional)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-muted-foreground/20 focus-visible:ring-primary/30"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="entry" className="text-sm font-medium">Entry</Label>
              <Textarea
                id="entry"
                placeholder="Dear diary, today my skin felt..."
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                className="min-h-[200px] resize-none border-muted-foreground/20 focus-visible:ring-primary/30"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1">
                Write freely about how your skin feels, what products you used, any changes you've noticed, etc.
              </p>
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
                disabled={saving || !entry.trim()}
                size="sm"
                className="px-4"
              >
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Entry
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 