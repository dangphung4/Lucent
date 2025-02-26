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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});

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
          <TabsContent value="notes" className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-500 to-violet-600 dark:from-blue-600 dark:to-violet-700">
              <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
              <div className="relative p-8 sm:p-10 md:p-12 text-white">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Your Skincare Story</h2>
                <p className="text-white/80 text-lg max-w-xl mb-8">Document your journey, track your progress, and discover what works best for your skin.</p>
                <DiaryEntryDialog onEntryAdded={loadData}>
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-300">
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

                          {/* Edit indicator */}
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="p-2 rounded-full bg-background/80 backdrop-blur-sm shadow-sm">
                              <Pencil className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
