/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { addProgressLog, type ProgressPhoto } from "@/lib/db";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import { Camera, Upload, X, Loader2, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "./ui/alert";

interface AddProgressLogDialogProps {
  children: React.ReactNode;
  onLogAdded: () => void;
  existingPhoto?: ProgressPhoto; // Optional existing photo
  defaultOpen?: boolean; // Whether the dialog should be open by default
  onOpenChange?: (open: boolean) => void; // Callback when dialog open state changes
}

interface ValidationErrors {
  title: string | null;
  photo: string | null;
  description: string | null;
  mood: string | null;
  concerns: string | null;
  improvements: string | null;
}

export function AddProgressLogDialog({
  children,
  onLogAdded,
  existingPhoto,
  defaultOpen = false,
  onOpenChange,
}: AddProgressLogDialogProps) {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(defaultOpen);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mood, setMood] = useState("");
  const [concerns, setConcerns] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [newConcern, setNewConcern] = useState("");
  const [newImprovement, setNewImprovement] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(existingPhoto?.url || null);
  const [photoStoragePath, setPhotoStoragePath] = useState<string | null>(existingPhoto?.storagePath || null);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<ValidationErrors>({
    title: null,
    photo: null,
    description: null,
    mood: null,
    concerns: null,
    improvements: null,
  });
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Update open state when defaultOpen changes
  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  // Set photo preview when existingPhoto changes
  useEffect(() => {
    if (existingPhoto) {
      setPhotoPreview(existingPhoto.url);
      setPhotoStoragePath(existingPhoto.storagePath);
      // Set a default title based on the photo name or date
      if (!title && (existingPhoto.name || existingPhoto.date)) {
        setTitle(existingPhoto.name || `Progress on ${existingPhoto.date.toLocaleDateString()}`);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingPhoto]);

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {
      title: !title.trim() ? "Title is required" : null,
      photo: !photoPreview && !selectedPhoto ? "Photo is required" : null,
      description: !description.trim() ? "Description is required" : null,
      mood: !mood ? "Mood selection is required" : null,
      concerns: concerns.length === 0 ? "At least one concern is required" : null,
      improvements: improvements.length === 0 ? "At least one improvement is required" : null,
    };
    
    setErrors(newErrors);
    // Mark all fields as touched when validating the whole form
    setTouched({
      title: true,
      photo: true,
      description: true,
      mood: true,
      concerns: true,
      improvements: true,
    });
    
    // If there are any errors, show the validation summary
    const hasErrors = Object.values(newErrors).some(error => error !== null);
    setShowValidationSummary(hasErrors);
    
    return !hasErrors;
  };

  // Validate individual field
  const validateField = (field: keyof ValidationErrors, value: any) => {
    let errorMessage: string | null = null;
    
    switch (field) {
      case 'title':
        errorMessage = !value.trim() ? "Title is required" : null;
        break;
      case 'photo':
        errorMessage = !photoPreview && !selectedPhoto ? "Photo is required" : null;
        break;
      case 'description':
        errorMessage = !value.trim() ? "Description is required" : null;
        break;
      case 'mood':
        errorMessage = !value ? "Mood selection is required" : null;
        break;
      case 'concerns':
        errorMessage = value.length === 0 ? "At least one concern is required" : null;
        break;
      case 'improvements':
        errorMessage = value.length === 0 ? "At least one improvement is required" : null;
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: errorMessage }));
    return errorMessage === null;
  };

  // Mark field as touched and validate
  const handleBlur = (field: keyof ValidationErrors, value: any) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  // Function to handle open state changes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    // Call the onOpenChange prop if provided
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
    if (!newOpen) {
      resetForm();
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setMood("");
    setConcerns([]);
    setImprovements([]);
    setNewConcern("");
    setNewImprovement("");
    
    // Only reset photo if there's no existing photo
    if (!existingPhoto) {
      setSelectedPhoto(null);
      setPhotoPreview(null);
      setPhotoStoragePath(null);
    } else {
      setPhotoPreview(existingPhoto.url);
      setPhotoStoragePath(existingPhoto.storagePath);
    }
    
    setIsCameraOpen(false);
    stopCamera();
    
    // Reset validation state
    setTouched({});
    setErrors({
      title: null,
      photo: null,
      description: null,
      mood: null,
      concerns: null,
      improvements: null,
    });
    setShowValidationSummary(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Validate all fields before submission
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
      
      let finalPhotoStoragePath = photoStoragePath || "";
      let finalPhotoUrl = photoPreview || "";
      
      // Upload photo if selected and no existing photo
      if (selectedPhoto && !existingPhoto) {
        setIsUploading(true);
        const timestamp = new Date().getTime();
        const storagePath = `progress/${currentUser.uid}/${timestamp}_${selectedPhoto.name || 'capture.jpg'}`;
        const storageRef = ref(storage, storagePath);
        
        await uploadBytes(storageRef, selectedPhoto);
        finalPhotoUrl = await getDownloadURL(storageRef);
        finalPhotoStoragePath = storagePath;
        setIsUploading(false);
      }
      
      // Add progress log to Firestore
      await addProgressLog({
        userId: currentUser.uid,
        date: existingPhoto?.date || new Date(),
        title,
        description,
        photoStoragePath: finalPhotoStoragePath,
        photoUrl: finalPhotoUrl,
        mood,
        concerns,
        improvements,
        relatedJournalEntryIds: [],
      });
      
      toast.success("Progress log added successfully");
      onLogAdded();
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error adding progress log:", error);
      toast.error("Failed to add progress log");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedPhoto(file);
    setPhotoStoragePath(null); // Clear existing photo path
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      setPhotoPreview(preview);
      // Validate photo field after setting preview
      validateField('photo', preview);
    };
    reader.readAsDataURL(file);
    
    // Mark as touched
    setTouched(prev => ({ ...prev, photo: true }));
  };

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      
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
        await videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Failed to access camera. Please make sure camera permissions are granted.');
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
          setSelectedPhoto(file);
          const preview = canvas.toDataURL('image/jpeg');
          setPhotoPreview(preview);
          setPhotoStoragePath(null); // Clear existing photo path
          
          // Validate photo field after capturing
          setTouched(prev => ({ ...prev, photo: true }));
          validateField('photo', preview);
          
          stopCamera();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const addConcern = () => {
    if (newConcern.trim() && !concerns.includes(newConcern.trim())) {
      const updatedConcerns = [...concerns, newConcern.trim()];
      setConcerns(updatedConcerns);
      setNewConcern("");
      
      // Validate concerns after adding
      setTouched(prev => ({ ...prev, concerns: true }));
      validateField('concerns', updatedConcerns);
    }
  };

  const addImprovement = () => {
    if (newImprovement.trim() && !improvements.includes(newImprovement.trim())) {
      const updatedImprovements = [...improvements, newImprovement.trim()];
      setImprovements(updatedImprovements);
      setNewImprovement("");
      
      // Validate improvements after adding
      setTouched(prev => ({ ...prev, improvements: true }));
      validateField('improvements', updatedImprovements);
    }
  };

  const removeConcern = (concern: string) => {
    const updatedConcerns = concerns.filter(c => c !== concern);
    setConcerns(updatedConcerns);
    
    // Validate concerns after removing
    validateField('concerns', updatedConcerns);
  };

  const removeImprovement = (improvement: string) => {
    const updatedImprovements = improvements.filter(i => i !== improvement);
    setImprovements(updatedImprovements);
    
    // Validate improvements after removing
    validateField('improvements', updatedImprovements);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Progress Log</DialogTitle>
        </DialogHeader>
        
        {showValidationSummary && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please fill in all required fields before submitting.
            </AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6 py-2">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (touched.title) {
                  validateField('title', e.target.value);
                }
              }}
              onBlur={() => handleBlur('title', title)}
              placeholder="e.g., Week 4 Progress"
              className={cn(
                touched.title && errors.title && "border-red-500 focus-visible:ring-red-500"
              )}
              required
            />
            {touched.title && errors.title && (
              <p className="text-sm text-red-500 mt-1">{errors.title}</p>
            )}
          </div>
          
          {/* Photo Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Photo <span className="text-red-500">*</span>
            </label>
            
            {photoPreview ? (
              <div className="relative rounded-md overflow-hidden h-60 bg-muted">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                {!existingPhoto && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={() => {
                      setSelectedPhoto(null);
                      setPhotoPreview(null);
                      setPhotoStoragePath(null);
                      // Validate photo field after clearing
                      setTouched(prev => ({ ...prev, photo: true }));
                      validateField('photo', null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : isCameraOpen ? (
              <div className="relative rounded-md overflow-hidden h-60 bg-black">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover"
                  autoPlay 
                  playsInline
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  <Button
                    type="button"
                    variant="default"
                    onClick={capturePhoto}
                    className="bg-white/80 text-black hover:bg-white"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Capture
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={stopCamera}
                    className="bg-white/30 hover:bg-white/50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "flex-1",
                      touched.photo && errors.photo && "border-red-500"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "flex-1",
                      touched.photo && errors.photo && "border-red-500"
                    )}
                    onClick={startCamera}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo
                  </Button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
                {touched.photo && errors.photo && (
                  <p className="text-sm text-red-500 mt-1">{errors.photo}</p>
                )}
              </div>
            )}
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (touched.description) {
                  validateField('description', e.target.value);
                }
              }}
              onBlur={() => handleBlur('description', description)}
              placeholder="Describe your progress, changes, or observations..."
              rows={4}
              className={cn(
                touched.description && errors.description && "border-red-500 focus-visible:ring-red-500"
              )}
              required
            />
            {touched.description && errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description}</p>
            )}
          </div>
          
          {/* Mood */}
          <div className="space-y-2">
            <label htmlFor="mood" className="text-sm font-medium">
              Mood <span className="text-red-500">*</span>
            </label>
            <Select 
              value={mood} 
              onValueChange={(value) => {
                setMood(value);
                setTouched(prev => ({ ...prev, mood: true }));
                validateField('mood', value);
              }}
            >
              <SelectTrigger className={cn(
                touched.mood && errors.mood && "border-red-500 focus:ring-red-500"
              )}>
                <SelectValue placeholder="How is your skin feeling?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="great">Great - Very Happy</SelectItem>
                <SelectItem value="good">Good - Satisfied</SelectItem>
                <SelectItem value="neutral">Neutral - No Change</SelectItem>
                <SelectItem value="concerned">Concerned - Some Issues</SelectItem>
                <SelectItem value="frustrated">Frustrated - Not Seeing Results</SelectItem>
              </SelectContent>
            </Select>
            {touched.mood && errors.mood && (
              <p className="text-sm text-red-500 mt-1">{errors.mood}</p>
            )}
          </div>
          
          {/* Concerns */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Concerns <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                value={newConcern}
                onChange={(e) => setNewConcern(e.target.value)}
                placeholder="e.g., Redness, Breakouts"
                className={cn(
                  touched.concerns && errors.concerns && "border-red-500 focus-visible:ring-red-500"
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addConcern();
                  }
                }}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={addConcern}
              >
                Add
              </Button>
            </div>
            {concerns.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {concerns.map((concern, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 gap-1"
                  >
                    {concern}
                    <button 
                      type="button" 
                      onClick={() => removeConcern(concern)}
                      className="ml-1 rounded-full hover:bg-red-200 dark:hover:bg-red-800 h-4 w-4 inline-flex items-center justify-center"
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : touched.concerns && errors.concerns && (
              <p className="text-sm text-red-500 mt-1">{errors.concerns}</p>
            )}
          </div>
          
          {/* Improvements */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Improvements <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                value={newImprovement}
                onChange={(e) => setNewImprovement(e.target.value)}
                placeholder="e.g., Less Dryness, Even Tone"
                className={cn(
                  touched.improvements && errors.improvements && "border-red-500 focus-visible:ring-red-500"
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImprovement();
                  }
                }}
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={addImprovement}
              >
                Add
              </Button>
            </div>
            {improvements.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {improvements.map((improvement, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 gap-1"
                  >
                    {improvement}
                    <button 
                      type="button" 
                      onClick={() => removeImprovement(improvement)}
                      className="ml-1 rounded-full hover:bg-green-200 dark:hover:bg-green-800 h-4 w-4 inline-flex items-center justify-center"
                    >
                      <X className="h-2 w-2" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : touched.improvements && errors.improvements && (
              <p className="text-sm text-red-500 mt-1">{errors.improvements}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                resetForm();
              }}
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className={cn(
                isUploading && "opacity-80"
              )}
            >
              {isSubmitting || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? "Uploading..." : "Saving..."}
                </>
              ) : (
                "Save Progress Log"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}