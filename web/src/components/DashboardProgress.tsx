import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Loader2, X } from 'lucide-react';
import { ProgressGallery } from './ProgressGallery';
import { toast } from 'sonner';
import { storage } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface DashboardProgressProps {
  currentUserId: string | undefined;
}

/**
 * DashboardProgress component - Displays the progress tab content with photo upload functionality
 * 
 * This component has been extracted from the main Dashboard component
 * to improve performance by reducing re-renders.
 */
const DashboardProgress = React.memo(({ currentUserId }: DashboardProgressProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [galleryRefreshTrigger, setGalleryRefreshTrigger] = useState(0);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Monitor video element state changes
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlay = () => {
      console.log("Video started playing");
      setIsCameraReady(true);
    };

    const handleError = (error: Event) => {
      console.error("Video error:", error);
      toast.error("Error initializing camera preview");
      stopCamera();
    };

    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("error", handleError);

    return () => {
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("error", handleError);
    };
  }, [isCameraOpen]);

  const handleFileUpload = async (file: File) => {
    if (!currentUserId) return;

    try {
      setIsUploading(true);

      // Create a reference to the file in Firebase Storage
      const timestamp = new Date().getTime();
      const storageRef = ref(
        storage,
        `progress/${currentUserId}/${timestamp}_${file.name}`
      );

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL and trigger success
      await getDownloadURL(storageRef);

      toast.success("Photo uploaded successfully");
      
      // Trigger gallery refresh
      setGalleryRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload photo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await handleFileUpload(file);
  };

  const startCamera = async () => {
    try {
      setIsCameraReady(false);
      setIsCameraOpen(true);

      console.log("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      console.log("Camera access granted, setting up video stream...");
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;

        try {
          await videoRef.current.play();
          console.log("Video playback started");
        } catch (playError) {
          console.error("Error playing video:", playError);
          throw playError;
        }
      } else {
        console.error("Video element not found");
        throw new Error("Video element not found");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error(
        "Failed to access camera. Please make sure camera permissions are granted."
      );
      stopCamera();
    }
  };

  const stopCamera = () => {
    console.log("Stopping camera...");
    setIsCameraReady(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("Track stopped:", track.label);
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
      console.log("Camera not ready for capture");
      return;
    }

    try {
      console.log("Starting capture process...");
      // Create canvas and draw video frame
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      console.log("Canvas dimensions:", canvas.width, "x", canvas.height);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Could not get canvas context");

      // Flip horizontally if using front camera
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(videoRef.current, 0, 0);

      // Convert to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error("Failed to create blob"));
          },
          "image/jpeg",
          0.9
        );
      });

      console.log("Photo captured, preparing for upload...");
      // Create file from blob
      const file = new File([blob], `camera_${new Date().getTime()}.jpg`, {
        type: "image/jpeg",
      });

      // Stop camera
      stopCamera();

      // Upload file
      await handleFileUpload(file);
    } catch (error) {
      console.error("Error capturing photo:", error);
      toast.error("Failed to capture photo");
    }
  };

  return (
    <div className="space-y-4">
      {isCameraOpen ? (
        <div className="relative overflow-hidden rounded-xl bg-black aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-contain transform scale-x-[-1]"
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                <circle cx="12" cy="12" r="4"></circle>
              </svg>
            </Button>
          </div>
          {!isCameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-2" />
                <p className="text-white text-sm">
                  Initializing camera...
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-green-600/60 via-green-500/50 to-green-400/40 dark:from-green-500/20 dark:via-green-500/15 dark:to-background border border-green-500/40 dark:border-green-500/30">
          <div className="absolute inset-0 bg-grid-pattern opacity-15"></div>
          <div className="relative p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1 mb-2 sm:mb-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-500/30 text-green-900 dark:text-green-400 text-xs font-medium mb-1 shadow-md backdrop-blur-sm border border-green-500/40">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3"
                  >
                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                    <circle cx="12" cy="12" r="4"></circle>
                  </svg>
                  <span>Progress Photos</span>
                </div>
                <h2 className="text-xl font-bold tracking-tight text-green-950 dark:text-green-200">
                  Track Your Journey
                </h2>
                <p className="text-xs text-green-800 dark:text-muted-foreground max-w-xl backdrop-blur-sm bg-background/50 p-1.5 rounded-lg border border-green-500/30 shadow-sm hidden sm:block">
                  Document your skincare progress with photos. Compare and see your transformation over time.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={startCamera}
                  className="flex-1 sm:flex-none gap-2 bg-green-600 hover:bg-green-700 text-white"
                  size="default"
                  disabled={isUploading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                    <circle cx="12" cy="12" r="4"></circle>
                  </svg>
                  <span>Take Photo</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 sm:flex-none gap-2 border-green-300 text-green-900 bg-green-500/20 hover:bg-green-500/30 dark:text-green-400 dark:bg-transparent dark:hover:bg-green-900/20"
                  size="default"
                  disabled={isUploading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span>Upload Photo</span>
                </Button>
              </div>
            </div>
          </div>
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
        <div className="flex items-center justify-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-green-600 dark:text-green-400" />
          <span className="text-green-700 dark:text-green-400 text-sm">Uploading photo...</span>
        </div>
      )}

      <ProgressGallery refreshTrigger={galleryRefreshTrigger} />
    </div>
  );
});

DashboardProgress.displayName = 'DashboardProgress';

export default DashboardProgress; 