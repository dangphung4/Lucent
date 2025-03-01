import { useAuth } from "../lib/AuthContext";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarImage } from "./ui/avatar";
import { useNavigate } from "react-router-dom";
import { AddProductDialog } from "./AddProductDialog";
import { getUserProducts, getRoutineCompletions, Product } from "@/lib/db";
import { Loader2, X, ArrowRight, Plus, ThumbsUp, Check } from "lucide-react";
import { ProductList } from "./ProductList";
import { RoutineList } from "./RoutineList";
import { cn } from "@/lib/utils";
import {
  Star,
  Droplets,
  Sun,
  Layers,
  Sparkles,
  Eye,
  Zap,
  Package,
  Camera,
  Upload,
  CheckCircle,
  Clock,
  PillBottle,
  CircleDashed,
  Pipette
} from "lucide-react";
import { ProgressGallery } from "./ProgressGallery";
import { Badge } from "./ui/badge";
import { motion } from "framer-motion";
import { storage } from "../lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";

export interface ProductStats {
  total: number;
  active: number;
  finished: number;
  repurchase: number;
}

/**
 * Renders the Dashboard component, which displays user-specific information
 * including greetings, product statistics, recent products, and routine progress.
 *
 * The component utilizes hooks to manage state and side effects, such as loading
 * user data and calculating statistics based on the user's products and routines.
 *
 * @returns {JSX.Element} The rendered Dashboard component.
 *
 * @example
 * // Usage in a parent component
 * <Dashboard />
 *
 * @throws {Error} Throws an error if data loading fails.
 */
export function Dashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [greeting, setGreeting] = useState("Hello");
  const [productFilter, setProductFilter] = useState<
    "all" | "active" | "finished" | "repurchase" | undefined
  >("all");
  const [productStats, setProductStats] = useState<ProductStats>({
    total: 0,
    active: 0,
    finished: 0,
    repurchase: 0,
  });
  const [streak, setStreak] = useState(0);
  const [completedRoutines, setCompletedRoutines] = useState(0);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const productListRef = useRef<{ loadProducts: () => Promise<void> }>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [galleryRefreshTrigger, setGalleryRefreshTrigger] = useState(0);

  // Get first name from email or use "there" as fallback
  const firstName = currentUser?.displayName || "there";
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  // Load products and calculate stats
  useEffect(() => {
    if (!currentUser?.uid) return;

    /**
     * Asynchronously loads user data, including product statistics, routine completions,
     * current streak, total completed routines, and the five most recent products.
     *
     * This function performs the following tasks:
     * - Sets the loading state to true.
     * - Fetches user products and calculates product statistics such as total, active,
     *   finished, and repurchase counts.
     * - Loads routine completions for streak and progress calculation.
     * - Calculates the current streak of consecutive days with at least one completed routine.
     * - Counts the total number of completed routines where all steps are completed.
     * - Retrieves the five most recent products based on their creation date.
     *
     * @async
     * @function loadData
     * @throws {Error} Throws an error if data loading fails.
     *
     * @example
     * // Call the loadData function to initiate data loading
     * loadData().then(() => {
     *   console.log('Data loaded successfully');
     * }).catch(error => {
     *   console.error('Failed to load data:', error);
     * });
     */
    const loadData = async () => {
      try {
        const fetchedProducts = await getUserProducts(currentUser.uid);

        // Calculate product stats
        const stats: ProductStats = {
          total: fetchedProducts.length,
          active: fetchedProducts.filter((p) => p.status === "active").length,
          finished: fetchedProducts.filter((p) => p.status === "finished")
            .length,
          repurchase: fetchedProducts.filter(
            (p) => p.status === "finished" && p.wouldRepurchase
          ).length,
        };
        setProductStats(stats);

        // Load routine completions for streak and progress calculation
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);

        const completions = await getRoutineCompletions(
          currentUser.uid,
          oneMonthAgo,
          today
        );

        // Calculate streak (consecutive days with at least one completed routine)
        let currentStreak = 0;
        const dateMap = new Map<string, boolean>();

        // Group completions by date
        completions.forEach((completion) => {
          const dateStr = completion.date.toDateString();
          const hasCompletedSteps = completion.completedSteps.some(
            (step) => step.completed
          );

          if (hasCompletedSteps) {
            dateMap.set(dateStr, true);
          }
        });

        // Calculate streak
        const today_str = today.toDateString();
        const checkDate = new Date(today);

        // Check if today has completions
        if (dateMap.has(today_str)) {
          currentStreak = 1;

          // Check previous days
          while (true) {
            checkDate.setDate(checkDate.getDate() - 1);
            const checkDateStr = checkDate.toDateString();

            if (dateMap.has(checkDateStr)) {
              currentStreak++;
            } else {
              break;
            }
          }
        }

        setStreak(currentStreak);

        // Calculate total completed routines (routines with all steps completed)
        const completedRoutinesCount = completions.filter((completion) => {
          const totalSteps = completion.completedSteps.length;
          const completedSteps = completion.completedSteps.filter(
            (step) => step.completed
          ).length;
          return totalSteps > 0 && completedSteps === totalSteps;
        }).length;

        setCompletedRoutines(completedRoutinesCount);

        // Get 5 most recent products
        const sorted = [...fetchedProducts].sort((a, b) => {
          const dateA =
            a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const dateB =
            b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });

        setRecentProducts(sorted.slice(0, 5));
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [currentUser]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Navigate to settings page
  const handleEditProfile = () => {
    navigate("/settings?tab=account");
  };

  const handleProductsChange = (stats: ProductStats) => {
    setProductStats(stats);
  };

  const handleFilterChange = (filter: "all" | "active" | "finished" | "repurchase" | undefined) => {
    setProductFilter(filter);
  };

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
    if (!currentUser) return;

    try {
      setIsUploading(true);

      // Create a reference to the file in Firebase Storage
      const timestamp = new Date().getTime();
      const storageRef = ref(
        storage,
        `progress/${currentUser.uid}/${timestamp}_${file.name}`
      );

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL and trigger success
      await getDownloadURL(storageRef);

      toast.success("Photo uploaded successfully");
      setActiveTab("progress");
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

  // Get icon based on product category
  const getCategoryIcon = (category: string | null) => {
    switch (category?.toLowerCase()) {
      case "cleanser":
        return <Droplets className="h-6 w-6 text-blue-600" />;
      case "toner":
        return <PillBottle className="h-6 w-6 text-blue-600" />;
      case "serum":
        return <Pipette className="h-6 w-6 text-blue-600" />;
      case "moisturizer":
        return <CircleDashed className="h-6 w-6 text-blue-600" />;
      case "sunscreen":
        return <Sun className="h-6 w-6 text-blue-600" />;
      case "mask":
        return <Layers className="h-6 w-6 text-blue-600" />;
      case "exfoliant":
        return <Sparkles className="h-6 w-6 text-blue-600" />;
      case "eye cream":
        return <Eye className="h-6 w-6 text-blue-600" />;
      case "treatment":
        return <Zap className="h-6 w-6 text-blue-600" />;
      default:
        return <Package className="h-6 w-6 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-8">
      {/* Welcome Section with Enhanced Gradient - Darker for better light mode contrast */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/90 via-[#b83280] to-[#805ad5] dark:from-[#4f46e5] dark:via-primary dark:to-[#7e22ce] pt-8 pb-20 md:pt-12 md:pb-24">
        {/* Animated gradient overlay with shimmer effect */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#f59e0b]/30 via-transparent to-[#8b5cf6]/30 dark:from-[#8b5cf6]/20 dark:to-[#ec4899]/20 animate-shimmer"></div>
        
        {/* Animated light streaks */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="light-streak light-streak-1"></div>
          <div className="light-streak light-streak-2"></div>
          <div className="light-streak light-streak-3"></div>
        </div>
        
        {/* Enhanced floating particles with different sizes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="particles-container">
            {[...Array(30)].map((_, i) => (
              <div 
                key={i} 
                className={`particle particle-${i % 3}`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 10}s`,
                  opacity: 0.1 + Math.random() * 0.3,
                  width: `${4 + Math.random() * 4}px`,
                  height: `${4 + Math.random() * 4}px`
                }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Grid pattern with enhanced mask */}
        <div className="absolute inset-0 bg-grid-pattern [mask-image:linear-gradient(0deg,rgba(255,255,255,0.8),rgba(255,255,255,0.1))]"></div>
        
        {/* Enhanced glow effects */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#f59e0b]/30 dark:bg-[#8b5cf6]/20 rounded-full filter blur-3xl opacity-40 animate-pulse-slow"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-[#ec4899]/30 dark:bg-[#ec4899]/20 rounded-full filter blur-3xl opacity-30 animate-pulse-slower"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#8b5cf6]/30 dark:bg-[#f59e0b]/20 rounded-full filter blur-3xl opacity-40 animate-pulse-slow"></div>
        <div className="absolute bottom-10 left-1/4 w-64 h-64 bg-[#ec4899]/30 dark:bg-[#8b5cf6]/20 rounded-full filter blur-3xl opacity-30 animate-pulse-slower"></div>

        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-noise-pattern opacity-[0.03]"></div>

        <div className="container max-w-7xl mx-auto px-4 relative z-10">
          {/* Enhanced subtle badge with glow - now green */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#10b981]/20 backdrop-blur-md text-white text-xs font-medium mb-1 shadow-md border border-[#10b981]/30 animate-glow">
            <span className="inline-block w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
            <span>Your Skincare Journey</span>
          </div>

          <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white drop-shadow-md">
                {greeting}, <span className="text-[#f59e0b] dark:text-[#fbbf24]">{displayName}!</span>
              </h1>
              <p className="text-white/90 max-w-xl backdrop-blur-md bg-white/10 p-2 rounded-lg border border-white/20 shadow-lg">
                Track your skincare routine, monitor progress, and discover what
                works best for your skin.
              </p>
            </div>

            <div className="flex items-center gap-3 mt-2 md:mt-0">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full text-sm font-medium backdrop-blur-md bg-white/20 border border-white/20 hover:bg-white/30 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                onClick={handleEditProfile}
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
                  className="mr-1"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Profile
              </Button>
              <Avatar className="h-10 w-10 border-2 border-white/40 shadow-xl ring-2 ring-[#f59e0b]/30 dark:ring-[#fbbf24]/30 hover:ring-[#f59e0b]/50 dark:hover:ring-[#fbbf24]/50 transition-all">
                <div className="flex h-full w-full items-center justify-center bg-primary-foreground text-primary font-medium">
                  {currentUser?.photoURL ? (
                    <AvatarImage src={currentUser.photoURL} alt={displayName} />
                  ) : (
                    displayName.charAt(0)
                  )}
                </div>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Enhanced Wave Divider with double wave */}
        <div className="absolute bottom-0 left-0 right-0 h-12 md:h-16 overflow-hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            className="absolute bottom-0 w-full h-full opacity-90"
            preserveAspectRatio="none"
          >
            <path
              fill="hsl(var(--background))"
              fillOpacity="1"
              d="M0,128L48,144C96,160,192,192,288,186.7C384,181,480,139,576,138.7C672,139,768,181,864,181.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            className="absolute bottom-0 w-full h-full opacity-50"
            preserveAspectRatio="none"
          >
            <path
              fill="hsl(var(--background))"
              fillOpacity="0.8"
              d="M0,96L60,106.7C120,117,240,139,360,138.7C480,139,600,117,720,112C840,107,960,117,1080,138.7C1200,160,1320,192,1380,208L1440,224L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            ></path>
          </svg>
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent"></div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 -mt-14 md:-mt-18 relative z-10">
        {/* Dashboard Tabs */}
        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="bg-card rounded-xl shadow-lg border p-1 mb-8">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger
                value="overview"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Products
              </TabsTrigger>
              <TabsTrigger
                value="routines"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Routines
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Progress
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Overview Card - Consistent with dark mode pattern but with proper light mode contrast */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/40 via-primary/30 to-background border border-primary/40 dark:border-primary/30 p-6 group hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-grid-pattern opacity-15 group-hover:opacity-25 transition-opacity"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {/* Animated light streaks - enhanced for light mode */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="light-streak light-streak-1 light-mode-visible"></div>
                  <div className="light-streak light-streak-2 light-mode-visible"></div>
                </div>
                {/* Subtle floating particles - enhanced for light mode */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="particles-container">
                    {[...Array(10)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`particle particle-${i % 3} light-mode-visible`}
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 5}s`,
                          opacity: 0.15 + Math.random() * 0.25,
                          width: `${3 + Math.random() * 3}px`,
                          height: `${3 + Math.random() * 3}px`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/30 text-primary dark:text-primary text-sm font-medium mb-2 shadow-md backdrop-blur-sm border border-primary/40 animate-glow">
                      <Package className="h-4 w-4" />
                      Dashboard Overview
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2 text-primary dark:text-gradient">
                      Welcome to Your Dashboard
                    </h2>
                    <p className="text-muted-foreground max-w-xl backdrop-blur-sm bg-background/50 p-2 rounded-lg border border-primary/30 shadow-sm">
                      Track your skincare journey, monitor product usage, and
                      see your progress over time.
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="h-16 w-16 rounded-2xl bg-primary/40 flex items-center justify-center shadow-glow animate-pulse-slow">
                      <Package className="h-8 w-8 text-primary-foreground dark:text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats - Consistent with dark mode pattern but with proper light mode contrast */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Card
                    className="bg-gradient-to-br from-blue-500/30 to-blue-400/20 dark:from-blue-900/30 dark:to-blue-800/20 border-blue-300/60 dark:border-blue-800/30 cursor-pointer overflow-hidden relative group"
                    onClick={() => setActiveTab("products")}
                  >
                    <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity"></div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full filter blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                    <CardContent className="p-6 relative">
                      <div className="flex flex-col">
                        <span className="text-blue-700 dark:text-blue-400 text-sm font-medium flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Products
                        </span>
                        <span className="text-3xl font-bold mt-1 text-blue-800 group-hover:text-blue-900 dark:text-blue-300 dark:group-hover:text-blue-200 transition-colors">
                          {productStats.total}
                        </span>
                        <span className="text-blue-700/80 dark:text-blue-400/70 text-xs mt-1 group-hover:text-blue-800 dark:group-hover:text-blue-300 transition-colors">
                          {productStats.active} active
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Card
                    className="bg-gradient-to-br from-green-500/30 to-green-400/20 dark:from-green-900/30 dark:to-green-800/20 border-green-300/60 dark:border-green-800/30 cursor-pointer overflow-hidden relative group"
                    onClick={() => navigate("/calendar")}
                  >
                    <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity"></div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-green-500/20 rounded-full filter blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                    <CardContent className="p-6 relative">
                      <div className="flex flex-col">
                        <span className="text-green-700 dark:text-green-400 text-sm font-medium flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Streak
                        </span>
                        <span className="text-3xl font-bold mt-1 text-green-800 group-hover:text-green-900 dark:text-green-300 dark:group-hover:text-green-200 transition-colors">
                          {streak}
                        </span>
                        <span className="text-green-700/80 dark:text-green-400/70 text-xs mt-1 group-hover:text-green-800 dark:group-hover:text-green-300 transition-colors">
                          Days in a row
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Card
                    className="bg-gradient-to-br from-amber-500/30 to-amber-400/20 dark:from-amber-900/30 dark:to-amber-800/20 border-amber-300/60 dark:border-amber-800/30 cursor-pointer overflow-hidden relative group"
                    onClick={() => setActiveTab("routines")}
                  >
                    <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity"></div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full filter blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                    <CardContent className="p-6 relative">
                      <div className="flex flex-col">
                        <span className="text-amber-700 dark:text-amber-400 text-sm font-medium flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Progress
                        </span>
                        <span className="text-3xl font-bold mt-1 text-amber-800 group-hover:text-amber-900 dark:text-amber-300 dark:group-hover:text-amber-200 transition-colors">
                          {completedRoutines}
                        </span>
                        <span className="text-amber-700/80 dark:text-amber-400/70 text-xs mt-1 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
                          Routines completed
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Card
                    className="bg-gradient-to-br from-purple-500/30 to-purple-400/20 dark:from-purple-900/30 dark:to-purple-800/20 border-purple-300/60 dark:border-purple-800/30 cursor-pointer overflow-hidden relative group"
                    onClick={() => setActiveTab("progress")}
                  >
                    <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity"></div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full filter blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                    <CardContent className="p-6 relative">
                      <div className="flex flex-col">
                        <span className="text-purple-700 dark:text-purple-400 text-sm font-medium flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          Finished
                        </span>
                        <span className="text-3xl font-bold mt-1 text-purple-800 group-hover:text-purple-900 dark:text-purple-300 dark:group-hover:text-purple-200 transition-colors">
                          {productStats.finished}
                        </span>
                        <span className="text-purple-700/80 dark:text-purple-400/70 text-xs mt-1 group-hover:text-purple-800 dark:group-hover:text-purple-300 transition-colors">
                          {productStats.repurchase} would repurchase
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Recent Products - Enhanced with better light mode visuals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600/50 via-blue-500/40 to-blue-400/30 dark:from-blue-500/40 dark:via-blue-500/30 dark:to-background border p-6 group hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-grid-pattern opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {/* Subtle floating particles */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="particles-container">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`particle particle-${i % 3}`}
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            opacity: 0.1 + Math.random() * 0.2,
                            width: `${2 + Math.random() * 2}px`,
                            height: `${2 + Math.random() * 2}px`
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-blue-500/40 flex items-center justify-center shadow-sm animate-pulse-slow">
                        <Package className="h-6 w-6 text-blue-950 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-blue-950 dark:text-blue-200">Recent Products</h3>
                        <p className="text-blue-800 dark:text-blue-400/80 text-sm">Your latest skincare additions</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-blue-900 dark:text-blue-400 group-hover:bg-blue-500/15 transition-colors"
                      onClick={() => setActiveTab("products")}
                    >
                      <span>View All</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {recentProducts.length === 0 ? (
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/20 via-background to-background border p-6 flex flex-col items-center justify-center min-h-[200px] group hover:shadow-md transition-all duration-300">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity"></div>
                    <Package className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground text-center mb-4">No products added yet</p>
                    <AddProductDialog
                      onProductAdded={() => {
                        setActiveTab("products");
                        productListRef.current?.loadProducts();
                      }}
                    >
                      <Button className="relative overflow-hidden group bg-blue-600 hover:bg-blue-700 text-white">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Plus className="h-4 w-4 mr-2 relative z-10" />
                        <span className="relative z-10">Add Your First Product</span>
                      </Button>
                    </AddProductDialog>
                  </div>
                ) : (
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500/20 via-background to-background border p-6 group hover:shadow-md transition-all duration-300">
                    <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity"></div>
                    <div className="space-y-4">
                      {recentProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-blue-500/10 group/item",
                            product.wouldRepurchase
                              ? "border-l-4 border-l-green-500"
                              : product.status === "finished"
                              ? "border-l-4 border-l-amber-500"
                              : "border-l-4 border-l-transparent"
                          )}
                        >
                          {product.imageUrl ? (
                            <div className="h-12 w-12 rounded-md overflow-hidden border bg-background">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-12 w-12 rounded-md border flex items-center justify-center bg-blue-500/10">
                              {getCategoryIcon(product.category)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">{product.name}</h4>
                              {product.wouldRepurchase && (
                                <Badge variant="outline" className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800 group-hover/item:bg-green-500/25 transition-colors">
                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                  Repurchase
                                </Badge>
                              )}
                              {product.status === "finished" && !product.wouldRepurchase && (
                                <Badge variant="outline" className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800 group-hover/item:bg-amber-500/25 transition-colors">
                                  <Check className="h-3 w-3 mr-1" />
                                  Finished
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <span>{product.brand}</span>
                              <span className="text-xs">•</span>
                              <span>{product.category}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tips & Recommendations - Enhanced with better light mode visuals */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-6 rounded-full bg-primary/30 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-primary"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 8v4"></path>
                      <path d="M12 16h.01"></path>
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold">Tips & Recommendations</h2>
                </div>
                
                <Card className="bg-gradient-to-br from-primary/30 via-primary/20 to-transparent border-primary/30 shadow-lg relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                  <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/15 rounded-full filter blur-3xl opacity-70"></div>
                  <CardContent className="p-6 relative">
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/25 text-primary border border-primary/40 shadow-glow">
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
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 8v4"></path>
                          <path d="M12 16h.01"></path>
                        </svg>
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-lg font-medium">
                          Track Your Progress
                        </h3>
                        <p className="text-muted-foreground backdrop-blur-sm bg-background/50 p-3 rounded-lg border border-primary/20 shadow-sm">
                          {productStats.total === 0
                            ? "Start by adding your skincare products to track their effectiveness and build your perfect routine."
                            : `You have ${productStats.active} active products. Keep track of how they work for your skin and mark them as finished when done.`}
                        </p>
                        {productStats.total === 0 && (
                          <AddProductDialog
                            onProductAdded={() => {
                              setActiveTab("products");
                              productListRef.current?.loadProducts();
                            }}
                          >
                            <Button
                              variant="outline"
                              className="mt-2 border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary transition-all"
                            >
                              <Package className="h-4 w-4 mr-2" />
                              Add your first product
                            </Button>
                          </AddProductDialog>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="products" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Header Section - Updated with better text contrast for light mode */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600/60 via-blue-500/50 to-blue-400/40 dark:from-blue-500/20 dark:via-blue-500/15 dark:to-background border border-blue-500/40 dark:border-blue-500/30 p-6 group hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-grid-pattern opacity-15 group-hover:opacity-25 transition-opacity"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {/* Animated light streaks - enhanced for light mode */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="light-streak light-streak-1 light-mode-visible"></div>
                  <div className="light-streak light-streak-2 light-mode-visible"></div>
                </div>
                {/* Subtle floating particles - enhanced for light mode */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="particles-container">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`particle particle-${i % 3} light-mode-visible`}
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 5}s`,
                          opacity: 0.15 + Math.random() * 0.25,
                          width: `${2 + Math.random() * 2}px`,
                          height: `${2 + Math.random() * 2}px`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 text-blue-900 dark:text-blue-400 text-sm font-medium mb-2 shadow-md backdrop-blur-sm border border-blue-500/40 animate-glow">
                      <Package className="h-4 w-4" />
                      Product Management
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2 text-blue-950 dark:text-blue-200">
                      Your Products
                    </h2>
                    <p className="text-blue-800 dark:text-muted-foreground max-w-xl backdrop-blur-sm bg-background/50 p-2 rounded-lg border border-blue-500/30 shadow-sm">
                      Keep track of your skincare products, mark favorites, and manage your collection.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:block">
                      <div className="h-16 w-16 rounded-2xl bg-blue-500/40 flex items-center justify-center shadow-glow animate-pulse-slow">
                        <Package className="h-8 w-8 text-blue-950 dark:text-blue-400" />
                      </div>
                    </div>
                    <AddProductDialog
                      onProductAdded={() => {
                        setActiveTab("products");
                        productListRef.current?.loadProducts();
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Quick Stats - Consistent with dark mode pattern */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-500/30 to-blue-400/20 dark:from-blue-900/30 dark:to-blue-800/20 border-blue-300/60 dark:border-blue-800/30 overflow-hidden relative">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity"></div>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/20 rounded-full filter blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  <CardContent className="p-4 relative">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Package className="h-5 w-5 text-blue-700 dark:text-blue-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-blue-700/70 dark:text-muted-foreground">
                          Total Products
                        </span>
                        <span className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                          {productStats.total}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-500/30 to-green-400/20 dark:from-green-900/30 dark:to-green-800/20 border-green-300/60 dark:border-green-800/30 overflow-hidden relative">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity"></div>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-green-500/20 rounded-full filter blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  <CardContent className="p-4 relative">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Package className="h-5 w-5 text-green-700 dark:text-green-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-green-700/70 dark:text-muted-foreground">
                          Active
                        </span>
                        <span className="text-2xl font-bold text-green-800 dark:text-green-200">
                          {productStats.active}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-500/30 to-purple-400/20 dark:from-purple-900/30 dark:to-purple-800/20 border-purple-300/60 dark:border-purple-800/30 overflow-hidden relative">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity"></div>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/20 rounded-full filter blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  <CardContent className="p-4 relative">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Package className="h-5 w-5 text-purple-700 dark:text-purple-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-purple-700/70 dark:text-muted-foreground">
                          Finished
                        </span>
                        <span className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                          {productStats.finished}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-amber-500/30 to-amber-400/20 dark:from-amber-900/30 dark:to-amber-800/20 border-amber-300/60 dark:border-amber-800/30 overflow-hidden relative">
                  <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity"></div>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-amber-500/20 rounded-full filter blur-xl opacity-70 group-hover:opacity-100 transition-opacity"></div>
                  <CardContent className="p-4 relative">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Package className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-amber-700/70 dark:text-muted-foreground">
                          Would Repurchase
                        </span>
                        <span className="text-2xl font-bold text-amber-800 dark:text-amber-200">
                          {productStats.repurchase}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filter/Sort Options - Enhanced with better light mode visuals */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                <Button
                  variant={productFilter === undefined ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "whitespace-nowrap gap-2",
                    productFilter === undefined 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "border-blue-300 text-blue-700 dark:text-blue-400 hover:bg-blue-100/50 dark:hover:bg-blue-900/20"
                  )}
                  onClick={() => handleFilterChange(undefined)}
                >
                  <Package className="h-4 w-4" />
                  All Products
                </Button>
                <Button
                  variant={productFilter === "active" ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "whitespace-nowrap gap-2",
                    productFilter === "active" 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "border-green-300 text-green-700 dark:text-green-400 hover:bg-green-100/50 dark:hover:bg-green-900/20"
                  )}
                  onClick={() => handleFilterChange("active")}
                >
                  <Package className="h-4 w-4" />
                  Active
                </Button>
                <Button
                  variant={productFilter === "finished" ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "whitespace-nowrap gap-2",
                    productFilter === "finished" 
                      ? "bg-purple-600 hover:bg-purple-700 text-white" 
                      : "border-purple-300 text-purple-700 dark:text-purple-400 hover:bg-purple-100/50 dark:hover:bg-purple-900/20"
                  )}
                  onClick={() => handleFilterChange("finished")}
                >
                  <Package className="h-4 w-4" />
                  Finished
                </Button>
                <Button
                  variant={productFilter === "repurchase" ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "whitespace-nowrap gap-2",
                    productFilter === "repurchase" 
                      ? "bg-amber-600 hover:bg-amber-700 text-white" 
                      : "border-amber-300 text-amber-700 dark:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/20"
                  )}
                  onClick={() => handleFilterChange("repurchase")}
                >
                  <Package className="h-4 w-4" />
                  Would Repurchase
                </Button>
              </div>

              {/* Product List */}
              <ProductList
                ref={productListRef}
                filter={productFilter}
                onProductsChange={() => setActiveTab("products")}
                onStatsChange={handleProductsChange}
              />
            </motion.div>
          </TabsContent>

          <TabsContent value="routines" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Routines Header - Updated with better text contrast for light mode */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-600/60 via-purple-500/50 to-purple-400/40 dark:from-purple-500/20 dark:via-purple-500/15 dark:to-background border border-purple-500/40 dark:border-purple-500/30 p-6 group hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-grid-pattern opacity-15 group-hover:opacity-25 transition-opacity"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {/* Animated light streaks - enhanced for light mode */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="light-streak light-streak-1 light-mode-visible"></div>
                  <div className="light-streak light-streak-2 light-mode-visible"></div>
                </div>
                {/* Subtle floating particles - enhanced for light mode */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="particles-container">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`particle particle-${i % 3} light-mode-visible`}
                        style={{
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          animationDelay: `${Math.random() * 5}s`,
                          opacity: 0.15 + Math.random() * 0.25,
                          width: `${2 + Math.random() * 2}px`,
                          height: `${2 + Math.random() * 2}px`
                        }}
                      ></div>
                    ))}
                  </div>
                </div>
                <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/30 text-purple-900 dark:text-purple-400 text-sm font-medium mb-2 shadow-md backdrop-blur-sm border border-purple-500/40 animate-glow">
                      <Clock className="h-4 w-4" />
                      Daily Routines
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2 text-purple-950 dark:text-purple-200">
                      Your Routines
                    </h2>
                    <p className="text-purple-800 dark:text-muted-foreground max-w-xl backdrop-blur-sm bg-background/50 p-2 rounded-lg border border-purple-500/30 shadow-sm">
                      Create and customize your morning and evening skincare routines for optimal results.
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="h-16 w-16 rounded-2xl bg-purple-500/40 flex items-center justify-center shadow-glow animate-pulse-slow">
                      <Clock className="h-8 w-8 text-purple-950 dark:text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Routines List */}
              <RoutineList onRoutinesChange={() => setActiveTab("routines")} />
            </motion.div>
          </TabsContent>

          <TabsContent value="progress" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
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
                      <Package className="h-6 w-6" />
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
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-600/60 via-green-500/50 to-green-400/40 dark:from-green-500/20 dark:via-green-500/15 dark:to-background border border-green-500/40 dark:border-green-500/30 group hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-grid-pattern opacity-15 group-hover:opacity-25 transition-opacity"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  {/* Animated light streaks - enhanced for light mode */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="light-streak light-streak-1 light-mode-visible"></div>
                    <div className="light-streak light-streak-2 light-mode-visible"></div>
                  </div>
                  {/* Subtle floating particles - enhanced for light mode */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="particles-container">
                      {[...Array(5)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`particle particle-${i % 3} light-mode-visible`}
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            opacity: 0.15 + Math.random() * 0.25,
                            width: `${2 + Math.random() * 2}px`,
                            height: `${2 + Math.random() * 2}px`
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className="relative p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/30 text-green-900 dark:text-green-400 text-sm font-medium mb-2 shadow-md backdrop-blur-sm border border-green-500/40 animate-glow">
                          <Camera className="h-4 w-4" />
                          Progress Photos
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-green-950 dark:text-green-200">
                          Track Your Journey
                        </h2>
                        <p className="text-green-800 dark:text-muted-foreground max-w-xl backdrop-blur-sm bg-background/50 p-2 rounded-lg border border-green-500/30 shadow-sm">
                          Document your skincare progress with photos. Compare and see your transformation over time.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={startCamera}
                          className="group relative overflow-hidden gap-2 bg-green-600 hover:bg-green-700 text-white"
                          size="lg"
                          disabled={isUploading}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <Camera className="h-4 w-4 relative z-10" />
                          <span className="relative z-10">Take Photo</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="group relative overflow-hidden gap-2 border-green-300 text-green-900 bg-green-500/20 hover:bg-green-500/30 dark:text-green-400 dark:bg-transparent dark:hover:bg-green-900/20"
                          size="lg"
                          disabled={isUploading}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <Upload className="h-4 w-4 relative z-10" />
                          <span className="relative z-10">Upload Photo</span>
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
                <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
                  <Loader2 className="h-6 w-6 animate-spin mr-2 text-green-600 dark:text-green-400" />
                  <span className="text-green-700 dark:text-green-400">Uploading photo...</span>
                </div>
              )}

              <ProgressGallery refreshTrigger={galleryRefreshTrigger} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add the CSS for the grid pattern and new animations */}
      <style>
        {`
          .bg-grid-pattern {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.2)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
          }
          
          .bg-noise-pattern {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          }
          
          @keyframes shimmer {
            0% { opacity: 0.4; transform: translateY(-2%) scale(1.02); }
            50% { opacity: 0.7; transform: translateY(0) scale(1); }
            100% { opacity: 0.4; transform: translateY(-2%) scale(1.02); }
          }
          
          .animate-shimmer {
            animation: shimmer 12s ease-in-out infinite;
          }
          
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(1.05); }
          }
          
          @keyframes pulse-slower {
            0%, 100% { opacity: 0.2; transform: scale(1); }
            50% { opacity: 0.4; transform: scale(1.08); }
          }
          
          .animate-pulse-slow {
            animation: pulse-slow 8s ease-in-out infinite;
          }
          
          .animate-pulse-slower {
            animation: pulse-slower 12s ease-in-out infinite;
          }
          
          @keyframes glow {
            0%, 100% { box-shadow: 0 0 5px 0 rgba(255, 255, 255, 0.3); }
            50% { box-shadow: 0 0 15px 0 rgba(255, 255, 255, 0.5); }
          }
          
          .animate-glow {
            animation: glow 4s ease-in-out infinite;
          }
          
          .shadow-glow {
            box-shadow: 0 0 15px 0 rgba(var(--primary), 0.3);
          }
          
          .particles-container {
            position: absolute;
            width: 100%;
            height: 100%;
          }
          
          .particle {
            position: absolute;
            background: white;
            border-radius: 50%;
            filter: blur(1px);
            animation: float 15s ease-in-out infinite;
          }
          
          .dark .particle-0 {
            background: rgba(255, 255, 255, 0.8);
          }
          
          .dark .particle-1 {
            background: rgba(251, 191, 36, 0.8);
          }
          
          .dark .particle-2 {
            background: rgba(236, 72, 153, 0.8);
          }
          
          .particle-0 {
            background: rgba(255, 255, 255, 0.8);
          }
          
          .particle-1 {
            background: rgba(245, 158, 11, 0.8);
          }
          
          .particle-2 {
            background: rgba(236, 72, 153, 0.8);
          }
          
          /* Enhanced particles for light mode */
          .light-mode-visible.particle-0 {
            background: rgba(255, 255, 255, 0.9);
            filter: blur(2px);
          }
          
          .light-mode-visible.particle-1 {
            background: rgba(255, 255, 255, 0.9);
            filter: blur(2px);
          }
          
          .light-mode-visible.particle-2 {
            background: rgba(255, 255, 255, 0.9);
            filter: blur(2px);
          }
          
          @keyframes float {
            0% { transform: translateY(0) translateX(0) rotate(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-120px) translateX(20px) rotate(360deg); opacity: 0; }
          }
          
          .light-streak {
            position: absolute;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            height: 1px;
            width: 200%;
            transform: rotate(-45deg);
            animation: streak 8s linear infinite;
            opacity: 0;
          }
          
          /* Enhanced light streaks for light mode */
          .light-mode-visible.light-streak {
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.7), transparent);
            height: 2px;
          }
          
          .light-streak-1 {
            top: 30%;
            animation-delay: 0s;
          }
          
          .light-streak-2 {
            top: 60%;
            animation-delay: 3s;
          }
          
          .light-streak-3 {
            top: 10%;
            animation-delay: 6s;
          }
          
          @keyframes streak {
            0% { transform: translateX(-100%) rotate(-45deg); opacity: 0; }
            10% { opacity: 0.6; }
            50% { opacity: 0.3; }
            90% { opacity: 0.6; }
            100% { transform: translateX(100%) rotate(-45deg); opacity: 0; }
          }
          
          .text-gradient {
            background: linear-gradient(to right, hsl(var(--primary)), hsl(var(--primary)/0.8));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        `}
      </style>
    </div>
  );
}
