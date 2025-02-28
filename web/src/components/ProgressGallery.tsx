import { useState, useEffect } from 'react';
import { storage } from '../lib/firebase';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../lib/AuthContext';
import { Card } from './ui/card';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface ProgressPhoto {
  url: string;
  date: Date;
}

export function ProgressGallery() {
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const loadPhotos = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const storageRef = ref(storage, `progress/${currentUser.uid}`);
        const result = await listAll(storageRef);

        const photoPromises = result.items.map(async (item) => {
          const url = await getDownloadURL(item);
          // Extract timestamp from filename (timestamp_filename.jpg)
          const timestamp = parseInt(item.name.split('_')[0]);
          return {
            url,
            date: new Date(timestamp),
          };
        });

        const loadedPhotos = await Promise.all(photoPromises);
        // Sort by date, newest first
        loadedPhotos.sort((a, b) => b.date.getTime() - a.date.getTime());
        setPhotos(loadedPhotos);
      } catch (error) {
        console.error('Error loading photos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPhotos();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">No progress photos yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo, index) => (
        <Card key={index} className="overflow-hidden group relative">
          <img
            src={photo.url}
            alt={`Progress photo from ${format(photo.date, 'PPP')}`}
            className="w-full h-48 object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-xs">
            {format(photo.date, 'PPP')}
          </div>
        </Card>
      ))}
    </div>
  );
} 