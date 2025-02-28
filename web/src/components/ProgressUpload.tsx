import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Camera, Upload, Loader2, X } from 'lucide-react';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'sonner';

interface ProgressUploadProps {
  onUploadComplete: (url: string) => void;
}

export function ProgressUpload({ onUploadComplete }: ProgressUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { currentUser } = useAuth();

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Monitor video element state changes
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlay = () => {
      console.log('Video started playing');
      setIsCameraReady(true);
    };

    const handleError = (error: Event) => {
      console.error('Video error:', error);
      toast.error('Error initializing camera preview');
      stopCamera();
    };

    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('error', handleError);

    return () => {
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('error', handleError);
    };
  }, [isCameraOpen]);

  const handleFileUpload = async (file: File) => {
    if (!currentUser) return;

    try {
      setIsUploading(true);
      
      // Create a reference to the file in Firebase Storage
      const timestamp = new Date().getTime();
      const storageRef = ref(storage, `progress/${currentUser.uid}/${timestamp}_${file.name}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      onUploadComplete(downloadURL);
      toast.success('Photo uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    await handleFileUpload(file);
  };

  const startCamera = async () => {
    try {
      setIsCameraReady(false);
      setIsCameraOpen(true); // Set this first so the video element is in the DOM

      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      console.log('Camera access granted, setting up video stream...');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        try {
          await videoRef.current.play();
          console.log('Video playback started');
        } catch (playError) {
          console.error('Error playing video:', playError);
          throw playError;
        }
      } else {
        console.error('Video element not found');
        throw new Error('Video element not found');
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please make sure camera permissions are granted.');
      stopCamera();
    }
  };

  const stopCamera = () => {
    console.log('Stopping camera...');
    setIsCameraReady(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('Track stopped:', track.label);
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const handleCameraCapture = async () => {
    if (!videoRef.current || !isCameraReady) {
      console.log('Camera not ready for capture');
      return;
    }

    try {
      console.log('Starting capture process...');
      // Create canvas and draw video frame
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not get canvas context');
      
      // Flip horizontally if using front camera
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(videoRef.current, 0, 0);
      
      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to create blob'));
        }, 'image/jpeg', 0.9);
      });
      
      console.log('Photo captured, preparing for upload...');
      // Create file from blob
      const file = new File([blob], `camera_${new Date().getTime()}.jpg`, { type: 'image/jpeg' });
      
      // Stop camera
      stopCamera();
      
      // Upload file
      await handleFileUpload(file);
    } catch (error) {
      console.error('Error capturing photo:', error);
      toast.error('Failed to capture photo');
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {isCameraOpen ? (
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '60vh', maxHeight: '80vh' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-contain transform scale-x-[-1]"
              style={{ backgroundColor: 'black' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-4">
              <Button
                variant="secondary"
                size="lg"
                className="rounded-full h-14 w-14 shadow-lg"
                onClick={stopCamera}
              >
                <X className="h-6 w-6" />
              </Button>
              <Button
                variant="default"
                size="lg"
                className="rounded-full h-14 w-14 bg-white text-black hover:bg-white/90 shadow-lg"
                onClick={handleCameraCapture}
                disabled={!isCameraReady}
              >
                <Camera className="h-6 w-6" />
              </Button>
            </div>
            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-2" />
                  <p className="text-white text-sm">Initializing camera...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-20 sm:h-24 flex flex-col items-center justify-center gap-2 relative overflow-hidden group"
              onClick={startCamera}
              disabled={isUploading}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Camera className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="text-sm">Take Photo</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-20 sm:h-24 flex flex-col items-center justify-center gap-2 relative overflow-hidden group"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Upload className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="text-sm">Upload Photo</span>
            </Button>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {isUploading && (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Uploading...</span>
          </div>
        )}
      </div>
    </Card>
  );
} 