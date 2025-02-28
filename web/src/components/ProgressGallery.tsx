import { useState, useEffect, useRef } from 'react';
import { storage } from '../lib/firebase';
import { ref, listAll, getDownloadURL, getMetadata, uploadBytes } from 'firebase/storage';
import { useAuth } from '../lib/AuthContext';
import { Card } from './ui/card';
import { 
  Loader2, 
  Camera, 
  Upload, 
  ArrowUpDown,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { ProgressPhotoModal } from './ProgressPhotoModal';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from 'sonner';

interface ProgressPhoto {
  url: string;
  date: Date;
  name?: string;
  storagePath: string;
}

type SortOrder = 'newest' | 'oldest';

export function ProgressGallery() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const { currentUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPhotos = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const storageRef = ref(storage, `progress/${currentUser.uid}`);
      const result = await listAll(storageRef);

      const photoPromises = result.items.map(async (item) => {
        const url = await getDownloadURL(item);
        const metadata = await getMetadata(item);
        const timestamp = parseInt(item.name.split('_')[0]);
        return {
          url,
          date: new Date(timestamp),
          name: metadata.customMetadata?.name,
          storagePath: item.fullPath,
        };
      });

      const loadedPhotos = await Promise.all(photoPromises);
      sortPhotos(loadedPhotos, sortOrder);
      setPhotos(loadedPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortPhotos = (photoList: ProgressPhoto[], order: SortOrder) => {
    return photoList.sort((a, b) => {
      const comparison = b.date.getTime() - a.date.getTime();
      return order === 'newest' ? comparison : -comparison;
    });
  };

  const handleSortChange = (newOrder: SortOrder) => {
    setSortOrder(newOrder);
    const sortedPhotos = [...photos];
    sortPhotos(sortedPhotos, newOrder);
    setPhotos(sortedPhotos);
  };

  useEffect(() => {
    loadPhotos();
  }, [currentUser]);

  const handlePhotoClick = (photo: ProgressPhoto) => {
    setSelectedPhoto(photo);
  };

  const handlePhotoDelete = () => {
    setPhotos(photos.filter(p => p.storagePath !== selectedPhoto?.storagePath));
    setSelectedPhoto(null);
  };

  const handleNameChange = (newName: string) => {
    if (!selectedPhoto) return;
    
    setPhotos(photos.map(photo => 
      photo.storagePath === selectedPhoto.storagePath
        ? { ...photo, name: newName }
        : photo
    ));
    setSelectedPhoto({ ...selectedPhoto, name: newName });
  };

  // Group photos by month
  const groupedPhotos = photos.reduce((groups, photo) => {
    const monthKey = format(photo.date, 'MMMM yyyy');
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(photo);
    return groups;
  }, {} as Record<string, ProgressPhoto[]>);

  // Add this function to handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    try {
      setLoading(true);
      const timestamp = new Date().getTime();
      const storageRef = ref(storage, `progress/${currentUser.uid}/${timestamp}_${file.name}`);
      await uploadBytes(storageRef, file);
      await loadPhotos(); // Reload photos after upload
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  // Add this function to handle camera capture
  const handleCameraCapture = async () => {
    // You can implement camera capture here or use a modal/component
    toast('Camera functionality coming soon');
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" style={{ padding: '2rem' }} />
          <Loader2 className="h-8 w-8 animate-spin text-primary relative z-10" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-medium">Loading your gallery</p>
          <p className="text-sm text-muted-foreground">Please wait while we fetch your progress photos</p>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-4">
        <div className="max-w-sm w-full space-y-6">
          <div className="text-center">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2">Start Your Journey</h2>
            <p className="text-muted-foreground mb-6">
              Track your skincare progress by taking regular photos. Watch your transformation over time.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleCameraCapture} className="gap-2">
                <Camera className="h-4 w-4" />
                Take Photo
              </Button>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Photo
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-medium">Progress Gallery</h2>
              <p className="text-sm text-muted-foreground">
                {photos.length} {photos.length === 1 ? 'photo' : 'photos'} • {Object.keys(groupedPhotos).length} {Object.keys(groupedPhotos).length === 1 ? 'month' : 'months'}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2">
                <ArrowUpDown className="h-3.5 w-3.5" />
                {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={() => handleSortChange('newest')} className="gap-2">
                Newest first
                {sortOrder === 'newest' && <div className="ml-auto w-1 h-1 rounded-full bg-primary" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('oldest')} className="gap-2">
                Oldest first
                {sortOrder === 'oldest' && <div className="ml-auto w-1 h-1 rounded-full bg-primary" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Timeline */}
      <div className="divide-y divide-border/50">
        {Object.entries(groupedPhotos).map(([month, monthPhotos]) => (
          <motion.div
            key={month}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="py-6 first:pt-4"
          >
            <div className="px-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">
                    {format(monthPhotos[0].date, 'MMMM yyyy')}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {monthPhotos.length} {monthPhotos.length === 1 ? 'photo' : 'photos'}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 px-4">
              <AnimatePresence mode="popLayout">
                {monthPhotos.map((photo) => (
                  <motion.div
                    key={photo.storagePath}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card 
                      className={cn(
                        "overflow-hidden cursor-pointer group relative",
                        "hover:ring-2 hover:ring-primary/20 hover:shadow-lg",
                        "active:scale-95",
                        "transition-all duration-200 ease-out"
                      )}
                      onClick={() => handlePhotoClick(photo)}
                    >
                      <div className="aspect-square relative bg-muted">
                        <img
                          src={photo.url}
                          alt={photo.name || `Progress photo from ${format(photo.date, 'PPP')}`}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <div className="space-y-1">
                            {photo.name && (
                              <p className="text-sm font-medium text-white line-clamp-1 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                {photo.name}
                              </p>
                            )}
                            <p className="text-[10px] text-white/90 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 delay-75">
                              {format(photo.date, 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {selectedPhoto && (
        <ProgressPhotoModal
          photo={selectedPhoto}
          isOpen={!!selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onDelete={handlePhotoDelete}
          onNameChange={handleNameChange}
        />
      )}
    </div>
  );
} 