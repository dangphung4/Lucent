import { useState, useEffect } from 'react';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Loader2, Calendar as CalendarIcon, Clock, Star, FileText, TrendingUp, Search, Beaker, Plus, BookOpen, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { getUserProducts, getUserJournalEntries, type Product, type JournalEntry } from '@/lib/db';
import { Input } from './ui/input';
import { AddJournalEntryDialog } from './AddJournalEntryDialog';
import { UpdateUsageDialog } from './UpdateUsageDialog';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { DiaryEntryDialog } from './DiaryEntryDialog';
import { EditDiaryEntryDialog } from './EditDiaryEntryDialog';

// Add category icons mapping
const categoryIcons: Record<string, React.ReactNode> = {
  'Moisturizer': <div className="bg-blue-500/10 text-blue-500">M</div>,
  'Cleanser': <div className="bg-green-500/10 text-green-500">C</div>,
  'Serum': <div className="bg-purple-500/10 text-purple-500">S</div>,
  'Sunscreen': <div className="bg-amber-500/10 text-amber-500">SP</div>,
  'Toner': <div className="bg-pink-500/10 text-pink-500">T</div>,
  'Treatment': <div className="bg-red-500/10 text-red-500">Rx</div>,
  'Mask': <div className="bg-indigo-500/10 text-indigo-500">M</div>,
  'Oil': <div className="bg-orange-500/10 text-orange-500">O</div>,
};

// Format duration helper
const formatDuration = (days: number) => {
  if (days < 1) return 'Less than a day';
  if (days === 1) return '1 day';
  if (days < 30) return `${days} days`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month' : `${months} months`;
};

export function Journal() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('tracking');
  const [products, setProducts] = useState<Product[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Load products and journal entries
  const loadData = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    try {
      const [fetchedProducts, fetchedEntries] = await Promise.all([
        getUserProducts(currentUser.uid),
        getUserJournalEntries(currentUser.uid)
      ]);
      setProducts(fetchedProducts);
      setJournalEntries(fetchedEntries);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  // Filter products based on search
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Check if an entry is a diary entry (without specific product details)
  const isDiaryEntry = (entry: JournalEntry) => {
    return entry.type === 'diary' || entry.productId === 'diary-entry';
  };

  // Filter journal entries
  const filteredJournalEntries = journalEntries
    .filter(entry => {
      // For the Journal Notes tab, only show diary entries
      if (activeTab === 'notes') {
        return isDiaryEntry(entry) && (!selectedProductId || entry.productId === selectedProductId);
      }
      // For other tabs, show all entries that match the selected product
      return !selectedProductId || entry.productId === selectedProductId;
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  // Product Card component to reuse across tabs
  const ProductCard = ({ product, onUpdate }: { product: Product, onUpdate: () => void }) => {
    const latestEntry = journalEntries
      .filter(entry => entry.productId === product.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

    // Determine card color based on product category
    const getCategoryColor = () => {
      if (!product.category) return 'bg-card dark:bg-card';
      
      switch(product.category) {
        case 'Moisturizer': return 'bg-blue-50/50 dark:bg-blue-950/30';
        case 'Cleanser': return 'bg-green-50/50 dark:bg-green-950/30';
        case 'Serum': return 'bg-purple-50/50 dark:bg-purple-950/30';
        case 'Sunscreen': return 'bg-amber-50/50 dark:bg-amber-950/30';
        case 'Toner': return 'bg-pink-50/50 dark:bg-pink-950/30';
        case 'Treatment': return 'bg-red-50/50 dark:bg-red-950/30';
        case 'Mask': return 'bg-indigo-50/50 dark:bg-indigo-950/30';
        case 'Oil': return 'bg-orange-50/50 dark:bg-orange-950/30';
        default: return 'bg-card dark:bg-card';
      }
    };

    return (
      <div className={`relative rounded-lg border shadow-sm hover:shadow-md transition-all ${getCategoryColor()}`}>
        {/* Header section with icon, title and actions */}
        <div className="flex items-center gap-3 p-3 border-b">
          <Avatar className="h-10 w-10 shadow-sm bg-background">
            <div className="flex h-full w-full items-center justify-center rounded-full font-medium">
              {product.category && categoryIcons[product.category] || (
                <div className="bg-primary/10 text-primary">
                  <Beaker className="h-4 w-4" />
                </div>
              )}
            </div>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground">{product.name}</h3>
            <p className="text-xs text-muted-foreground">{product.brand}</p>
          </div>
        </div>
        
        {/* Content section */}
        <div className="p-3">
          <div className="flex flex-wrap gap-2 mb-3">
            {product.usageDuration > 0 && (
              <Badge variant="outline" className="text-xs bg-background shadow-sm">
                <Clock className="h-3 w-3 mr-1" />
                Using for {formatDuration(product.usageDuration)}
              </Badge>
            )}
            {latestEntry && (
              <>
                <Badge variant="outline" className="text-xs bg-background shadow-sm">
                  <Star className="h-3 w-3 mr-1" />
                  {latestEntry.rating}/5
                </Badge>
                <Badge variant="outline" className="text-xs bg-background shadow-sm">
                  <CalendarIcon className="h-3 w-3 mr-1" />
                  Last reviewed {formatDuration(
                    Math.floor(
                      (new Date().getTime() - latestEntry.date.getTime()) / (1000 * 60 * 60 * 24)
                    )
                  )} ago
                </Badge>
              </>
            )}
          </div>
          
          {latestEntry && (
            <div className="mb-3">
              <p className="text-sm text-foreground/90 line-clamp-2">{latestEntry.review}</p>
              {latestEntry.effects.length > 0 && (
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {latestEntry.effects.map((effect: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs bg-background shadow-sm">
                      {effect}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t">
            <UpdateUsageDialog
              productId={product.id}
              productName={product.name}
              onUsageUpdated={onUpdate}
            >
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                <Clock className="h-3.5 w-3.5 mr-1" />
                Update Usage
              </Button>
            </UpdateUsageDialog>
            <AddJournalEntryDialog
              productId={product.id}
              productName={product.name}
              onEntryAdded={onUpdate}
            >
              <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">
                <FileText className="h-3.5 w-3.5 mr-1" />
                Add Review
              </Button>
            </AddJournalEntryDialog>
          </div>
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
    <div className="container max-w-3xl mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Skincare Journal</h1>
            <p className="text-base text-muted-foreground/80">
              Track your skincare journey and product experiences
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background shadow-sm focus-visible:ring-primary/30"
            />
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
          <TabsContent value="tracking" className="space-y-4 mt-6">
            <div className="grid gap-4">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-lg border bg-muted/30 shadow-sm">
                  <Beaker className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="font-medium text-foreground">No products found</p>
                  <p className="text-sm text-muted-foreground/80 mt-1">Try adjusting your search or add some products</p>
                </div>
              ) : (
                filteredProducts.map(product => (
                  <div key={product.id}>
                    <ProductCard product={product} onUpdate={loadData} />
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Journal Notes Tab */}
          <TabsContent value="notes" className="space-y-4 mt-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <DiaryEntryDialog 
                  productId={selectedProductId || undefined}
                  productName={selectedProductId ? products.find(p => p.id === selectedProductId)?.name : undefined}
                  onEntryAdded={loadData}
                >
                  <Button className="w-full sm:w-auto">
                    <BookOpen className="h-4 w-4 mr-2" />
                    New Diary Entry
                  </Button>
                </DiaryEntryDialog>
                <h3 className="text-lg font-medium">Your Journal Entries</h3>
                
                {selectedProductId && (
                  <AddJournalEntryDialog
                    productId={selectedProductId}
                    productName={products.find(p => p.id === selectedProductId)?.name || ""}
                    onEntryAdded={loadData}
                  >
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Product Review
                    </Button>
                  </AddJournalEntryDialog>
                )}
              </div>
            </div>
            
            <div className="grid gap-4 mt-6">
              {filteredJournalEntries.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-lg border bg-muted/30 shadow-sm">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="font-medium text-foreground">No journal entries yet</p>
                  <p className="text-sm text-muted-foreground/80 mt-1">Start by adding a diary entry or product review</p>
                </div>
              ) : (
                filteredJournalEntries.map(entry => {
                  const product = products.find(p => p.id === entry.productId);
                  const isSimpleDiaryEntry = isDiaryEntry(entry);
                  
                  return (
                    <div key={entry.id}>
                      <div 
                        className={`relative rounded-lg border shadow-sm hover:shadow-md transition-all cursor-pointer group ${isSimpleDiaryEntry ? 'bg-blue-50/30 dark:bg-blue-950/10' : 'bg-card'}`}
                        onClick={() => handleEntryClick(entry)}
                      >
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </div>
                        
                        {/* Header section with icon, title and date */}
                        <div className="flex items-center gap-3 p-3 border-b">
                          <Avatar className={`h-10 w-10 shadow-sm ${isSimpleDiaryEntry ? 'bg-blue-100 dark:bg-blue-900' : 'bg-background'}`}>
                            <div className="flex h-full w-full items-center justify-center rounded-full font-medium">
                              {isSimpleDiaryEntry ? (
                                <div className="bg-primary/10 text-primary">
                                  <BookOpen className="h-4 w-4" />
                                </div>
                              ) : product?.category && categoryIcons[product.category] ? (
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
                              <h3 className="font-medium text-foreground">{entry.title || 'Diary Entry'}</h3>
                            ) : (
                              <h3 className="font-medium text-foreground">{product?.name || 'Unknown Product'}</h3>
                            )}
                          </div>
                          
                          <Badge variant="secondary" className="shrink-0 bg-accent/50 text-accent-foreground shadow-sm text-xs">
                            {format(entry.date, 'MMM d, yyyy')}
                          </Badge>
                        </div>
                        
                        {/* Content section */}
                        <div className="p-3">
                          {!isSimpleDiaryEntry && (
                            <div className="flex items-center gap-2 mb-2">
                              <p className="text-xs text-muted-foreground">{product?.brand}</p>
                              {entry.rating > 0 && (
                                <Badge variant="outline" className="text-xs bg-background shadow-sm">
                                  <Star className="h-3 w-3 mr-1" />
                                  {entry.rating}/5
                                </Badge>
                              )}
                            </div>
                          )}
                          
                          <div className="text-sm text-foreground/90">
                            <p className="line-clamp-3 whitespace-normal">{entry.review}</p>
                            {entry.review.length > 180 && (
                              <p className="text-xs text-primary mt-1 font-medium">Read more</p>
                            )}
                          </div>
                          
                          {entry.effects.length > 0 && (
                            <div className="flex gap-1.5 mt-2 flex-wrap">
                              {entry.effects.map((effect, index) => (
                                <Badge key={index} variant="outline" className="text-xs bg-background shadow-sm">
                                  {effect}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {entry.notes && (
                            <div className="mt-2 p-2 bg-muted/30 rounded-md">
                              <p className="text-xs text-muted-foreground">{entry.notes}</p>
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
              <p className="font-medium text-foreground">Progress tracking coming soon</p>
              <p className="text-sm text-muted-foreground/80 mt-1">Track your skin's improvement with photos and notes</p>
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