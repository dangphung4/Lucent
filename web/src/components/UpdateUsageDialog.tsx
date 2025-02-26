import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2 } from 'lucide-react';
import { updateProduct } from '@/lib/db';
import { toast } from 'sonner';

interface UpdateUsageDialogProps {
  productId: string;
  productName: string;
  onUsageUpdated: () => void;
  children?: React.ReactNode;
}

export function UpdateUsageDialog({ productId, productName, onUsageUpdated, children }: UpdateUsageDialogProps) {
  const [open, setOpen] = useState(false);
  const [usageDuration, setUsageDuration] = useState<number>(0);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    setSaving(true);
    try {
      await updateProduct(productId, {
        usageDuration: usageDuration || 0,
      });
      toast.success('Usage duration updated');
      onUsageUpdated();
      setOpen(false);
    } catch (error) {
      console.error('Error updating usage:', error);
      toast.error('Failed to update usage duration');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button variant="ghost" size="sm">Update Usage</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Usage Duration</DialogTitle>
          <DialogDescription>
            How long have you been using {productName}?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Usage Duration (in days)</Label>
            <Input
              type="number"
              min="0"
              value={usageDuration}
              onChange={(e) => setUsageDuration(parseInt(e.target.value) || 0)}
              placeholder="Enter number of days"
            />
            <p className="text-sm text-muted-foreground">
              {usageDuration === 0 ? "Haven't started using yet" :
               usageDuration === 1 ? "1 day" :
               usageDuration < 30 ? `${usageDuration} days` :
               Math.floor(usageDuration / 30) === 1 ? "1 month" :
               `${Math.floor(usageDuration / 30)} months`}
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 