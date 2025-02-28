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
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
              resolve(null);
            };
          }
        });
        
        setIsCameraReady(true);
      }
      
      setIsCameraOpen(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please make sure camera permissions are granted.');
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    setIsCameraReady(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  const handleCameraCapture = async () => {
    if (!videoRef.current || !isCameraReady) return;

    try {
      // Create canvas and draw video frame
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Could not get canvas context');
      
      // Flip horizontally if using front camera
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(videoRef.current, 0, 0);
      
      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
        }, 'image/jpeg', 0.9);
      });
      
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
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '60vh' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]"
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
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-32 flex flex-col items-center justify-center gap-2"
              onClick={startCamera}
              disabled={isUploading}
            >
              <Camera className="h-8 w-8" />
              <span>Take Photo</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-32 flex flex-col items-center justify-center gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-8 w-8" />
              <span>Upload Photo</span>
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