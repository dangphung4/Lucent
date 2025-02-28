import { useState, useEffect } from 'react';
import { storage } from '../lib/firebase';
import { ref, listAll, getDownloadURL, getMetadata } from 'firebase/storage';
import { useAuth } from '../lib/AuthContext';
import { Card } from './ui/card';
import { 
  Loader2, 
  Camera, 
  Upload, 
  ArrowUpDown,
  Plus
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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

  if (loading) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center p-6 gap-3">
        <div className="relative">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <div className="absolute inset-0 h-6 w-6 animate-ping opacity-50 rounded-full bg-primary/10" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Loading your progress photos...</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-4">
        <div className="max-w-sm w-full space-y-6">
          <div className="text-center">
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Camera className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-semibold tracking-tight">Start Your Journey</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-[20rem] mx-auto">
              Document your progress with regular photos to track your skin's transformation over time
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full h-12 gap-2 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary"
              variant="ghost"
              onClick={() => {}}
            >
              <Camera className="h-5 w-5" />
              Take Your First Photo
            </Button>
            <Button 
              className="w-full h-12 gap-2"
              variant="outline"
              onClick={() => {}}
            >
              <Upload className="h-5 w-5" />
              Upload from Device
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-16">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Progress Gallery</h2>
            <p className="text-sm text-muted-foreground">
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'} in your journey
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2 gap-1.5">
                  <ArrowUpDown className="h-4 w-4" />
                  {sortOrder === 'newest' ? 'Newest' : 'Oldest'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => handleSortChange('newest')} className="gap-2">
                  Newest first
                  {sortOrder === 'newest' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSortChange('oldest')} className="gap-2">
                  Oldest first
                  {sortOrder === 'oldest' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="divide-y divide-border/50">
        {Object.entries(groupedPhotos).map(([month, monthPhotos]) => (
          <div key={month} className="py-6 first:pt-4">
            <div className="px-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">
                    {format(monthPhotos[0].date, 'MMM')}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium">{month}</h3>
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
                        "overflow-hidden cursor-pointer",
                        "hover:ring-2 hover:ring-primary/20 hover:shadow-lg",
                        "transition-all duration-200 ease-in-out"
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform">
                          <div className="space-y-1">
                            {photo.name && (
                              <p className="text-sm font-medium line-clamp-1">
                                {photo.name}
                              </p>
                            )}
                            <p className="text-xs text-white/90 flex items-center gap-1.5">
                              <span>{format(photo.date, 'MMM d')}</span>
                              <span className="w-1 h-1 rounded-full bg-white/50" />
                              <span>{format(photo.date, 'h:mm a')}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-4 right-4 z-30">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              size="icon" 
              className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
            >
              <Plus className="h-6 w-6" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2">
            <DropdownMenuItem className="flex items-center gap-3 py-3 px-3 focus:bg-primary focus:text-primary-foreground">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Camera className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Take Photo</span>
                <span className="text-xs text-muted-foreground">Use your camera</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-3 py-3 px-3 focus:bg-primary focus:text-primary-foreground">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-medium">Upload Photo</span>
                <span className="text-xs text-muted-foreground">Choose from your device</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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