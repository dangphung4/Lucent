import React from 'react';
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";
import { ProductList } from "./ProductList";
import { AddProductDialog } from "./AddProductDialog";
import { ProductStats } from './DashboardOverview';

interface DashboardProductsProps {
  productStats: ProductStats;
  productFilter: "all" | "active" | "finished" | "repurchase" | undefined;
  onFilterChange: (filter: "all" | "active" | "finished" | "repurchase" | undefined) => void;
  onProductsChange: (stats: ProductStats) => void;
  productListRef: React.RefObject<{ loadProducts: () => Promise<void> } | null>;
}

/**
 * DashboardProducts component - Displays the products tab content
 * 
 * This component has been extracted from the main Dashboard component
 * to improve performance by reducing re-renders.
 */
const DashboardProducts = React.memo(({
  productStats,
  productFilter,
  onFilterChange,
  onProductsChange,
  productListRef
}: DashboardProductsProps) => {
  return (
    <div className="space-y-6">
      {/* Header Section - Simplified for better performance */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-600/60 via-blue-500/50 to-blue-400/40 dark:from-blue-500/20 dark:via-blue-500/15 dark:to-background border border-blue-500/40 dark:border-blue-500/30 p-6">
        <div className="absolute inset-0 bg-grid-pattern opacity-15"></div>
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 text-blue-900 dark:text-blue-400 text-sm font-medium mb-2 shadow-md backdrop-blur-sm border border-blue-500/40">
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
              <div className="h-16 w-16 rounded-2xl bg-blue-500/40 flex items-center justify-center shadow-glow">
                <Package className="h-8 w-8 text-blue-950 dark:text-blue-400" />
              </div>
            </div>
            <AddProductDialog
              onProductAdded={() => {
                if (productListRef.current) {
                  productListRef.current.loadProducts();
                }
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Quick Stats - Simplified for better performance */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className={cn(
          "border",
          productFilter === "all" || productFilter === undefined ? "bg-blue-100 dark:bg-blue-900/30" : ""
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
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

        <Card className={cn(
          "border",
          productFilter === "active" ? "bg-green-100 dark:bg-green-900/30" : ""
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
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

        <Card className={cn(
          "border",
          productFilter === "finished" ? "bg-purple-100 dark:bg-purple-900/30" : ""
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
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

        <Card className={cn(
          "border",
          productFilter === "repurchase" ? "bg-amber-100 dark:bg-amber-900/30" : ""
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
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

      {/* Filter/Sort Options - Simplified for better performance */}
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
          onClick={() => onFilterChange(undefined)}
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
          onClick={() => onFilterChange("active")}
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
          onClick={() => onFilterChange("finished")}
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
          onClick={() => onFilterChange("repurchase")}
        >
          <Package className="h-4 w-4" />
          Would Repurchase
        </Button>
      </div>

      {/* Product List */}
      <ProductList
        ref={productListRef}
        filter={productFilter}
        onProductsChange={() => {}}
        onStatsChange={onProductsChange}
      />
    </div>
  );
});

DashboardProducts.displayName = 'DashboardProducts';

export default DashboardProducts; 