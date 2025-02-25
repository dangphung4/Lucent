import { useState, useEffect } from 'react';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Loader2, Calendar as CalendarIcon, Clock, Star, FileText, TrendingUp, Search, Beaker } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/AuthContext';
import { getUserProducts, getUserJournalEntries, type Product, type JournalEntry } from '@/lib/db';
import { Input } from './ui/input';
import { AddJournalEntryDialog } from './AddJournalEntryDialog';
import { UpdateUsageDialog } from './UpdateUsageDialog';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

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

  // Product Card component to reuse across tabs
  const ProductCard = ({ product, onUpdate }: { product: Product, onUpdate: () => void }) => {
    const latestEntry = journalEntries
      .filter(entry => entry.productId === product.id)
      .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

    return (
      <div className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors">
        <Avatar className="h-12 w-12">
          <div className="flex h-full w-full items-center justify-center rounded-full font-medium">
            {product.category && categoryIcons[product.category] || (
              <div className="bg-primary/10 text-primary">
                <Beaker className="h-5 w-5" />
              </div>
            )}
          </div>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{product.name}</h3>
            <div className="flex items-center gap-2">
              <UpdateUsageDialog
                productId={product.id}
                productName={product.name}
                onUsageUpdated={onUpdate}
              />
              <AddJournalEntryDialog
                productId={product.id}
                productName={product.name}
                onEntryAdded={onUpdate}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{product.brand}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            {product.usageDuration > 0 && (
              <Badge variant="secondary">
                <Clock className="h-3 w-3 mr-1" />
                Using for {formatDuration(product.usageDuration)}
              </Badge>
            )}
            {latestEntry && (
              <>
                <Badge variant="secondary">
                  <Star className="h-3 w-3 mr-1" />
                  {latestEntry.rating}/5
                </Badge>
                <Badge variant="secondary">
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
            <div className="mt-2">
              <p className="text-sm text-muted-foreground line-clamp-2">{latestEntry.review}</p>
              {latestEntry.effects.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">
                  {latestEntry.effects.map((effect: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {effect}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Skincare Journal</h1>
            <p className="text-muted-foreground">
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
              className="pl-9"
            />
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-card w-full justify-start overflow-auto scrollbar-none">
            <TabsTrigger value="tracking" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Product Tracking
            </TabsTrigger>
            <TabsTrigger value="notes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Journal Notes
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Progress Log
            </TabsTrigger>
          </TabsList>

          {/* Product Tracking Tab */}
          <TabsContent value="tracking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Tracking</CardTitle>
                <CardDescription>
                  Track your product usage, reviews, and experiences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onUpdate={loadData} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Journal Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Journal Notes</CardTitle>
                <CardDescription>
                  Track your daily skincare experiences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {journalEntries.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No journal entries yet</p>
                      <p className="text-sm">Start by adding a review to any product</p>
                    </div>
                  ) : (
                    journalEntries
                      .sort((a, b) => b.date.getTime() - a.date.getTime())
                      .map(entry => {
                        const product = products.find(p => p.id === entry.productId);
                        return (
                          <div
                            key={entry.id}
                            className="flex items-start gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                          >
                            <Avatar className="h-12 w-12">
                              <div className="flex h-full w-full items-center justify-center rounded-full font-medium">
                                {product?.category && categoryIcons[product.category] || (
                                  <div className="bg-primary/10 text-primary">
                                    <Beaker className="h-5 w-5" />
                                  </div>
                                )}
                              </div>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">{product?.name || 'Unknown Product'}</h3>
                                <Badge variant="secondary">
                                  {format(entry.date, 'MMM d, yyyy')}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{product?.brand}</p>
                              <div className="mt-2">
                                <p className="text-sm">{entry.review}</p>
                                {entry.effects.length > 0 && (
                                  <div className="flex gap-1 mt-2 flex-wrap">
                                    {entry.effects.map((effect, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {effect}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Log Tab */}
          <TabsContent value="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Progress Log</CardTitle>
                <CardDescription>
                  Track your skin progress over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Progress tracking coming soon</p>
                  <p className="text-sm">Track your skin's improvement with photos and notes</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 