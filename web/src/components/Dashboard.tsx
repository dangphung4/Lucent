import { useAuth } from '../lib/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarImage } from './ui/avatar';
import { useNavigate } from 'react-router-dom';
import { AddProductDialog } from './AddProductDialog';
import { getUserProducts, getRoutineCompletions, Product } from '@/lib/db';
import { Loader2 } from 'lucide-react';
import { ProductList } from './ProductList';
import { RoutineList } from './RoutineList';
import { cn } from '@/lib/utils';
import { Star, Droplets, FlaskConical, CircleDot, Sun, Layers, Sparkles, Eye, Zap, Package } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('overview');
  const [greeting, setGreeting] = useState('Hello');
  const [productFilter, setProductFilter] = useState<'all' | 'active' | 'finished' | 'repurchase'>('all');
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
  
  // Get first name from email or use "there" as fallback
  const firstName = currentUser?.displayName || 'there';
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  
  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
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
     * - Loads routine completions for calculating streaks and progress.
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
          active: fetchedProducts.filter(p => p.status === 'active').length,
          finished: fetchedProducts.filter(p => p.status === 'finished').length,
          repurchase: fetchedProducts.filter(p => p.status === 'finished' && p.wouldRepurchase).length,
        };
        setProductStats(stats);

        // Load routine completions for streak and progress calculation
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
        
        const completions = await getRoutineCompletions(currentUser.uid, oneMonthAgo, today);
        
        // Calculate streak (consecutive days with at least one completed routine)
        let currentStreak = 0;
        const dateMap = new Map<string, boolean>();
        
        // Group completions by date
        completions.forEach(completion => {
          const dateStr = completion.date.toDateString();
          const hasCompletedSteps = completion.completedSteps.some(step => step.completed);
          
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
        const completedRoutinesCount = completions.filter(completion => {
          const totalSteps = completion.completedSteps.length;
          const completedSteps = completion.completedSteps.filter(step => step.completed).length;
          return totalSteps > 0 && completedSteps === totalSteps;
        }).length;
        
        setCompletedRoutines(completedRoutinesCount);

        // Get 5 most recent products
        const sorted = [...fetchedProducts].sort((a, b) => {
          const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
          const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
        
        setRecentProducts(sorted.slice(0, 5));
      } catch (error) {
        console.error('Error loading data:', error);
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
    navigate('/settings?tab=account');
  };

  const handleProductsChange = (stats: ProductStats) => {
    setProductStats(stats);
  };

  const handleFilterChange = (filter: typeof productFilter) => {
    setProductFilter(filter);
  };

  const getCategoryIcon = (category: string | null | undefined) => {
    switch (category?.toLowerCase()) {
      case 'cleanser':
        return <Droplets className="h-5 w-5" />;
      case 'toner':
        return <FlaskConical className="h-5 w-5" />;
      case 'serum':
        return <FlaskConical className="h-5 w-5" />;
      case 'moisturizer':
        return <CircleDot className="h-5 w-5" />;
      case 'sunscreen':
        return <Sun className="h-5 w-5" />;
      case 'mask':
        return <Layers className="h-5 w-5" />;
      case 'exfoliant':
        return <Sparkles className="h-5 w-5" />;
      case 'eye cream':
        return <Eye className="h-5 w-5" />;
      case 'treatment':
        return <Zap className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-8">
      {/* Welcome Section with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/80 via-primary to-primary/90 pt-8 pb-12 md:pt-12 md:pb-16">
        <div className="absolute inset-0 bg-grid-pattern [mask-image:linear-gradient(0deg,rgba(255,255,255,0.5),rgba(255,255,255,0.1))]"></div>
        
        <div className="container max-w-7xl mx-auto px-4">
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                {greeting}, {displayName}!
              </h1>
              <p className="text-primary-foreground/90 max-w-xl">
                Track your skincare routine, monitor progress, and discover what works best for your skin.
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <Button 
                variant="secondary" 
                size="sm" 
                className="rounded-full text-sm font-medium"
                onClick={handleEditProfile}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="absolute bottom-0 w-full h-full">
            <path fill="hsl(var(--background))" fillOpacity="1" d="M0,128L48,144C96,160,192,192,288,186.7C384,181,480,139,576,138.7C672,139,768,181,864,181.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>
      
      <div className="container max-w-7xl mx-auto px-4 -mt-6 md:-mt-10 relative z-10">
        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="bg-card rounded-xl shadow-lg border p-1 mb-8">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Overview
              </TabsTrigger>
              <TabsTrigger value="products" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Products
              </TabsTrigger>
              <TabsTrigger value="routines" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Routines
              </TabsTrigger>
              <TabsTrigger value="progress" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Progress
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="overview" className="mt-0">
            {/* Overview Tab Content */}
            <div className="space-y-8">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">Products</span>
                      <span className="text-3xl font-bold mt-1">{productStats.total}</span>
                      <span className="text-muted-foreground text-xs mt-1">
                        {productStats.active} active
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200 dark:border-purple-800">
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-purple-600 dark:text-purple-400 text-sm font-medium">Finished</span>
                      <span className="text-3xl font-bold mt-1">{productStats.finished}</span>
                      <span className="text-muted-foreground text-xs mt-1">
                        {productStats.repurchase} would repurchase
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-green-600 dark:text-green-400 text-sm font-medium">Streak</span>
                      <span className="text-3xl font-bold mt-1">{streak}</span>
                      <span className="text-muted-foreground text-xs mt-1">Days in a row</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20 border-amber-200 dark:border-amber-800">
                  <CardContent className="p-6">
                    <div className="flex flex-col">
                      <span className="text-amber-600 dark:text-amber-400 text-sm font-medium">Progress</span>
                      <span className="text-3xl font-bold mt-1">{completedRoutines}</span>
                      <span className="text-muted-foreground text-xs mt-1">Routines completed</span>
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
                    onClick={() => setActiveTab('products')}
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
                        <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                        <p className="text-muted-foreground mb-4">
                          Start by adding your first skincare product
                        </p>
                        <AddProductDialog 
                          onProductAdded={() => {
                            setActiveTab('products');
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
                              product.status === 'finished' && !product.wouldRepurchase && "border-purple-200/50 dark:border-purple-800/30",
                              product.wouldRepurchase && "border-green-200/50 dark:border-green-800/30"
                            )}
                          >
                            <div className="flex items-start gap-4 flex-1 min-w-0">
                              <div className={cn(
                                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                                product.status !== 'finished' && !product.wouldRepurchase && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                                product.status === 'finished' && !product.wouldRepurchase && "bg-purple-500/10 text-purple-600 dark:text-purple-400",
                                product.wouldRepurchase && "bg-green-500/10 text-green-600 dark:text-green-400"
                              )}>
                                {product.imageUrl ? (
                                  <img src={product.imageUrl} alt={product.name} className="h-full w-full rounded-full object-cover" />
                                ) : (
                                  getCategoryIcon(product.category)
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-base font-medium truncate">{product.name}</h4>
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
                                      <span className="text-muted-foreground/40">•</span>
                                      <span className="text-sm text-muted-foreground">{product.category}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            {product.status === 'finished' && (
                              <div className={cn(
                                "ml-4 px-3 py-1 rounded-full text-xs font-medium shrink-0",
                                product.wouldRepurchase 
                                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                  : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                              )}>
                                {product.wouldRepurchase ? 'Would Repurchase' : 'Finished'}
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
                <h2 className="text-xl font-semibold mb-4">Tips & Recommendations</h2>
                <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 8v4"></path>
                          <path d="M12 16h.01"></path>
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-1">Track Your Progress</h3>
                        <p className="text-muted-foreground">
                          {productStats.total === 0 ? (
                            "Start by adding your skincare products to track their effectiveness and build your perfect routine."
                          ) : (
                            `You have ${productStats.active} active products. Keep track of how they work for your skin and mark them as finished when done.`
                          )}
                        </p>
                        {productStats.total === 0 && (
                          <AddProductDialog 
                            onProductAdded={() => {
                              setActiveTab('products');
                              productListRef.current?.loadProducts();
                            }}
                          >
                            <Button variant="link" className="p-0 h-auto mt-2 text-primary font-medium">
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
          </TabsContent>
          
          <TabsContent value="products" className="mt-0">
            <div className="space-y-4">
              {/* Header Section */}
              <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b pb-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Products</h2>
                    <p className="text-muted-foreground text-sm">
                      Manage your skincare products and track their usage.
                    </p>
                  </div>
                  <AddProductDialog 
                    onProductAdded={() => {
                      setActiveTab('products');
                      productListRef.current?.loadProducts();
                    }} 
                  />
                </div>

                {/* Quick Stats */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Card className="bg-primary/5">
                    <CardContent className="p-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Total Products</span>
                        <span className="text-2xl font-bold">{productStats.total}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5">
                    <CardContent className="p-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Active</span>
                        <span className="text-2xl font-bold">{productStats.active}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5">
                    <CardContent className="p-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Finished</span>
                        <span className="text-2xl font-bold">{productStats.finished}</span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/5">
                    <CardContent className="p-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Would Repurchase</span>
                        <span className="text-2xl font-bold">{productStats.repurchase}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Filter/Sort Options */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-none">
                  <Button 
                    variant={productFilter === 'all' ? 'default' : 'outline'} 
                    size="sm" 
                    className="whitespace-nowrap"
                    onClick={() => handleFilterChange('all')}
                  >
                    All Products
                  </Button>
                  <Button 
                    variant={productFilter === 'active' ? 'default' : 'outline'} 
                    size="sm" 
                    className="whitespace-nowrap"
                    onClick={() => handleFilterChange('active')}
                  >
                    Active
                  </Button>
                  <Button 
                    variant={productFilter === 'finished' ? 'default' : 'outline'} 
                    size="sm" 
                    className="whitespace-nowrap"
                    onClick={() => handleFilterChange('finished')}
                  >
                    Finished
                  </Button>
                  <Button 
                    variant={productFilter === 'repurchase' ? 'default' : 'outline'} 
                    size="sm" 
                    className="whitespace-nowrap"
                    onClick={() => handleFilterChange('repurchase')}
                  >
                    Would Repurchase
                  </Button>
                </div>
              </div>

              {/* Product List */}
              <div className="mt-2">
                <ProductList 
                  ref={productListRef}
                  filter={productFilter}
                  onProductsChange={() => setActiveTab('products')}
                  onStatsChange={handleProductsChange}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="routines" className="mt-0">
            <div className="space-y-4">
              {/* Header Section */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Routines</h2>
                  <p className="text-muted-foreground text-sm">
                    Create and manage your skincare routines.
                  </p>
                </div>
              </div>

              {/* Routines List */}
              <RoutineList onRoutinesChange={() => setActiveTab('routines')} />
            </div>
          </TabsContent>
          
          <TabsContent value="progress" className="mt-0">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">No Progress Tracked</h2>
              <p className="text-muted-foreground max-w-md mb-6">
                Take photos and track your skin's progress over time to see what works best.
              </p>
              <Button size="lg" className="rounded-full">
                Track Your First Progress Photo
              </Button>
            </div>
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