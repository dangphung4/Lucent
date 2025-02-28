import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Trash2, Edit2, Save, X, ZoomIn, Download } from 'lucide-react';
import { format } from 'date-fns';
import { storage } from '../lib/firebase';
import { ref, deleteObject, updateMetadata, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ProgressPhotoModalProps {
  photo: {
    url: string;
    date: Date;
    name?: string;
    storagePath: string;
  };
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  onNameChange: (newName: string) => void;
}

export function ProgressPhotoModal({
  photo,
  isOpen,
  onClose,
  onDelete,
  onNameChange,
}: ProgressPhotoModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(photo.name || '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Update newName when photo changes
  useEffect(() => {
    setNewName(photo.name || '');
  }, [photo]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const photoRef = ref(storage, photo.storagePath);
      await deleteObject(photoRef);
      onDelete();
      toast.success('Photo deleted successfully');
      onClose();
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveName = async () => {
    if (!newName.trim()) {
      toast.error('Please enter a name');
      return;
    }

    try {
      const photoRef = ref(storage, photo.storagePath);
      await updateMetadata(photoRef, {
        customMetadata: {
          name: newName.trim()
        }
      });
      onNameChange(newName.trim());
      setIsEditing(false);
      toast.success('Name updated successfully');
    } catch (error) {
      console.error('Error updating name:', error);
      toast.error('Failed to update name');
    }
  };

  const handleDownload = async () => {
    try {
      // Get a fresh download URL from Firebase Storage
      const photoRef = ref(storage, photo.storagePath);
      const freshUrl = await getDownloadURL(photoRef);
      
      // Create a temporary anchor element
      const a = document.createElement('a');
      a.href = freshUrl;
      a.download = `${photo.name || format(photo.date, 'yyyy-MM-dd')}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success('Photo downloaded successfully');
    } catch (error) {
      console.error('Error downloading photo:', error);
      toast.error('Failed to download photo');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-w-[95vw] flex flex-col p-0 gap-0",
        isFullscreen ? "w-screen h-screen" : "w-[90vw] h-[90vh] max-h-[900px]"
      )}>
        <DialogHeader className="p-3 sm:p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="flex items-center gap-2 max-w-full">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Enter photo name"
                    className="max-w-[200px] sm:max-w-sm h-8 text-sm"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveName();
                      if (e.key === 'Escape') setIsEditing(false);
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveName}
                    className="h-8 px-2"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    className="h-8 px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate font-medium text-sm sm:text-base">
                    {photo.name || format(photo.date, 'PPP')}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="h-8 px-2"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="hidden sm:flex h-8 px-2"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="h-8 px-2"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 px-2"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 px-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-black/90 relative">
          <div className={cn(
            "absolute inset-0 flex items-center justify-center",
            isFullscreen ? "p-0" : "p-4"
          )}>
            <img
              src={photo.url}
              alt={photo.name || format(photo.date, 'PPP')}
              className={cn(
                "max-h-full max-w-full object-contain",
                isFullscreen ? "w-full h-full" : "rounded-md",
                "transition-all duration-200 ease-in-out"
              )}
              onClick={() => setIsFullscreen(!isFullscreen)}
            />
          </div>
        </div>

        <DialogFooter className="p-3 sm:p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-sm text-muted-foreground">
              {format(photo.date, 'PPP')}
            </div>
            <div className="flex items-center gap-2 sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="flex-1 h-8"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 