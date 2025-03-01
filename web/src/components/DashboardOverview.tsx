import React, { memo } from 'react';
import { 
  Package, 
  CheckCircle,
  Clock,
  Star,
  ThumbsUp,
  Check,
  Plus,
  ArrowRight
} from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { AddProductDialog } from "./AddProductDialog";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/db";
import { Badge } from "./ui/badge";

export interface ProductStats {
  total: number;
  active: number;
  finished: number;
  repurchase: number;
}

interface DashboardOverviewProps {
  productStats: ProductStats;
  streak: number;
  completedRoutines: number;
  recentProducts: Product[];
  onTabChange: (value: string) => void;
  productListRef: React.RefObject<{ loadProducts: () => Promise<void> } | null>;
  getCategoryIcon: (category: string | null) => React.ReactNode;
}

/**
 * Dashboard Overview component - displays quick stats and recent products
 */
const DashboardOverview = memo(({
  productStats,
  streak,
  completedRoutines,
  recentProducts,
  onTabChange,
  productListRef,
  getCategoryIcon
}: DashboardOverviewProps) => {

  return (
    <div className="space-y-8">
      {/* Overview Card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/40 via-primary/30 to-background border border-primary/40 dark:border-primary/30 p-6">
        <div className="absolute inset-0 bg-grid-pattern opacity-15"></div>
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/30 text-primary dark:text-primary text-sm font-medium mb-2 shadow-md backdrop-blur-sm border border-primary/40">
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
            <div className="h-16 w-16 rounded-2xl bg-primary/40 flex items-center justify-center shadow-glow">
              <Package className="h-8 w-8 text-primary-foreground dark:text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border cursor-pointer" onClick={() => onTabChange("products")}>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-blue-700 dark:text-blue-400 text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Products
              </span>
              <span className="text-3xl font-bold mt-1 text-blue-800 dark:text-blue-300">
                {productStats.total}
              </span>
              <span className="text-blue-700/80 dark:text-blue-400/70 text-xs mt-1">
                {productStats.active} active
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border cursor-pointer" onClick={() => window.location.href = "/calendar"}>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-green-700 dark:text-green-400 text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Streak
              </span>
              <span className="text-3xl font-bold mt-1 text-green-800 dark:text-green-300">
                {streak}
              </span>
              <span className="text-green-700/80 dark:text-green-400/70 text-xs mt-1">
                Days in a row
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border cursor-pointer" onClick={() => onTabChange("routines")}>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-amber-700 dark:text-amber-400 text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Progress
              </span>
              <span className="text-3xl font-bold mt-1 text-amber-800 dark:text-amber-300">
                {completedRoutines}
              </span>
              <span className="text-amber-700/80 dark:text-amber-400/70 text-xs mt-1">
                Routines completed
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border cursor-pointer" onClick={() => onTabChange("progress")}>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <span className="text-purple-700 dark:text-purple-400 text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4" />
                Finished
              </span>
              <span className="text-3xl font-bold mt-1 text-purple-800 dark:text-purple-300">
                {productStats.finished}
              </span>
              <span className="text-purple-700/80 dark:text-purple-400/70 text-xs mt-1">
                {productStats.repurchase} would repurchase
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-xl bg-blue-100 dark:bg-blue-900/30 border p-6">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-500/40 flex items-center justify-center">
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
              className="gap-1 text-blue-900 dark:text-blue-400"
              onClick={() => onTabChange("products")}
            >
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {recentProducts.length === 0 ? (
          <div className="relative overflow-hidden rounded-xl bg-blue-50 dark:bg-blue-900/10 border p-6 flex flex-col items-center justify-center min-h-[200px]">
            <Package className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground text-center mb-4">No products added yet</p>
            <AddProductDialog
              onProductAdded={() => {
                onTabChange("products");
                if (productListRef.current) {
                  productListRef.current.loadProducts();
                }
              }}
            >
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                <span>Add Your First Product</span>
              </Button>
            </AddProductDialog>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-xl bg-blue-50 dark:bg-blue-900/10 border p-6">
            <div className="space-y-4">
              {recentProducts.map((product) => (
                <div
                  key={product.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg hover:bg-blue-500/10",
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
                        <Badge variant="outline" className="bg-green-500/15 text-green-700 dark:text-green-400 border-green-300 dark:border-green-800">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          Repurchase
                        </Badge>
                      )}
                      {product.status === "finished" && !product.wouldRepurchase && (
                        <Badge variant="outline" className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800">
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
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tips & Recommendations */}
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
                      onTabChange("products");
                      if (productListRef.current) {
                        productListRef.current.loadProducts();
                      }
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
    </div>
  );
});

DashboardOverview.displayName = 'DashboardOverview';

export default DashboardOverview; 