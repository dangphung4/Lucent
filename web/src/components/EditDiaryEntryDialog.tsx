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
import { CalendarIcon, Loader2, Trash2, Star } from 'lucide-react';
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

/**
 * A dialog component for editing diary entries or product reviews.
 *
 * @param {Object} props - The properties for the dialog.
 * @param {JournalEntry} props.entry - The entry to be edited, containing details such as date, title, and review.
 * @param {Function} props.onEntryUpdated - Callback function to be called when the entry is successfully updated.
 * @param {Function} props.onEntryDeleted - Callback function to be called when the entry is successfully deleted.
 * @param {React.ReactNode} props.children - Child components to be rendered as the dialog trigger.
 * @param {boolean} props.open - A controlled prop to manage the open state of the dialog.
 * @param {Function} props.onOpenChange - A function to set the controlled open state.
 *
 * @returns {JSX.Element} The rendered dialog component.
 *
 * @throws {Error} Throws an error if there is an issue updating or deleting the entry.
 *
 * @example
 * <EditDiaryEntryDialog
 *   entry={entry}
 *   onEntryUpdated={() => console.log('Entry updated')}
 *   onEntryDeleted={() => console.log('Entry deleted')}
 * >
 *   <Button>Edit Entry</Button>
 * </EditDiaryEntryDialog>
 */
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
  }, [entry]);

  /**
   * Handles the submission of a journal entry form.
   *
   * This asynchronous function prevents the default form submission behavior,
   * checks for the presence of a current user and validates the entry text.
   * If validation passes, it prepares the data for updating a journal entry
   * and calls the appropriate update function. It also manages loading states
   * and displays success or error messages based on the outcome of the update.
   *
   * @param {React.FormEvent} e - The event object from the form submission.
   * @returns {Promise<void>} - A promise that resolves when the submission process is complete.
   *
   * @throws {Error} - Throws an error if there is an issue updating the journal entry.
   *
   * @example
   * // Example usage within a React component
   * const handleFormSubmit = (event) => {
   *   handleSubmit(event);
   * };
   */
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
      };
      
      // Only update title for diary entries
      if (isDiaryEntry) {
        updateData.title = title.trim() || 'Diary Entry';
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

  /**
   * Asynchronously handles the deletion of a journal entry or product review.
   * This function checks if the current user is authenticated before attempting
   * to delete the specified entry. It provides feedback to the user via toast notifications
   * and manages the state of the delete dialog.
   *
   * @async
   * @function handleDelete
   * @returns {Promise<void>} A promise that resolves when the deletion process is complete.
   *
   * @throws {Error} Throws an error if the deletion fails, which is caught and logged.
   *
   * @example
   * // Usage within a component
   * const onDelete = async () => {
   *   await handleDelete();
   * };
   *
   * @example
   * // Example of handling success and error notifications
   * handleDelete()
   *   .then(() => console.log('Entry deleted successfully'))
   *   .catch((error) => console.error('Failed to delete entry', error));
   */
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
              
              {!isDiaryEntry && entry.rating > 0 && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium">Rating</Label>
                  <Badge variant="secondary" className="bg-accent/50 text-accent-foreground">
                    <Star className="h-3 w-3 mr-1" />
                    {entry.rating}/5
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">
                    (Rating can be updated in the product review section)
                  </span>
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
                  className="min-h-[200px] resize-none border-muted-foreground/20 focus-visible:ring-primary/30"
                  autoFocus
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {isDiaryEntry
                    ? "Write freely about how your skin feels, what products you used, any changes you've noticed, etc."
                    : "Share your thoughts on this product's effectiveness, texture, scent, and how it works for your skin."
                  }
                </p>
              </div>
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