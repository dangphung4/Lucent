/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  Loader2,
  Calendar as CalendarIcon,
  Clock,
  Star,
  FileText,
  Search,
  BookOpen,
  Pencil,
  Droplets,
  Beaker,
  Pipette,
  CircleDot,
  Sun,
  Layers,
  Eye,
  Zap,
  Package,
  Camera,
  Upload,
  ArrowUpDown,
  Plus,
  X
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import {
  getUserProducts,
  getUserJournalEntries,
  getUserProgressLogs,
  getUserProgressPhotos,
  type Product,
  type JournalEntry,
  type ProgressLog,
  type ProgressPhoto,
} from "@/lib/db";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, updateMetadata } from "firebase/storage";
import { Input } from "./ui/input";
import { AddJournalEntryDialog } from "./AddJournalEntryDialog";
import { UpdateUsageDialog } from "./UpdateUsageDialog";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { DiaryEntryDialog } from "./DiaryEntryDialog";
import { EditDiaryEntryDialog } from "./EditDiaryEntryDialog";
import { AddProgressLogDialog } from "./AddProgressLogDialog";
import { EditProgressLogDialog } from "./EditProgressLogDialog";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Card } from "./ui/card";

// Check if an entry is a diary entry (without specific product details)
const isDiaryEntry = (entry: JournalEntry) => {
  return entry.type === "diary" || entry.productId === "diary-entry";
};

// Filter journal entries
const filterJournalEntries = (
  entries: JournalEntry[],
  activeTab: string,
  selectedProductId: string | null
) => {
  return entries
    .filter((entry) => {
      // For the Journal Notes tab, only show diary entries
      if (activeTab === "notes") {
        return isDiaryEntry(entry);
      }
      // For other tabs, show all entries that match the selected product
      return !selectedProductId || entry.productId === selectedProductId;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
};

// Replace the categoryIcons mapping with Lucide icons
const categoryIcons: Record<string, React.ReactNode> = {
  Cleanser: <div className="bg-green-500/10 text-green-500"><Droplets className="h-4 w-4" /></div>,
  Toner: <div className="bg-pink-500/10 text-pink-500"><Beaker className="h-4 w-4" /></div>,
  Serum: <div className="bg-purple-500/10 text-purple-500"><Pipette className="h-4 w-4" /></div>,
  Moisturizer: <div className="bg-blue-500/10 text-blue-500"><CircleDot className="h-4 w-4" /></div>,
  Sunscreen: <div className="bg-amber-500/10 text-amber-500"><Sun className="h-4 w-4" /></div>,
  Mask: <div className="bg-indigo-500/10 text-indigo-500"><Layers className="h-4 w-4" /></div>,
  "Eye Cream": <div className="bg-cyan-500/10 text-cyan-500"><Eye className="h-4 w-4" /></div>,
  Treatment: <div className="bg-red-500/10 text-red-500"><Zap className="h-4 w-4" /></div>,
  Other: <div className="bg-gray-500/10 text-gray-500"><Package className="h-4 w-4" /></div>,
};

// Format duration helper
const formatDuration = (days: number) => {
  if (days < 1) return "Less than a day";
  if (days === 1) return "1 day";
  if (days < 30) return `${days} days`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 month" : `${months} months`;
};

/**
 * The Journal component serves as the main interface for users to track their skincare products,
 * document their skincare journey, and view their journal entries.
 *
 * It manages the state of various UI elements, including the active tab, loading status,
 * search query, selected product and journal entry, and expanded entries.
 *
 * The component fetches user-specific data such as products and journal entries upon mounting,
 * and provides filtering capabilities for both products and journal entries based on user input.
 *
 * @returns {JSX.Element} The rendered Journal component.
 *
 * @throws {Error} Throws an error if data loading fails.
 *
 * @example
 * // Usage of the Journal component
 * <Journal />
 */
export function Journal() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("tracking");
  const [products, setProducts] = useState<Product[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [selectedLog, setSelectedLog] = useState<ProgressLog | null>(null);
  const [, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [, setAddLogDialogOpen] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [photosByMonth, setPhotosByMonth] = useState<Record<string, ProgressPhoto[]>>({});
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load products and journal entries
  const loadData = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const [fetchedProducts, fetchedEntries, fetchedLogs, fetchedPhotos] = await Promise.all([
        getUserProducts(currentUser.uid),
        getUserJournalEntries(currentUser.uid),
        getUserProgressLogs(currentUser.uid),
        getUserProgressPhotos(currentUser.uid),
      ]);
      setProducts(fetchedProducts);
      setJournalEntries(fetchedEntries);
      setProgressLogs(fetchedLogs);
      
      // Sort photos and group by month
      const sortedPhotos = sortProgressPhotos(fetchedPhotos, sortOrder);
      setProgressPhotos(sortedPhotos);
      groupPhotosByMonth(sortedPhotos);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Group photos by month
  const groupPhotosByMonth = (photos: ProgressPhoto[]) => {
    const grouped = photos.reduce((acc, photo) => {
      const monthKey = format(photo.date, 'MMMM yyyy');
      if (!acc[monthKey]) {
        acc[monthKey] = [];
      }
      acc[monthKey].push(photo);
      return acc;
    }, {} as Record<string, ProgressPhoto[]>);
    
    setPhotosByMonth(grouped);
  };

  // Sort progress photos
  const sortProgressPhotos = (photos: ProgressPhoto[], order: 'newest' | 'oldest') => {
    return [...photos].sort((a, b) => {
      const comparison = b.date.getTime() - a.date.getTime();
      return order === 'newest' ? comparison : -comparison;
    });
  };

  // Handle sort change
  const handleSortChange = (newOrder: 'newest' | 'oldest') => {
    setSortOrder(newOrder);
    const sortedPhotos = sortProgressPhotos(progressPhotos, newOrder);
    setProgressPhotos(sortedPhotos);
    groupPhotosByMonth(sortedPhotos);
  };

  // Handle file upload for progress photos
  const handleFileUpload = async (file: File) => {
    if (!currentUser) return;

    try {
      setIsUploading(true);
      
      // Create a reference to the file in Firebase Storage
      const timestamp = new Date().getTime();
      const storageRef = ref(storage, `progress/${currentUser.uid}/${timestamp}_${file.name}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Add metadata
      await updateMetadata(storageRef, {
        customMetadata: {
          name: `Photo from ${format(new Date(), 'MMMM d, yyyy')}`
        }
      });
      
      // Get the download URL
      const photoUrl = await getDownloadURL(storageRef);
      
      toast.success('Photo uploaded successfully');
      setActiveTab('progress');
      
      // Reload photos
      await loadData();
      
      return {
        photoUrl,
        photoStoragePath: storageRef.fullPath
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload photo');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    await handleFileUpload(file);
  }; 
  
  // Filter products based on search
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get filtered journal entries
  const filteredJournalEntries = filterJournalEntries(
    journalEntries,
    activeTab,
    selectedProductId
  );

  // Product Card component to reuse across tabs
  const ProductCard = ({
    product,
    onUpdate,
  }: {
    product: Product;
    onUpdate: () => void;
  }) => {
    const latestEntry = journalEntries
      .filter((entry) => entry.productId === product.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

    // Enhanced category color system with gradients matching ProductList.tsx
    const getCategoryStyle = () => {
      if (!product.category) return {
        card: [
          "bg-gradient-to-br from-blue-50 via-blue-50/50 to-transparent",
          "dark:from-blue-950/20 dark:via-transparent dark:to-transparent",
          "hover:from-blue-100/80 hover:via-blue-50/40 hover:to-transparent",
          "dark:hover:from-blue-950/30 dark:hover:via-transparent dark:hover:to-transparent",
          "border-blue-200/50 dark:border-blue-800/30"
        ].join(" "),
        icon: "text-blue-600 dark:text-blue-400"
      };

      switch (product.category.toLowerCase()) {
        case "moisturizer":
          return {
            card: [
              "bg-gradient-to-br from-blue-50 via-blue-50/50 to-transparent",
              "dark:from-blue-950/20 dark:via-transparent dark:to-transparent",
              "hover:from-blue-100/80 hover:via-blue-50/40 hover:to-transparent",
              "dark:hover:from-blue-950/30 dark:hover:via-transparent dark:hover:to-transparent",
              "border-blue-200/50 dark:border-blue-800/30"
            ].join(" "),
            icon: "text-blue-600 dark:text-blue-400"
          };
        case "cleanser":
          return {
            card: [
              "bg-gradient-to-br from-green-50 via-green-50/50 to-transparent",
              "dark:from-green-950/20 dark:via-transparent dark:to-transparent",
              "hover:from-green-100/80 hover:via-green-50/40 hover:to-transparent",
              "dark:hover:from-green-950/30 dark:hover:via-transparent dark:hover:to-transparent",
              "border-green-200/50 dark:border-green-800/30"
            ].join(" "),
            icon: "text-green-600 dark:text-green-400"
          };
        case "serum":
          return {
            card: [
              "bg-gradient-to-br from-purple-50 via-purple-50/50 to-transparent",
              "dark:from-purple-950/20 dark:via-transparent dark:to-transparent",
              "hover:from-purple-100/80 hover:via-purple-50/40 hover:to-transparent",
              "dark:hover:from-purple-950/30 dark:hover:via-transparent dark:hover:to-transparent",
              "border-purple-200/50 dark:border-purple-800/30"
            ].join(" "),
            icon: "text-purple-600 dark:text-purple-400"
          };
        case "sunscreen":
          return {
            card: [
              "bg-gradient-to-br from-amber-50 via-amber-50/50 to-transparent",
              "dark:from-amber-950/20 dark:via-transparent dark:to-transparent",
              "hover:from-amber-100/80 hover:via-amber-50/40 hover:to-transparent",
              "dark:hover:from-amber-950/30 dark:hover:via-transparent dark:hover:to-transparent",
              "border-amber-200/50 dark:border-amber-800/30"
            ].join(" "),
            icon: "text-amber-600 dark:text-amber-400"
          };
        case "toner":
          return {
            card: [
              "bg-gradient-to-br from-pink-50 via-pink-50/50 to-transparent",
              "dark:from-pink-950/20 dark:via-transparent dark:to-transparent",
              "hover:from-pink-100/80 hover:via-pink-50/40 hover:to-transparent",
              "dark:hover:from-pink-950/30 dark:hover:via-transparent dark:hover:to-transparent",
              "border-pink-200/50 dark:border-pink-800/30"
            ].join(" "),
            icon: "text-pink-600 dark:text-pink-400"
          };
        case "treatment":
          return {
            card: [
              "bg-gradient-to-br from-red-50 via-red-50/50 to-transparent",
              "dark:from-red-950/20 dark:via-transparent dark:to-transparent",
              "hover:from-red-100/80 hover:via-red-50/40 hover:to-transparent",
              "dark:hover:from-red-950/30 dark:hover:via-transparent dark:hover:to-transparent",
              "border-red-200/50 dark:border-red-800/30"
            ].join(" "),
            icon: "text-red-600 dark:text-red-400"
          };
        case "mask":
          return {
            card: [
              "bg-gradient-to-br from-indigo-50 via-indigo-50/50 to-transparent",
              "dark:from-indigo-950/20 dark:via-transparent dark:to-transparent",
              "hover:from-indigo-100/80 hover:via-indigo-50/40 hover:to-transparent",
              "dark:hover:from-indigo-950/30 dark:hover:via-transparent dark:hover:to-transparent",
              "border-indigo-200/50 dark:border-indigo-800/30"
            ].join(" "),
            icon: "text-indigo-600 dark:text-indigo-400"
          };
        case "eye cream":
          return {
            card: [
              "bg-gradient-to-br from-cyan-50 via-cyan-50/50 to-transparent",
              "dark:from-cyan-950/20 dark:via-transparent dark:to-transparent",
              "hover:from-cyan-100/80 hover:via-cyan-50/40 hover:to-transparent",
              "dark:hover:from-cyan-950/30 dark:hover:via-transparent dark:hover:to-transparent",
              "border-cyan-200/50 dark:border-cyan-800/30"
            ].join(" "),
            icon: "text-cyan-600 dark:text-cyan-400"
          };
        default:
          return {
            card: [
              "bg-gradient-to-br from-blue-50 via-blue-50/50 to-transparent",
              "dark:from-blue-950/20 dark:via-transparent dark:to-transparent",
              "hover:from-blue-100/80 hover:via-blue-50/40 hover:to-transparent",
              "dark:hover:from-blue-950/30 dark:hover:via-transparent dark:hover:to-transparent",
              "border-blue-200/50 dark:border-blue-800/30"
            ].join(" "),
            icon: "text-blue-600 dark:text-blue-400"
          };
      }
    };

    const categoryStyle = getCategoryStyle();

    return (
      <div
        className={cn(
          "relative rounded-xl border",
          "transition-all duration-300",
          "hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0",
          "shadow-lg hover:shadow-xl",
          categoryStyle.card
        )}
      >
        {/* Header section */}
        <div className="flex items-start gap-3 p-4">
          <Avatar className={cn(
            "h-12 w-12 rounded-xl shadow-md transition-transform group-hover:scale-105",
            "bg-white dark:bg-gray-800"
          )}>
            {(() => {
              const category = product.category || 'Other';
              const IconComponent = {
                cleanser: Droplets,
                toner: Beaker,
                serum: Pipette,
                moisturizer: CircleDot,
                sunscreen: Sun,
                mask: Layers,
                'eye cream': Eye,
                treatment: Zap,
                other: Package
              }[category.toLowerCase()] || Package;

              return (
                <div className={cn(
                  "flex h-full w-full items-center justify-center",
                  categoryStyle.icon
                )}>
                  <IconComponent className="h-6 w-6 transition-transform group-hover:scale-110" />
                </div>
              );
            })()}
          </Avatar>

          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-semibold text-base sm:text-lg tracking-tight truncate">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {product.brand}
            </p>
          </div>
        </div>

        {/* Stats section with distinct badge styles */}
        <div className="px-4 py-3 flex flex-wrap gap-2">
          {product.usageDuration > 0 && (
            <Badge variant="secondary" className={cn(
              "bg-violet-100 dark:bg-violet-900",
              "text-violet-700 dark:text-violet-200",
              "border-violet-200 dark:border-violet-800"
            )}>
              <Clock className="h-3.5 w-3.5 mr-1" />
              {formatDuration(product.usageDuration)}
            </Badge>
          )}
          {latestEntry && (
            <>
              <Badge variant="secondary" className={cn(
                "bg-amber-100 dark:bg-amber-900",
                "text-amber-700 dark:text-amber-200",
                "border-amber-200 dark:border-amber-800"
              )}>
                <Star className="h-3.5 w-3.5 mr-1 fill-current" />
                {latestEntry.rating}/5
              </Badge>
              <Badge variant="secondary" className={cn(
                "bg-blue-100 dark:bg-blue-900",
                "text-blue-700 dark:text-blue-200",
                "border-blue-200 dark:border-blue-800"
              )}>
                <CalendarIcon className="h-3.5 w-3.5 mr-1" />
                Last reviewed {formatDuration(
                  Math.floor(
                    (new Date().getTime() - latestEntry.date.getTime()) /
                    (1000 * 60 * 60 * 24)
                  )
                )} ago
              </Badge>
            </>
          )}
        </div>

        {/* Review preview with solid background */}
        {latestEntry && (
          <div 
            className={cn(
              "mx-4 mb-3 cursor-pointer rounded-lg",
              "bg-white dark:bg-gray-800",
              "p-3 transition-colors",
              "hover:bg-gray-50 dark:hover:bg-gray-700",
              "group"
            )}
            onClick={() => {
              setSelectedEntry(latestEntry);
              setEditDialogOpen(true);
            }}
          >
            <p className="text-sm line-clamp-2 text-foreground">
              {latestEntry.review}
            </p>
            {latestEntry.effects && latestEntry.effects.length > 0 && (
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {latestEntry.effects.map((effect, index) => {
                  const getEffectStyle = () => {
                    if (effect.toLowerCase().includes('irritation') || effect.toLowerCase().includes('breakout')) {
                      return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 border-red-200 dark:border-red-800";
                    }
                    if (effect.toLowerCase().includes('hydrating') || effect.toLowerCase().includes('moisturizing')) {
                      return "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-800";
                    }
                    if (effect.toLowerCase().includes('brightening') || effect.toLowerCase().includes('glowing')) {
                      return "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200 border-amber-200 dark:border-amber-800";
                    }
                    if (effect.toLowerCase().includes('calming') || effect.toLowerCase().includes('soothing')) {
                      return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 border-green-200 dark:border-green-800";
                    }
                    return "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-800";
                  };

                  return (
                    <Badge
                      key={index}
                      variant="outline"
                      className={cn(
                        "text-xs",
                        getEffectStyle()
                      )}
                    >
                      {effect}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Actions with distinct button styles */}
        <div className="px-4 pb-4 flex flex-wrap items-center gap-2">
          <UpdateUsageDialog
            productId={product.id}
            productName={product.name}
            onUsageUpdated={onUpdate}
          >
            <Button 
              variant="secondary" 
              size="sm" 
              className={cn(
                "h-8",
                "bg-violet-100 dark:bg-violet-900/90",
                "hover:bg-violet-200 dark:hover:bg-violet-800",
                "text-violet-700 dark:text-violet-200"
              )}
            >
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              Update Usage
            </Button>
          </UpdateUsageDialog>
          {!latestEntry && (
            <AddJournalEntryDialog
              productId={product.id}
              productName={product.name}
              onEntryAdded={onUpdate}
            >
              <Button 
                variant="secondary" 
                size="sm" 
                className={cn(
                  "h-8",
                  "bg-emerald-100 dark:bg-emerald-900/90",
                  "hover:bg-emerald-200 dark:hover:bg-emerald-800",
                  "text-emerald-700 dark:text-emerald-200"
                )}
              >
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                Add Review
              </Button>
            </AddJournalEntryDialog>
          )}
        </div>
      </div>
    );
  };

  // Handle clicking on a journal entry
  const handleEntryClick = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setEditDialogOpen(true);
  };

  // Toggle entry expansion
  /**
   * Toggles the expansion state of a specific entry identified by its ID.
   * This function updates the state of expanded entries by inverting the
   * current expansion state for the given entry ID.
   *
   * @param {string} entryId - The unique identifier of the entry whose
   * expansion state is to be toggled.
   *
   * @returns {void} This function does not return a value.
   *
   * @example
   * // Assuming 'entry1' is an ID of an entry
   * toggleEntryExpansion('entry1');
   *
   * @throws {Error} Throws an error if the entryId is not a valid string.
   */
  const toggleEntryExpansion = (entryId: string) => {
    setExpandedEntries(prev => ({
      ...prev,
      [entryId]: !prev[entryId]
    }));
  };

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
    if (!videoElement || !isCameraOpen) return;

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

  const startCamera = async () => {
    try {
      setIsCameraReady(false);
      setIsCameraOpen(true);

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
    if (!videoRef.current || !isCameraReady || !currentUser) {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 pb-20 md:pb-6">
      <div className="space-y-8">
        {/* Main Content */}
        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="border-b overflow-x-auto">
            <TabsList className="w-full h-auto p-0 bg-transparent gap-4 sm:gap-6">
              <TabsTrigger
                value="tracking"
                className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary font-medium border-b-2 border-transparent rounded-none px-2 py-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                Product Tracking
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary font-medium border-b-2 border-transparent rounded-none px-2 py-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                Journal Notes
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="data-[state=active]:bg-transparent data-[state=active]:border-primary data-[state=active]:text-primary font-medium border-b-2 border-transparent rounded-none px-2 py-3 text-muted-foreground hover:text-foreground transition-colors"
              >
                Progress Photos
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Product Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-[2rem] bg-gradient-to-br from-teal-500 to-emerald-600 dark:from-teal-600 dark:to-emerald-700">
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.2)_0%,transparent_70%)]"></div>
              <div className="relative p-6 sm:p-10 md:p-12 text-white">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4">Your Skincare Collection</h2>
                <p className="text-white/80 text-base sm:text-lg max-w-xl mb-6 sm:mb-8">Track your products, monitor usage, and record your experiences with each item in your routine.</p>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    size="lg" 
                    className="bg-white text-teal-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={() => window.location.href = '/products/add'}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Product
                  </Button>
                </div>
              </div>
              <div className="absolute -bottom-6 right-10 opacity-10">
                <Beaker className="h-48 w-48 rotate-12" />
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-0 
                          shadow-lg focus-visible:ring-primary/30"
              />
            </div>

            {/* Products Grid */}
            <div className="grid gap-6">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border bg-white/50 dark:bg-black/20 
                              backdrop-blur-sm shadow-lg">
                  <Beaker className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="font-medium text-foreground">No products found</p>
                  <p className="text-sm text-muted-foreground/80 mt-1">
                    Try adjusting your search or add some products
                  </p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onUpdate={loadData} />
                ))
              )}
            </div>
          </TabsContent>

          {/* Journal Notes Tab */}
          <TabsContent value="notes" className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-[2rem] bg-gradient-to-br from-indigo-500 to-violet-600 dark:from-indigo-600 dark:to-violet-700">
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.2)_0%,transparent_70%)]"></div>
              <div className="relative p-6 sm:p-10 md:p-12 text-white">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4">Your Skincare Story</h2>
                <p className="text-white/80 text-base sm:text-lg max-w-xl mb-6 sm:mb-8">Document your journey, track your progress, and discover what works best for your skin.</p>
                <DiaryEntryDialog onEntryAdded={loadData}>
                  <Button size="lg" className="bg-white text-indigo-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Write New Entry
                  </Button>
                </DiaryEntryDialog>
              </div>
              <div className="absolute -bottom-6 right-10 opacity-10">
                <BookOpen className="h-48 w-48 rotate-12" />
              </div>
            </div>

            {/* Entries Section */}
            <div className="space-y-12">
              {filteredJournalEntries.length === 0 ? (
                <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-b from-muted/50 to-muted p-12">
                  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-black/10" />
                  <div className="relative text-center space-y-4">
                    <BookOpen className="h-16 w-16 mx-auto text-muted-foreground/50" />
                    <h3 className="font-semibold text-xl">Begin Your Skincare Journey</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      Start documenting your skincare experiences and track your progress over time
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8">
                  {filteredJournalEntries.map((entry) => {
                    const product = products.find((p) => p.id === entry.productId);
                    const isSimpleDiaryEntry = isDiaryEntry(entry);

                    return (
                      <div
                        key={entry.id}
                        className={cn(
                          "group relative rounded-2xl border transition-all duration-300",
                          "hover:shadow-xl hover:-translate-y-0.5",
                          "active:translate-y-0 overflow-hidden cursor-pointer",
                          isSimpleDiaryEntry
                            ? "bg-gradient-to-br from-blue-50/90 to-transparent dark:from-blue-950/30 dark:to-transparent"
                            : "bg-gradient-to-br from-violet-50/90 to-transparent dark:from-violet-950/30 dark:to-transparent"
                        )}
                        onClick={() => handleEntryClick(entry)}
                      >
                        <div className="p-6 sm:p-8 space-y-6">
                          {/* Header */}
                          <div className="flex items-start gap-4">
                            <Avatar className={cn(
                              "h-14 w-14 rounded-2xl shadow-lg",
                              isSimpleDiaryEntry
                                ? "bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800"
                                : "bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900 dark:to-violet-800"
                            )}>
                              <div className="flex h-full w-full items-center justify-center">
                                {isSimpleDiaryEntry ? (
                                  <BookOpen className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                                ) : product?.category && categoryIcons[product.category] ? (
                                  categoryIcons[product.category]
                                ) : (
                                  <Beaker className="h-7 w-7 text-primary/70" />
                                )}
                              </div>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-4">
                                <h3 className="text-xl font-semibold tracking-tight">
                                  {isSimpleDiaryEntry ? (entry.title || "Journal Entry") : product?.name}
                                </h3>
                                <time className="text-sm text-muted-foreground whitespace-nowrap">
                                  {format(entry.date, "MMMM d, yyyy")}
                                </time>
                              </div>
                              {!isSimpleDiaryEntry && product?.brand && (
                                <p className="text-sm text-muted-foreground mt-1">{product.brand}</p>
                              )}
                            </div>
                          </div>

                          {/* Rating Stars */}
                          {!isSimpleDiaryEntry && entry.rating > 0 && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "h-5 w-5",
                                    i < entry.rating
                                      ? "text-amber-500 dark:text-amber-400 fill-current"
                                      : "text-muted stroke-[1.5]"
                                  )}
                                />
                              ))}
                            </div>
                          )}

                          {/* Review Text */}
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <p className={cn(
                              "text-base leading-relaxed",
                              !expandedEntries[entry.id] && "line-clamp-3"
                            )}>
                              {entry.review}
                            </p>
                            {entry.review.split('\n').length > 3 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 h-auto p-0 text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  toggleEntryExpansion(entry.id);
                                }}
                              >
                                {expandedEntries[entry.id] ? "Show less" : "Read more"}
                              </Button>
                            )}
                          </div>

                          {/* Effects Tags */}
                          {entry.effects && entry.effects.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {entry.effects.map((effect, index) => {
                                /**
                                 * Determines the appropriate style class based on the specified effect.
                                 *
                                 * This function evaluates the provided effect string and returns a corresponding
                                 * style class that can be used for UI elements. The styles are categorized based
                                 * on common skincare effects such as irritation, hydration, brightening, and calming.
                                 *
                                 * @returns {string} A string representing the style class for the given effect.
                                 *
                                 * @example
                                 * const style = getEffectStyle('hydrating');
                                 * // style will be "bg-blue-100/80 text-blue-700 ring-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:ring-blue-500/30"
                                 *
                                 * @example
                                 * const style = getEffectStyle('irritation');
                                 * // style will be "bg-red-100/80 text-red-700 ring-red-200 dark:bg-red-500/20 dark:text-red-300 dark:ring-red-500/30"
                                 *
                                 * @example
                                 * const style = getEffectStyle('unknown effect');
                                 * // style will be "bg-gray-100/80 text-gray-700 ring-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:ring-gray-500/30"
                                 */
                                const getEffectStyle = () => {
                                  if (effect.toLowerCase().includes('irritation') || effect.toLowerCase().includes('breakout')) {
                                    return "bg-red-100/80 text-red-700 ring-red-200 dark:bg-red-500/20 dark:text-red-300 dark:ring-red-500/30";
                                  }
                                  if (effect.toLowerCase().includes('hydrating') || effect.toLowerCase().includes('moisturizing')) {
                                    return "bg-blue-100/80 text-blue-700 ring-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:ring-blue-500/30";
                                  }
                                  if (effect.toLowerCase().includes('brightening') || effect.toLowerCase().includes('glowing')) {
                                    return "bg-amber-100/80 text-amber-700 ring-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:ring-amber-500/30";
                                  }
                                  if (effect.toLowerCase().includes('calming') || effect.toLowerCase().includes('soothing')) {
                                    return "bg-green-100/80 text-green-700 ring-green-200 dark:bg-green-500/20 dark:text-green-300 dark:ring-green-500/30";
                                  }
                                  return "bg-gray-100/80 text-gray-700 ring-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:ring-gray-500/30";
                                };

                                return (
                                  <span
                                    key={index}
                                    className={cn(
                                      "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset",
                                      getEffectStyle()
                                    )}
                                  >
                                    {effect}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Progress Photos Tab */}
          <TabsContent value="progress" className="space-y-8">
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
              <>
                {/* Hero Section */}
                <div className="relative overflow-hidden rounded-xl sm:rounded-[2rem] bg-gradient-to-br from-fuchsia-500 to-blue-600 dark:from-fuchsia-600 dark:to-blue-700">
                  <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2)_0%,transparent_70%)]"></div>
                  <div className="relative p-6 sm:p-10 md:p-12 text-white">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3 sm:mb-4">Track Your Progress</h2>
                    <p className="text-white/80 text-base sm:text-lg max-w-xl mb-6 sm:mb-8">Document your skincare journey with photos and add notes to track changes over time.</p>
                    <div className="flex flex-wrap gap-3">
                      <Button 
                        size="lg" 
                        className="bg-white text-fuchsia-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={startCamera}
                      >
                        <Camera className="h-5 w-5 mr-2" />
                        Take Photo
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline"
                        className="bg-white/20 text-white border-white/30 hover:bg-white/30 shadow-lg hover:shadow-xl transition-all duration-300"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="h-5 w-5 mr-2" />
                        Upload Photo
                      </Button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileSelect}
                      />
                    </div>
                  </div>
                  <div className="absolute -bottom-6 right-10 opacity-10">
                    <Camera className="h-48 w-48 rotate-12" />
                  </div>
                </div>

                {/* Sort Controls */}
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Your Photo Timeline</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 gap-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm">
                        <ArrowUpDown className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
                        <span className="sm:hidden">Sort</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleSortChange('newest')}>
                        Newest First
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleSortChange('oldest')}>
                        Oldest First
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Progress Photos */}
                {isUploading && (
                  <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Uploading photo...</span>
                  </div>
                )}

                {progressPhotos.length === 0 ? (
                  <div className="relative overflow-hidden rounded-xl sm:rounded-3xl border bg-gradient-to-b from-muted/50 to-muted p-6 sm:p-12">
                    <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-black/10" />
                    <div className="relative text-center space-y-4">
                      <Camera className="h-12 sm:h-16 w-12 sm:w-16 mx-auto text-muted-foreground/50" />
                      <h3 className="font-semibold text-lg sm:text-xl">Start Tracking Your Progress</h3>
                      <p className="text-muted-foreground max-w-sm mx-auto text-sm sm:text-base">
                        Take photos and document your skincare journey to see how your skin improves over time
                      </p>
                      <div className="pt-4 flex flex-wrap justify-center gap-3">
                        <Button onClick={startCamera} className="bg-purple-600 hover:bg-purple-700 text-white">
                          <Camera className="h-4 w-4 mr-2" />
                          Take Photo
                        </Button>
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Photo
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {Object.entries(photosByMonth).map(([month, photos]) => {
                      // Get month index from the month string (e.g., "January 2023" -> 0)
                      const monthName = month.split(' ')[0];
                      const monthIndex = [
                        'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'
                      ].findIndex(m => m === monthName);
                      
                      // Get color theme based on month
                      const getMonthColor = () => {
                        const colors = [
                          "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30", // January
                          "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30", // February
                          "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30", // March
                          "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30", // April
                          "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30", // May
                          "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30", // June
                          "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30", // July
                          "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30", // August
                          "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30", // September
                          "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30", // October
                          "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30", // November
                          "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/30", // December
                        ];
                        return colors[monthIndex !== -1 ? monthIndex : 0];
                      };
                      
                      return (
                        <div key={month} className="space-y-4">
                          <h4 className={cn(
                            "text-lg font-medium flex items-center gap-2 sticky top-0 backdrop-blur-sm py-2 z-10",
                            "px-3 rounded-lg shadow-sm",
                            getMonthColor()
                          )}>
                            <CalendarIcon className="h-5 w-5" />
                            {month}
                          </h4>
                          <div className="space-y-6">
                            {photos.map((photo) => {
                              // Find the log for this photo if it exists
                              const log = photo.hasLog && photo.logId 
                                ? progressLogs.find(l => l.id === photo.logId) 
                                : null;
                              
                              // Generate a unique gradient based on the month or photo date
                              const getCardGradient = () => {
                                // Use the month number to create a unique gradient
                                const monthIndex = photo.date.getMonth();
                                const dayOfMonth = photo.date.getDate();
                                
                                // Create different gradient styles based on month
                                const gradients = [
                                  // January - Cool blue
                                  "from-blue-100 to-cyan-50 dark:from-blue-900/40 dark:to-cyan-900/20",
                                  // February - Purple love
                                  "from-purple-100 to-pink-50 dark:from-purple-900/40 dark:to-pink-900/20",
                                  // March - Spring green
                                  "from-green-100 to-emerald-50 dark:from-green-900/40 dark:to-emerald-900/20",
                                  // April - Soft orange
                                  "from-orange-100 to-amber-50 dark:from-orange-900/40 dark:to-amber-900/20",
                                  // May - Blossom pink
                                  "from-pink-100 to-rose-50 dark:from-pink-900/40 dark:to-rose-900/20",
                                  // June - Ocean blue
                                  "from-cyan-100 to-blue-50 dark:from-cyan-900/40 dark:to-blue-900/20",
                                  // July - Summer yellow
                                  "from-amber-100 to-yellow-50 dark:from-amber-900/40 dark:to-yellow-900/20",
                                  // August - Warm orange
                                  "from-orange-100 to-red-50 dark:from-orange-900/40 dark:to-red-900/20",
                                  // September - Autumn red
                                  "from-red-100 to-orange-50 dark:from-red-900/40 dark:to-orange-900/20",
                                  // October - Fall brown
                                  "from-amber-100 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/20",
                                  // November - Deep purple
                                  "from-indigo-100 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/20",
                                  // December - Winter blue
                                  "from-slate-100 to-blue-50 dark:from-slate-900/40 dark:to-blue-900/20"
                                ];
                                
                                // If the photo has a log with mood, use mood-based gradient
                                if (log?.mood) {
                                  switch(log.mood) {
                                    case "great":
                                      return "from-green-100 via-emerald-50 to-teal-50 dark:from-green-900/40 dark:via-emerald-900/30 dark:to-teal-900/20";
                                    case "good":
                                      return "from-blue-100 via-sky-50 to-cyan-50 dark:from-blue-900/40 dark:via-sky-900/30 dark:to-cyan-900/20";
                                    case "neutral":
                                      return "from-gray-100 via-slate-50 to-zinc-50 dark:from-gray-900/40 dark:via-slate-900/30 dark:to-zinc-900/20";
                                    case "concerned":
                                      return "from-amber-100 via-yellow-50 to-orange-50 dark:from-amber-900/40 dark:via-yellow-900/30 dark:to-orange-900/20";
                                    case "frustrated":
                                      return "from-red-100 via-rose-50 to-pink-50 dark:from-red-900/40 dark:via-rose-900/30 dark:to-pink-900/20";
                                    default:
                                      return gradients[monthIndex];
                                  }
                                }
                                
                                // Add some variation based on day of month
                                const variation = Math.floor(dayOfMonth / 10);
                                const baseGradient = gradients[monthIndex];
                                
                                // For photos without logs, add a subtle pattern
                                if (!photo.hasLog) {
                                  return `${baseGradient} bg-[radial-gradient(circle_at_${(monthIndex % 3) * 30 + 10}%_${(variation % 3) * 30 + 10}%,rgba(255,255,255,0.8)_0%,transparent_60%)]`;
                                }
                                
                                return baseGradient;
                              };
                              
                              return (
                                <Card 
                                  key={photo.id}
                                  className={cn(
                                    "overflow-hidden",
                                    "transition-all duration-300",
                                    "hover:shadow-md",
                                    "hover:scale-[1.01] hover:-translate-y-0.5",
                                    "cursor-pointer",
                                    "bg-gradient-to-br",
                                    getCardGradient(),
                                    photo.hasLog ? "border-purple-200 dark:border-purple-800" : "border-blue-200 dark:border-blue-800"
                                  )}
                                  onClick={() => {
                                    setSelectedPhoto(photo);
                                    if (photo.hasLog && log) {
                                      setSelectedLog(log);
                                      setLogDialogOpen(true);
                                    } else {
                                      setAddLogDialogOpen(true);
                                    }
                                  }}
                                >
                                  {/* Photo and basic info */}
                                  <div className="flex flex-col sm:flex-row">
                                    {/* Photo */}
                                    <div className="sm:w-1/3 aspect-square sm:aspect-auto relative">
                                      <img 
                                        src={photo.url} 
                                        alt={photo.name || format(photo.date, 'MMMM d, yyyy')} 
                                        className="w-full h-full object-cover"
                                      />
                                      {/* Date overlay */}
                                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-8 pb-2 px-3 text-xs text-white">
                                        {format(photo.date, 'MMMM d, yyyy')}
                                      </div>
                                      
                                      {/* Status indicator */}
                                      <div className={cn(
                                        "absolute top-2 right-2 rounded-full p-1.5",
                                        "backdrop-blur-sm shadow-sm",
                                        photo.hasLog 
                                          ? "bg-purple-100/90 dark:bg-purple-900/80 text-purple-600 dark:text-purple-300" 
                                          : "bg-white/90 dark:bg-gray-800/80 text-muted-foreground"
                                      )}>
                                        {photo.hasLog ? (
                                          <FileText className="h-4 w-4" />
                                        ) : (
                                          <Plus className="h-4 w-4" />
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Info and actions */}
                                    <div className="p-4 flex-1 flex flex-col">
                                      <div className="flex justify-between items-start gap-2 mb-2">
                                        <h5 className="font-medium text-base sm:text-lg">
                                          {photo.name || format(photo.date, 'MMMM d, yyyy')}
                                        </h5>
                                        
                                        {/* Action buttons - simplified */}
                                        <div>
                                          {photo.hasLog ? (
                                            <Button 
                                              variant="ghost" 
                                              size="sm"
                                              className="h-8 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                                              onClick={(e) => {
                                                e.stopPropagation(); // Prevent event bubbling
                                                setSelectedPhoto(photo);
                                                if (log) {
                                                  setSelectedLog(log);
                                                  setLogDialogOpen(true);
                                                } else {
                                                  setAddLogDialogOpen(true);
                                                }
                                              }}
                                            >
                                              <Pencil className="h-3.5 w-3.5 mr-1" />
                                              Edit Notes
                                            </Button>
                                          ) : null}
                                        </div>
                                      </div>
                                      
                                      {/* Log content preview */}
                                      {log ? (
                                        <div className="space-y-3 flex-1">
                                          {/* Title and mood */}
                                          <div className="flex items-center justify-between">
                                            <h6 className="font-medium text-sm text-muted-foreground">
                                              {log.title}
                                            </h6>
                                            {log.mood && (
                                              <Badge 
                                                variant="secondary"
                                                className={cn(
                                                  "capitalize text-xs",
                                                  log.mood === "great" && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200",
                                                  log.mood === "good" && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
                                                  log.mood === "neutral" && "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-200",
                                                  log.mood === "concerned" && "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
                                                  log.mood === "frustrated" && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
                                                )}
                                              >
                                                {log.mood}
                                              </Badge>
                                            )}
                                          </div>
                                          
                                          {/* Description */}
                                          <p className="text-sm line-clamp-2 text-muted-foreground">
                                            {log.description}
                                          </p>
                                          
                                          {/* Tags */}
                                          <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                                            {log.concerns && log.concerns.map((concern, index) => (
                                              <Badge 
                                                key={`concern-${index}`} 
                                                variant="secondary"
                                                className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 text-xs"
                                              >
                                                {concern}
                                              </Badge>
                                            ))}
                                            {log.improvements && log.improvements.map((improvement, index) => (
                                              <Badge 
                                                key={`improvement-${index}`} 
                                                variant="secondary"
                                                className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 text-xs"
                                              >
                                                {improvement}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                      ) : (
                                        <AddProgressLogDialog
                                          existingPhoto={photo}
                                          onLogAdded={loadData}
                                        >
                                          <div 
                                            className="flex flex-col items-center justify-center h-24 border-dashed border-2 rounded-md border-muted-foreground/20 bg-white/30 dark:bg-gray-900/20 backdrop-blur-sm cursor-pointer hover:bg-white/50 dark:hover:bg-gray-900/30 transition-all duration-300 hover:border-purple-300 dark:hover:border-purple-600 group"
                                          >
                                            <div className="flex items-center gap-1.5 text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                              <div className="bg-purple-100 dark:bg-purple-900/70 rounded-full p-1 text-purple-500 dark:text-purple-300 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                                                <Plus className="h-4 w-4" />
                                              </div>
                                              <span className="font-medium text-sm">Add Notes</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground/70 mt-1.5 group-hover:text-muted-foreground transition-colors">
                                              Document your progress and observations
                                            </p>
                                          </div>
                                        </AddProgressLogDialog>
                                      )}
                                    </div>
                                  </div>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Journal Entry Dialog */}
      {selectedEntry && (
        <EditDiaryEntryDialog
          entry={selectedEntry}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onEntryUpdated={loadData}
          onEntryDeleted={loadData}
        />
      )}

      {/* Edit Progress Log Dialog */}
      {selectedLog && (
        <EditProgressLogDialog
          log={selectedLog}
          open={logDialogOpen}
          onOpenChange={setLogDialogOpen}
          onLogUpdated={loadData}
          onLogDeleted={loadData}
        />
      )}
    </div>
  );
}
