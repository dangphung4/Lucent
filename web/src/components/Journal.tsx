import { useState, useEffect } from "react";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  Loader2,
  Calendar as CalendarIcon,
  Clock,
  Star,
  FileText,
  TrendingUp,
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
  Package
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import {
  getUserProducts,
  getUserJournalEntries,
  type Product,
  type JournalEntry,
} from "@/lib/db";
import { Input } from "./ui/input";
import { AddJournalEntryDialog } from "./AddJournalEntryDialog";
import { UpdateUsageDialog } from "./UpdateUsageDialog";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { DiaryEntryDialog } from "./DiaryEntryDialog";
import { EditDiaryEntryDialog } from "./EditDiaryEntryDialog";
import { cn } from "@/lib/utils";

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

export function Journal() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("tracking");
  const [products, setProducts] = useState<Product[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Load products and journal entries
  const loadData = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const [fetchedProducts, fetchedEntries] = await Promise.all([
        getUserProducts(currentUser.uid),
        getUserJournalEntries(currentUser.uid),
      ]);
      setProducts(fetchedProducts);
      setJournalEntries(fetchedEntries);
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
                Progress Log
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Product Tracking Tab */}
          <TabsContent value="tracking" className="space-y-6">
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
          <TabsContent value="notes" className="space-y-4 mt-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <h3 className="text-lg font-medium">Your Journal Entries</h3>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <DiaryEntryDialog
                  productId={selectedProductId || undefined}
                  productName={
                    selectedProductId
                      ? products.find((p) => p.id === selectedProductId)?.name
                      : undefined
                  }
                  onEntryAdded={loadData}
                >
                  <Button className="w-full sm:w-auto">
                    <BookOpen className="h-4 w-4 mr-2" />
                    New Diary Entry
                  </Button>
                </DiaryEntryDialog>
              </div>
            </div>

            <div className="grid gap-4 mt-6">
              {filteredJournalEntries.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-lg border bg-muted/30 shadow-sm">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="font-medium text-foreground">
                    No journal entries yet
                  </p>
                  <p className="text-sm text-muted-foreground/80 mt-1">
                    Start by adding a diary entry or product review
                  </p>
                </div>
              ) : (
                filteredJournalEntries.map((entry) => {
                  const product = products.find(
                    (p) => p.id === entry.productId
                  );
                  const isSimpleDiaryEntry = isDiaryEntry(entry);

                  return (
                    <div key={entry.id}>
                      <div
                        className={`relative rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer group ${
                          isSimpleDiaryEntry
                            ? "bg-blue-50/30 dark:bg-blue-950/10"
                            : "bg-card"
                        }`}
                        onClick={() => handleEntryClick(entry)}
                      >
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </div>

                        {/* Header section with icon, title and date */}
                        <div className="flex items-center gap-3 p-3 border-b">
                          <Avatar
                            className={`h-10 w-10 shadow-sm ${
                              isSimpleDiaryEntry
                                ? "bg-blue-100 dark:bg-blue-900"
                                : "bg-background"
                            }`}
                          >
                            <div className="flex h-full w-full items-center justify-center rounded-full font-medium">
                              {isSimpleDiaryEntry ? (
                                <div className="bg-primary/10 text-primary">
                                  <BookOpen className="h-4 w-4" />
                                </div>
                              ) : product?.category &&
                                categoryIcons[product.category] ? (
                                categoryIcons[product.category]
                              ) : (
                                <div className="bg-primary/10 text-primary">
                                  <Beaker className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            {isSimpleDiaryEntry ? (
                              <h3 className="font-medium text-foreground">
                                {entry.title || "Diary Entry"}
                              </h3>
                            ) : (
                              <h3 className="font-medium text-foreground">
                                {product?.name || "Unknown Product"}
                              </h3>
                            )}
                          </div>

                          <Badge
                            variant="secondary"
                            className="shrink-0 bg-accent/50 text-accent-foreground shadow-sm text-xs"
                          >
                            {format(entry.date, "MMM d, yyyy")}
                          </Badge>
                        </div>

                        {/* Content section */}
                        <div className="p-3">
                          {!isSimpleDiaryEntry && (
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-xs text-muted-foreground">
                                {product?.brand}
                              </p>
                              {entry.rating > 0 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-background shadow-sm"
                                >
                                  <Star className="h-3 w-3 mr-1" />
                                  {entry.rating}/5
                                </Badge>
                              )}
                            </div>
                          )}

                          <div className="text-sm text-foreground/90">
                            <p className="line-clamp-3 whitespace-normal">
                              {entry.review}
                            </p>
                            {entry.review.length > 180 && (
                              <p className="text-xs text-primary mt-1 font-medium">
                                Read more
                              </p>
                            )}
                          </div>

                          {entry.effects && entry.effects.length > 0 && (
                            <div className="flex gap-1.5 mt-2 flex-wrap">
                              {entry.effects.map((effect, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs bg-background shadow-sm"
                                >
                                  {effect}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {entry.notes && (
                            <div className="mt-2 p-2 bg-muted/30 rounded-md">
                              <p className="text-xs text-muted-foreground">
                                {entry.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Progress Log Tab */}
          <TabsContent value="progress" className="space-y-4 mt-6">
            <div className="text-center py-12 px-4 rounded-lg border bg-muted/30 shadow-sm">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="font-medium text-foreground">
                Progress tracking coming soon
              </p>
              <p className="text-sm text-muted-foreground/80 mt-1">
                Track your skin's improvement with photos and notes
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Dialog */}
      {selectedEntry && (
        <EditDiaryEntryDialog
          entry={selectedEntry}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onEntryUpdated={loadData}
          onEntryDeleted={loadData}
        />
      )}
    </div>
  );
}
