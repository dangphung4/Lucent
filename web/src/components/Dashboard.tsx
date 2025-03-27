import { useAuth } from "../lib/AuthContext";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useNavigate } from "react-router-dom";
import { getUserProducts, getRoutineCompletions, Product } from "@/lib/db";
import {
  Droplets,
  Sun,
  Layers,
  Sparkles,
  Eye,
  Zap,
  PillBottle,
  CircleDashed,
  Pipette
} from "lucide-react";
import DashboardHeader from "./DashboardHeader";
import DashboardOverview, { ProductStats } from "./DashboardOverview";
import DashboardProducts from "./DashboardProducts";
import DashboardRoutines from "./DashboardRoutines";
import DashboardProgress from "./DashboardProgress";

/**
 * Dashboard component - Main dashboard view with tabs for overview, products, routines, and progress
 * This component has been refactored to use smaller, more focused components to improve performance
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
  const productListRef = useRef<{ loadProducts: () => Promise<void> } | null>(null);
  const navigate = useNavigate();

  // Get first name from email or use "there" as fallback
  const firstName = useMemo(() => {
    return currentUser?.displayName || "there";
  }, [currentUser?.displayName]);

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
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  // Navigate to settings page
  const handleEditProfile = useCallback(() => {
    navigate("/settings?tab=account");
  }, [navigate]);

  const handleProductsChange = useCallback((stats: ProductStats) => {
    setProductStats(stats);
  }, []);

  const handleFilterChange = useCallback((filter: "all" | "active" | "finished" | "repurchase" | undefined) => {
    setProductFilter(filter);
  }, []);

  // Handle routines change
  const handleRoutinesChange = useCallback(() => {
    setActiveTab("routines");
  }, []);

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
        return <Droplets className="h-6 w-6 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-8">
      {/* Dashboard Header Component */}
      <DashboardHeader 
        greeting={greeting}
        firstName={firstName}
        currentUser={currentUser}
        onEditProfile={handleEditProfile}
      />

      <div className="container mx-auto px-4 max-w-7xl -mt-10 md:-mt-18 relative z-10">
        {/* Dashboard Tabs */}
        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="bg-card rounded-xl shadow-lg border p-1 mb-4 md:mb-8">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger
                value="overview"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-base"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="products"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-base"
              >
                Products
              </TabsTrigger>
              <TabsTrigger
                value="routines"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-base"
              >
                Routines
              </TabsTrigger>
              <TabsTrigger
                value="progress"
                className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-base"
              >
                Progress
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-0">
            <DashboardOverview
              productStats={productStats}
              streak={streak}
              completedRoutines={completedRoutines}
              recentProducts={recentProducts}
              onTabChange={handleTabChange}
              productListRef={productListRef}
              getCategoryIcon={getCategoryIcon}
            />
          </TabsContent>

          <TabsContent value="products" className="mt-0">
            <DashboardProducts
              productStats={productStats}
              productFilter={productFilter}
              onFilterChange={handleFilterChange}
              onProductsChange={handleProductsChange}
              productListRef={productListRef}
            />
          </TabsContent>

          <TabsContent value="routines" className="mt-0">
            <DashboardRoutines onRoutinesChange={handleRoutinesChange} />
          </TabsContent>

          <TabsContent value="progress" className="mt-0">
            <DashboardProgress currentUserId={currentUser?.uid} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add the CSS for the grid pattern */}
      <style>
        {`
          .bg-grid-pattern {
            background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.2)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e");
          }
          
          .bg-noise-pattern {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          }
          
          .shadow-glow {
            box-shadow: 0 0 15px 0 rgba(var(--primary), 0.3);
          }
          
          @keyframes gradient-xy {
            0% { background-position: 0% 0%; }
            50% { background-position: 100% 100%; }
            100% { background-position: 0% 0%; }
          }
          
          .animate-gradient-xy {
            background-size: 300% 300%;
            animation: gradient-xy 15s ease infinite;
          }
          
          @keyframes slide {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          .animate-slide {
            animation: slide 8s linear infinite;
          }
          
          @keyframes slide-diagonal {
            0% { transform: translateX(-100%) translateY(-30%) rotate(30deg); }
            100% { transform: translateX(100%) translateY(30%) rotate(30deg); }
          }
          
          .animate-slide-diagonal {
            animation: slide-diagonal 15s linear infinite;
          }
          
          .sparkle-pink, .sparkle-blue, .sparkle-gold, .sparkle-white {
            position: absolute;
            border-radius: 50%;
            opacity: 0;
          }
          
          .sparkle-pink {
            width: 3px;
            height: 3px;
            background-color: #ec4899;
            box-shadow: 0 0 4px 1px rgba(236, 72, 153, 0.7);
            animation: sparkle 5s ease-in-out infinite;
          }
          
          .sparkle-blue {
            width: 4px;
            height: 4px;
            background-color: #3b82f6;
            box-shadow: 0 0 4px 1px rgba(59, 130, 246, 0.7);
            animation: sparkle 6s ease-in-out infinite;
          }
          
          .sparkle-gold {
            width: 3px;
            height: 3px;
            background-color: #f59e0b;
            box-shadow: 0 0 4px 1px rgba(245, 158, 11, 0.7);
            animation: sparkle 7s ease-in-out infinite;
          }
          
          .sparkle-white {
            width: 5px;
            height: 5px;
            background-color: white;
            box-shadow: 0 0 5px 2px rgba(255, 255, 255, 0.7);
            animation: sparkle 6s ease-in-out infinite;
          }
          
          @keyframes sparkle {
            0% { opacity: 0; transform: scale(0) rotate(0deg); }
            50% { opacity: 0.7; transform: scale(1) rotate(180deg); }
            100% { opacity: 0; transform: scale(0) rotate(360deg); }
          }
          
          .animate-pulse-slow {
            animation: pulse 6s ease-in-out infinite;
          }
          
          .animate-pulse-slow-delay {
            animation: pulse 6s ease-in-out 3s infinite;
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 0.1; }
            50% { opacity: 0.3; }
          }
          
          .animate-wave-slow {
            animation: wave 15s ease-in-out infinite alternate;
          }
          
          @keyframes wave {
            0% { transform: translateX(-20px); }
            100% { transform: translateX(20px); }
          }
        `}
      </style>
    </div>
  );
}
