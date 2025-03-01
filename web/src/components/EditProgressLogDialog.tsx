import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { updateProgressLog, deleteProgressLog, type ProgressLog } from "@/lib/db";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { toast } from "sonner";
import { Camera, Upload, X, Loader2, Trash2, AlertTriangle, Pencil } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EditProgressLogDialogProps {
  log: ProgressLog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogUpdated: () => void;
  onLogDeleted: () => void;
}

export function EditProgressLogDialog({
  log,
  open,
  onOpenChange,
  onLogUpdated,
  onLogDeleted,
}: EditProgressLogDialogProps) {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState(log.title);
  const [description, setDescription] = useState(log.description);
  const [mood, setMood] = useState(log.mood || "");
  const [concerns, setConcerns] = useState<string[]>(log.concerns || []);
  const [improvements, setImprovements] = useState<string[]>(log.improvements || []);
  const [newConcern, setNewConcern] = useState("");
  const [newImprovement, setNewImprovement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(log.photoUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Update state when log changes
  useEffect(() => {
    setTitle(log.title);
    setDescription(log.description);
    setMood(log.mood || "");
    setConcerns(log.concerns || []);
    setImprovements(log.improvements || []);
    setPhotoPreview(log.photoUrl || null);
    setIsEditing(false);
  }, [log]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    try {
      setIsSubmitting(true);
      
      let photoStoragePath = log.photoStoragePath;
      let photoUrl = log.photoUrl;
      
      // Upload new photo if selected
      if (selectedPhoto) {
        setIsUploading(true);
        
        // Delete old photo if exists
        if (log.photoStoragePath) {
          try {
            const oldPhotoRef = ref(storage, log.photoStoragePath);
            await deleteObject(oldPhotoRef);
          } catch (error) {
            console.error("Error deleting old photo:", error);
          }
        }
        
        // Upload new photo
        const timestamp = new Date().getTime();
        const storagePath = `progress/${currentUser.uid}/${timestamp}_${selectedPhoto.name || 'capture.jpg'}`;
        const storageRef = ref(storage, storagePath);
        
        await uploadBytes(storageRef, selectedPhoto);
        photoUrl = await getDownloadURL(storageRef);
        photoStoragePath = storagePath;
        setIsUploading(false);
      }
      
      // Update progress log in Firestore
      await updateProgressLog(log.id, {
        title,
        description,
        photoStoragePath,
        photoUrl,
        mood: mood || undefined,
        concerns: concerns.length > 0 ? concerns : [],
        improvements: improvements.length > 0 ? improvements : [],
        updatedAt: new Date(),
      });
      
      toast.success("Progress log updated successfully");
      onLogUpdated();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating progress log:", error);
      toast.error("Failed to update progress log");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUser) return;

    try {
      setIsDeleting(true);
      
      // Delete photo if exists
      if (log.photoStoragePath) {
        try {
          const photoRef = ref(storage, log.photoStoragePath);
          await deleteObject(photoRef);
        } catch (error) {
          console.error("Error deleting photo:", error);
        }
      }
      
      // Delete progress log from Firestore
      await deleteProgressLog(log.id);
      
      toast.success("Progress log deleted successfully");
      onLogDeleted();
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting progress log:", error);
      toast.error("Failed to delete progress log");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedPhoto(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
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
          setPhotoPreview(canvas.toDataURL('image/jpeg'));
          stopCamera();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const addConcern = () => {
    if (newConcern.trim() && !concerns.includes(newConcern.trim())) {
      setConcerns([...concerns, newConcern.trim()]);
      setNewConcern("");
    }
  };

  const addImprovement = () => {
    if (newImprovement.trim() && !improvements.includes(newImprovement.trim())) {
      setImprovements([...improvements, newImprovement.trim()]);
      setNewImprovement("");
    }
  };

  const removeConcern = (concern: string) => {
    setConcerns(concerns.filter(c => c !== concern));
  };

  const removeImprovement = (improvement: string) => {
    setImprovements(improvements.filter(i => i !== improvement));
  };

  // Delete confirmation dialog
  if (showDeleteConfirm) {
    return (
      <Dialog open={true} onOpenChange={() => setShowDeleteConfirm(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this progress log? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Log'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto"
      closeButton={false}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{isEditing ? "Edit Progress Log" : "Progress Log"}</span>
            {!isEditing && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
            )}
            {isEditing && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            )}
          </DialogTitle>
          {!isEditing && (
            <DialogDescription>
              {format(log.date, "MMMM d, yyyy")}
            </DialogDescription>
          )}
        </DialogHeader>
        
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6 py-2">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Week 4 Progress"
                required
              />
            </div>
            
            {/* Photo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Photo (Optional)</label>
              
              {photoPreview ? (
                <div className="relative rounded-md overflow-hidden h-60 bg-muted">
                  <img 
                    src={photoPreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={() => {
                      setSelectedPhoto(null);
                      setPhotoPreview(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
                      className="flex-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Photo
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
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
                </div>
              )}
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your progress, changes, or observations..."
                rows={4}
              />
            </div>
            
            {/* Mood */}
            <div className="space-y-2">
              <label htmlFor="mood" className="text-sm font-medium">
                Mood
              </label>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
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
            </div>
            
            {/* Concerns */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Concerns
              </label>
              <div className="flex gap-2">
                <Input
                  value={newConcern}
                  onChange={(e) => setNewConcern(e.target.value)}
                  placeholder="e.g., Redness, Breakouts"
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
              {concerns.length > 0 && (
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
              )}
            </div>
            
            {/* Improvements */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Improvements
              </label>
              <div className="flex gap-2">
                <Input
                  value={newImprovement}
                  onChange={(e) => setNewImprovement(e.target.value)}
                  placeholder="e.g., Less Dryness, Even Tone"
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
              {improvements.length > 0 && (
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
              )}
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting || isUploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isUploading || !title.trim()}
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
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-6 py-2">
            {/* Photo */}
            {photoPreview && (
              <div className="rounded-md overflow-hidden h-60 bg-muted">
                <img 
                  src={photoPreview} 
                  alt={title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Title */}
            <h3 className="text-xl font-semibold">{title}</h3>
            
            {/* Description */}
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-line">{description}</p>
            </div>
            
            {/* Mood */}
            {mood && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Mood</h4>
                <Badge 
                  variant="secondary"
                  className={cn(
                    "capitalize",
                    mood === "great" && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
                    mood === "good" && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
                    mood === "neutral" && "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200",
                    mood === "concerned" && "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
                    mood === "frustrated" && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                  )}
                >
                  {mood}
                </Badge>
              </div>
            )}
            
            {/* Concerns */}
            {concerns.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Concerns</h4>
                <div className="flex flex-wrap gap-2">
                  {concerns.map((concern, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                    >
                      {concern}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Improvements */}
            {improvements.length > 0 && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Improvements</h4>
                <div className="flex flex-wrap gap-2">
                  {improvements.map((improvement, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                    >
                      {improvement}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 