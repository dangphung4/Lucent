import { useAuth } from "../lib/AuthContext";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarImage } from "./ui/avatar";
import { useNavigate } from "react-router-dom";
import { AddProductDialog } from "./AddProductDialog";
import { getUserProducts, getRoutineCompletions, Product } from "@/lib/db";
import { Loader2, X } from "lucide-react";
import { ProductList } from "./ProductList";
import { RoutineList } from "./RoutineList";
import { cn } from "@/lib/utils";
import {
  Star,
  Droplets,
  FlaskConical,
  CircleDot,
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
} from "lucide-react";
import { ProgressGallery } from "./ProgressGallery";
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
    "all" | "active" | "finished" | "repurchase"
  >("all");
  const [productStats, setProductStats] = useState<ProductStats>({
    total: 0,
    active: 0,
    finished: 0,
    repurchase: 0,
  });
  const [loading, setLoading] = useState(true);
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
      setLoading(true);
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
      } finally {
        setLoading(false);
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

  const handleFilterChange = (filter: typeof productFilter) => {
    setProductFilter(filter);
  };

  const getCategoryIcon = (category: string | null | undefined) => {
    switch (category?.toLowerCase()) {
      case "cleanser":
        return <Droplets className="h-5 w-5" />;
      case "toner":
        return <FlaskConical className="h-5 w-5" />;
      case "serum":
        return <FlaskConical className="h-5 w-5" />;
      case "moisturizer":
        return <CircleDot className="h-5 w-5" />;
      case "sunscreen":
        return <Sun className="h-5 w-5" />;
      case "mask":
        return <Layers className="h-5 w-5" />;
      case "exfoliant":
        return <Sparkles className="h-5 w-5" />;
      case "eye cream":
        return <Eye className="h-5 w-5" />;
      case "treatment":
        return <Zap className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
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

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-8">
      {/* Welcome Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/80 via-primary to-primary/90 pt-8 pb-12 md:pt-12 md:pb-16">
        <div className="absolute inset-0 bg-grid-pattern [mask-image:linear-gradient(0deg,rgba(255,255,255,0.5),rgba(255,255,255,0.1))]"></div>

        <div className="container max-w-7xl mx-auto px-4">
          {/* Subtle badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium mb-1 shadow-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span>Your Skincare Journey</span>
          </div>

          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                {greeting}, {displayName}!
              </h1>
              <p className="text-primary-foreground/90 max-w-xl">
                Track your skincare routine, monitor progress, and discover what
                works best for your skin.
              </p>
            </div>

            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full text-sm font-medium"
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
              <Avatar className="h-10 w-10 border-2 border-white">
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

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 h-8 md:h-12">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 320"
            className="absolute bottom-0 w-full h-full"
          >
            <path
              fill="hsl(var(--background))"
              fillOpacity="1"
              d="M0,128L48,144C96,160,192,192,288,186.7C384,181,480,139,576,138.7C672,139,768,181,864,181.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            ></path>
          </svg>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 -mt-6 md:-mt-10 relative z-10">
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
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-background border p-6 group hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-grid-pattern opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
                      <Package className="h-4 w-4" />
                      Dashboard Overview
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2">
                      Welcome to Your Dashboard
                    </h2>
                    <p className="text-muted-foreground max-w-xl">
                      Track your skincare journey, monitor product usage, and
                      see your progress over time.
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <Package className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}

              {/* When pressed, takes user to Product tab */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card
                  className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 cursor-pointer"
                  onClick={() => setActiveTab("products")}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                        Products
                      </span>
                      <span className="text-3xl font-bold mt-1">
                        {productStats.total}
                      </span>
                      <span className="text-muted-foreground text-xs mt-1">
                        {productStats.active} active
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* When pressed, navigates to calendar page /calendar  */}
                <Card
                  className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800 cursor-pointer"
                  onClick={() => navigate("/calendar")}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                        Streak
                      </span>
                      <span className="text-3xl font-bold mt-1">{streak}</span>
                      <span className="text-muted-foreground text-xs mt-1">
                        Days in a row
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* When pressed, takes user to Routine tab */}
                <Card
                  className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800 cursor-pointer"
                  onClick={() => setActiveTab("routines")}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-amber-600 dark:text-amber-400 text-sm font-medium">
                        Progress
                      </span>
                      <span className="text-3xl font-bold mt-1">
                        {completedRoutines}
                      </span>
                      <span className="text-muted-foreground text-xs mt-1">
                        Routines completed
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* When pressed, takes user to Progress tab */}
                <Card
                  className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800 cursor-pointer"
                  onClick={() => setActiveTab("progress")}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-purple-600 dark:text-purple-400 text-sm font-medium">
                        Finished
                      </span>
                      <span className="text-3xl font-bold mt-1">
                        {productStats.finished}
                      </span>
                      <span className="text-muted-foreground text-xs mt-1">
                        {productStats.repurchase} would repurchase
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Products */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Recent Products</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary"
                    onClick={() => setActiveTab("products")}
                  >
                    View All
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-6">
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : recentProducts.length === 0 ? (
                      <div className="text-center py-8">
                        <h3 className="text-lg font-semibold mb-2">
                          No products yet
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Start by adding your first skincare product
                        </p>
                        <AddProductDialog
                          onProductAdded={() => {
                            setActiveTab("products");
                            productListRef.current?.loadProducts();
                          }}
                        />
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {recentProducts.map((product) => (
                          <div
                            key={product.id}
                            className={cn(
                              "flex items-center justify-between group relative",
                              "pb-6 last:pb-0 border-b last:border-0",
                              product.status === "finished" &&
                                !product.wouldRepurchase &&
                                "border-purple-200/50 dark:border-purple-800/30",
                              product.wouldRepurchase &&
                                "border-green-200/50 dark:border-green-800/30"
                            )}
                          >
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div
                                className={cn(
                                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                                  product.status !== "finished" &&
                                    !product.wouldRepurchase &&
                                    "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                                  product.status === "finished" &&
                                    !product.wouldRepurchase &&
                                    "bg-purple-500/10 text-purple-600 dark:text-purple-400",
                                  product.wouldRepurchase &&
                                    "bg-green-500/10 text-green-600 dark:text-green-400"
                                )}
                              >
                                {product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="h-full w-full rounded-full object-cover"
                                  />
                                ) : (
                                  getCategoryIcon(product.category)
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-base font-medium truncate">
                                    {product.name}
                                  </h4>
                                  {product.wouldRepurchase && (
                                    <Star className="h-4 w-4 text-green-500 shrink-0" />
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-sm text-muted-foreground truncate">
                                    {product.brand}
                                  </p>
                                  {product.category && (
                                    <>
                                      <span className="text-muted-foreground/40">
                                        •
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        {product.category}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            {product.status === "finished" && (
                              <div
                                className={cn(
                                  "ml-4 px-3 py-1 rounded-full text-xs font-medium shrink-0",
                                  product.wouldRepurchase
                                    ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                    : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                )}
                              >
                                {product.wouldRepurchase
                                  ? "Would Repurchase"
                                  : "Finished"}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Tips & Recommendations */}
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  Tips & Recommendations
                </h2>
                <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
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
                      <div>
                        <h3 className="text-lg font-medium mb-1">
                          Track Your Progress
                        </h3>
                        <p className="text-muted-foreground">
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
                              variant="link"
                              className="p-0 h-auto mt-2 text-primary font-medium"
                            >
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
              className="space-y-4"
            >
              {/* Header Section */}
              <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b pb-4">
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-background border p-6 group hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-grid-pattern opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex-1 space-y-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-sm font-medium mb-2">
                        <Package className="h-4 w-4" />
                        Product Management
                      </div>
                      <h2 className="text-2xl font-bold tracking-tight mb-2">
                        Your Products
                      </h2>
                      <p className="text-muted-foreground max-w-xl">
                        Keep track of your skincare products, mark favorites,
                        and manage your collection.
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden md:block">
                        <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                          <Package className="h-8 w-8 text-blue-600" />
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

                {/* Quick Stats */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Card className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">
                            Total Products
                          </span>
                          <span className="text-2xl font-bold">
                            {productStats.total}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Sparkles className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">
                            Active
                          </span>
                          <span className="text-2xl font-bold">
                            {productStats.active}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <CheckCircle className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">
                            Finished
                          </span>
                          <span className="text-2xl font-bold">
                            {productStats.finished}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Star className="h-5 w-5 text-amber-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">
                            Would Repurchase
                          </span>
                          <span className="text-2xl font-bold">
                            {productStats.repurchase}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Filter/Sort Options */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-none">
                  <Button
                    variant={productFilter === "all" ? "default" : "outline"}
                    size="sm"
                    className="whitespace-nowrap gap-2"
                    onClick={() => handleFilterChange("all")}
                  >
                    <Package className="h-4 w-4" />
                    All Products
                  </Button>
                  <Button
                    variant={productFilter === "active" ? "default" : "outline"}
                    size="sm"
                    className="whitespace-nowrap gap-2"
                    onClick={() => handleFilterChange("active")}
                  >
                    <Sparkles className="h-4 w-4" />
                    Active
                  </Button>
                  <Button
                    variant={
                      productFilter === "finished" ? "default" : "outline"
                    }
                    size="sm"
                    className="whitespace-nowrap gap-2"
                    onClick={() => handleFilterChange("finished")}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Finished
                  </Button>
                  <Button
                    variant={
                      productFilter === "repurchase" ? "default" : "outline"
                    }
                    size="sm"
                    className="whitespace-nowrap gap-2"
                    onClick={() => handleFilterChange("repurchase")}
                  >
                    <Star className="h-4 w-4" />
                    Would Repurchase
                  </Button>
                </div>
              </div>

              {/* Product List */}
              <div className="mt-2">
                <ProductList
                  ref={productListRef}
                  filter={productFilter}
                  onProductsChange={() => setActiveTab("products")}
                  onStatsChange={handleProductsChange}
                />
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="routines" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-background border p-6 group hover:shadow-lg transition-all duration-300">
                <div className="absolute inset-0 bg-grid-pattern opacity-10 group-hover:opacity-20 transition-opacity"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-sm font-medium mb-2">
                      <Clock className="h-4 w-4" />
                      Daily Routines
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight mb-2">
                      Your Routines
                    </h2>
                    <p className="text-muted-foreground max-w-xl">
                      Create and customize your morning and evening skincare
                      routines for optimal results.
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="h-16 w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                      <Clock className="h-8 w-8 text-purple-600" />
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
                      <Camera className="h-6 w-6" />
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
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500/10 via-green-500/5 to-background border group hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-grid-pattern opacity-10 group-hover:opacity-20 transition-opacity"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-sm font-medium mb-2">
                          <Camera className="h-4 w-4" />
                          Progress Photos
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">
                          Track Your Journey
                        </h2>
                        <p className="text-muted-foreground max-w-xl">
                          Document your skincare progress with photos. Compare
                          and see your transformation over time.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={startCamera}
                          className="group relative overflow-hidden gap-2"
                          size="lg"
                          disabled={isUploading}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <Camera className="h-4 w-4 relative z-10" />
                          <span className="relative z-10">Take Photo</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="group relative overflow-hidden gap-2"
                          size="lg"
                          disabled={isUploading}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Uploading photo...</span>
                </div>
              )}

              <ProgressGallery refreshTrigger={galleryRefreshTrigger} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add the CSS for the grid pattern */}
      <style>
        {`
          .bg-grid-pattern {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.1)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
          }
        `}
      </style>
    </div>
  );
}
