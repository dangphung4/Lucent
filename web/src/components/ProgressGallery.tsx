import { useState, useEffect } from 'react';
import { storage } from '../lib/firebase';
import { ref, listAll, getDownloadURL, getMetadata } from 'firebase/storage';
import { useAuth } from '../lib/AuthContext';
import { Card } from './ui/card';
import { Loader2, Camera } from 'lucide-react';
import { format } from 'date-fns';
import { ProgressPhotoModal } from './ProgressPhotoModal';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressPhoto {
  url: string;
  date: Date;
  name?: string;
  storagePath: string;
}

export function ProgressGallery() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
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
      loadedPhotos.sort((a, b) => b.date.getTime() - a.date.getTime());
      setPhotos(loadedPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center p-8 gap-4">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="absolute inset-0 h-8 w-8 animate-ping opacity-50 rounded-full bg-primary/10" />
        </div>
        <p className="text-muted-foreground animate-pulse">Loading your progress photos...</p>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center p-8 gap-6 text-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="h-10 w-10 text-primary" />
          </div>
          <div className="absolute inset-0 w-20 h-20 animate-pulse rounded-full bg-primary/5" />
        </div>
        <div className="space-y-2 max-w-sm">
          <p className="font-medium text-lg">No progress photos yet</p>
          <p className="text-sm text-muted-foreground">
            Start tracking your progress by taking your first photo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Progress Photos</h2>
          <p className="text-sm text-muted-foreground">
            {photos.length} {photos.length === 1 ? 'photo' : 'photos'} in your collection
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
        <AnimatePresence mode="popLayout">
          {photos.map((photo) => (
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
                  "overflow-hidden group relative cursor-pointer",
                  "hover:ring-2 hover:ring-primary/50 hover:shadow-lg",
                  "transition-all duration-200 ease-in-out"
                )}
                onClick={() => handlePhotoClick(photo)}
              >
                <div className="aspect-square relative bg-muted/30">
                  <img
                    src={photo.url}
                    alt={photo.name || `Progress photo from ${format(photo.date, 'PPP')}`}
                    className={cn(
                      "w-full h-full object-cover",
                      "transition-all duration-300 ease-out",
                      "group-hover:scale-[1.02]"
                    )}
                    loading="lazy"
                  />
                  <div className={cn(
                    "absolute inset-0",
                    "bg-gradient-to-t from-black/90 via-black/30 to-transparent",
                    "opacity-0 group-hover:opacity-100",
                    "transition-opacity duration-200"
                  )} />
                  <div className={cn(
                    "absolute bottom-0 left-0 right-0 p-3",
                    "text-white",
                    "opacity-0 group-hover:opacity-100",
                    "transition-opacity duration-200"
                  )}>
                    <p className="text-sm font-medium line-clamp-2">
                      {photo.name || format(photo.date, 'PPP')}
                    </p>
                    <p className="text-xs text-white/80 mt-1">
                      {format(photo.date, 'PPP')}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
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