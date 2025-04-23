import { useState, useEffect } from 'react';
import { CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import {
  ShoppingCart,
  Search,
  Sparkles,
  Star,
  Heart,
  AlertCircle,
  Check,
  Package,
  ExternalLink,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Trash,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getUserProfile, getUserWishlist, addToWishlist, removeFromWishlist, clearWishlist, WishlistItem } from '../lib/db';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  searchProducts, 
  convertToAppProduct, 
  MakeupProduct, 
  getProductsByType,
  getProductsByBrand,
  getBestProductTypeForSearch,
  getProductTypes,
  getPopularBrands,
} from '../lib/makeupAPI';

interface Product {
  id: string;
  name: string;
  brand: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  price?: number;
  rating?: number;
  reviewCount?: number;
  ingredients?: string[];
  url?: string;
  colors?: {
    hex_value: string;
    colour_name?: string;
  }[];
  skinConcerns?: string[];
}

interface RecommendedProduct extends Product {
  reasonForRecommendation: string;
  matchScore: number; // 0-100 score for how well it matches user needs
}

export function Marketplace() {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [skinType, setSkinType] = useState<string>('combination');
  const [skinConcerns, setSkinConcerns] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<RecommendedProduct[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState('recommended');
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Categories for filtering
  const categories = [
    'lip',
    'face',
    'eye',
    'nail',
    'skincare',
  ];

  // Load user data and wishlist
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser?.uid) return;
      
      try {
        // Load user profile
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          setSkinType(profile.skinType || 'combination');
          setSkinConcerns(profile.skinConcerns || []);
        }

        // Load wishlist
        setWishlistLoading(true);
        const wishlist = await getUserWishlist(currentUser.uid);
        if (wishlist) {
          setWishlistItems(wishlist.items);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setWishlistLoading(false);
      }
    };
    
    loadUserData();
  }, [currentUser]);

  // Load products from Makeup API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Fetch initial set of products
        let products: MakeupProduct[] = [];
        
        // Start with products related to user's skin concerns if available
        if (skinConcerns.length > 0) {
          // Pick the first concern to search for and map it to a product type
          const concern = skinConcerns[0];
          const productType = getBestProductTypeForSearch(concern);
          
          if (productType) {
            const concernProducts = await getProductsByType(productType);
            products = [...products, ...concernProducts];
          }
        }
        
        // If we don't have enough products yet, get some popular products by brand
        if (products.length < 10) {
          const popularBrands = getPopularBrands();
          // Get products from 2 random popular brands
          const randomBrands = popularBrands
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);
          
          for (const brand of randomBrands) {
            if (products.length >= 30) break;
            const brandProducts = await getProductsByBrand(brand);
            products = [...products, ...brandProducts];
          }
        }
        
        // If we still don't have enough products, get some by product type
        if (products.length < 20) {
          const productTypes = getProductTypes();
          // Get products from 2 random product types
          const randomTypes = productTypes
            .sort(() => 0.5 - Math.random())
            .slice(0, 2);
          
          for (const type of randomTypes) {
            if (products.length >= 30) break;
            const typeProducts = await getProductsByType(type);
            products = [...products, ...typeProducts.slice(0, 10)]; // Limit to 10 per type
          }
        }
        
        // Remove duplicates by ID
        const uniqueProducts = Array.from(
          new Map(products.map(product => [product.id, product])).values()
        );
        
        // Convert API products to our app's format and add recommendation reasons
        const convertedProducts = uniqueProducts.map(product => {
          const appProduct = convertToAppProduct(product);
          
          // Determine reason for recommendation based on tags and user's concerns
          let reason = '';
          let matchScore = 70; // Default match score
          
          // Check if any tags match skin concerns
          const productTags = product.tag_list.map(tag => tag.toLowerCase());
          
          if (skinConcerns.includes('acne') && 
              (productTags.some(tag => 
                tag.includes('oil free') || 
                tag.includes('matte') || 
                tag.includes('purpicks')
              ))) {
            reason = 'Good for acne-prone skin';
            matchScore += 15;
          } else if (skinConcerns.includes('dryness') && 
              (productTags.some(tag => 
                tag.includes('hydrating') || 
                tag.includes('moisturizing')
              ))) {
            reason = 'Hydrating formula for dry skin';
            matchScore += 15;
          } else if (skinConcerns.includes('aging') && 
              (productTags.some(tag => 
                tag.includes('anti-aging') || 
                tag.includes('rejuven')
              ))) {
            reason = 'Anti-aging benefits';
            matchScore += 15;
          } else if (skinConcerns.includes('sensitivity') && 
              (productTags.some(tag => 
                tag.includes('hypoallergenic') || 
                tag.includes('sensitive') ||
                tag.includes('natural')
              ))) {
            reason = 'Suitable for sensitive skin';
            matchScore += 15;
          } else {
            // Generic reason based on category and product tags
            if (appProduct.category === 'lip') {
              reason = productTags.includes('vegan') 
                ? 'Vegan lip product with vibrant color' 
                : 'Beautiful lip color with smooth application';
            } else if (appProduct.category === 'face') {
              reason = productTags.includes('natural') 
                ? 'Natural-looking finish for your skin tone' 
                : 'Great face product for your skin type';
            } else if (appProduct.category === 'eye') {
              reason = 'Beautiful eye product to enhance your look';
            } else if (appProduct.category === 'nail') {
              reason = 'Trendy nail color with great coverage';
            } else {
              reason = 'Recommended based on your beauty profile';
            }
          }
          
          // Add points if product is from a preferred brand
          const preferredBrands = ['maybelline', 'nyx', 'l\'oreal', 'covergirl'];
          if (preferredBrands.some(brand => 
            product.brand.toLowerCase().includes(brand))) {
            matchScore += 5;
            if (!reason.includes('brand')) {
              reason += ' from a trusted brand';
            }
          }
          
          // Add points for vegan/natural products if user has sensitivity concerns
          if (skinConcerns.includes('sensitivity') && 
              productTags.some(tag => tag.includes('vegan') || tag.includes('natural'))) {
            matchScore += 10;
          }
          
          // Cap the score at 100
          matchScore = Math.min(matchScore, 100);
          
          return {
            ...appProduct,
            reasonForRecommendation: reason,
            matchScore,
          };
        });
        
        // Sort by match score, highest first
        const sortedProducts = convertedProducts.sort((a, b) => b.matchScore - a.matchScore);
        
        setRecommendations(sortedProducts);
        
        // Create featured products (top products from different categories)
        const featuredMap = new Map<string, RecommendedProduct>();
        for (const product of sortedProducts) {
          if (featuredMap.size >= 6) break;
          if (product.category && !featuredMap.has(product.category)) {
            featuredMap.set(product.category, product);
          }
        }
        
        setFeaturedProducts(Array.from(featuredMap.values()));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (currentUser) {
      fetchProducts();
    }
  }, [currentUser, skinType, skinConcerns]);

  // Handle product search
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery || searchQuery.length < 2) return;
      
      setIsLoading(true);
      try {
        // Try to determine product type from search query
        const productType = getBestProductTypeForSearch(searchQuery);
        
        let results: MakeupProduct[] = [];
        
        // Search by product type if we could determine it
        if (productType) {
          results = await getProductsByType(productType);
        } else {
          // Otherwise try searching by brand
          const brandResults = await searchProducts({
            brand: searchQuery
          });
          
          // If brand search didn't yield results, try product types
          if (brandResults.length === 0) {
            const productTypes = getProductTypes();
            for (const type of productTypes) {
              if (type.toLowerCase().includes(searchQuery.toLowerCase())) {
                const typeResults = await getProductsByType(type);
                results = [...results, ...typeResults];
                break;
              }
            }
          } else {
            results = brandResults;
          }
        }
        
        // Convert API products to our app's format
        const convertedProducts = results.map(product => {
          const appProduct = convertToAppProduct(product);
          
          return {
            ...appProduct,
            reasonForRecommendation: `Matched your search for "${searchQuery}"`,
            matchScore: 85,
          };
        });
        
        setRecommendations(convertedProducts);
      } catch (error) {
        console.error('Error searching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    const debounceTimer = setTimeout(() => {
      if (searchQuery && searchQuery.length >= 2) {
        handleSearch();
      }
    }, 500);
    
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Filter products based on category
  const filteredProducts = recommendations.filter(product => {
    // Apply category filter only
    const matchesCategory = activeCategory === null || 
      product.category === activeCategory;
    
    return matchesCategory;
  });

  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Pagination navigation
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const goToPage = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset pagination when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  // Check if product is in wishlist
  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(item => item.productId === productId);
  };

  // Toggle product in wishlist
  const toggleWishlist = async (product: Product) => {
    if (!currentUser) {
      toast.error("Please sign in to save products to your wishlist");
      return;
    }
    
    setIsAddingToWishlist(true);
    try {
      if (isInWishlist(product.id)) {
        // Remove from wishlist
        await removeFromWishlist(currentUser.uid, product.id);
        setWishlistItems(wishlistItems.filter(item => item.productId !== product.id));
        toast.success(`Removed from wishlist`);
      } else {
        // Add to wishlist - create a clean object with only defined properties
        const wishlistProduct: {
          productId: string;
          brand?: string;
          name?: string;
          imageUrl?: string;
          price?: number;
          category?: string;
        } = {
          productId: product.id,
        };
        
        // Only add properties that are defined
        if (product.brand) wishlistProduct.brand = product.brand;
        if (product.name) wishlistProduct.name = product.name;
        if (product.imageUrl) wishlistProduct.imageUrl = product.imageUrl;
        if (product.price !== undefined) wishlistProduct.price = product.price;
        if (product.category) wishlistProduct.category = product.category;
        
        await addToWishlist(currentUser.uid, wishlistProduct);
        
        // Add to local state - similarly only add defined values
        const newItem: WishlistItem = {
          productId: product.id,
          addedAt: new Date(),
        };
        
        if (product.brand) newItem.brand = product.brand;
        if (product.name) newItem.name = product.name;
        if (product.imageUrl) newItem.imageUrl = product.imageUrl;
        if (product.price !== undefined) newItem.price = product.price;
        if (product.category) newItem.category = product.category;
        
        setWishlistItems([...wishlistItems, newItem]);
        toast.success(`Added to wishlist`);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('Could not update wishlist');
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  // Handle clicking external product link
  const handleProductClick = (url: string | undefined) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Render product card
  const renderProductCard = (product: Product | RecommendedProduct) => {
    const isRecommended = 'reasonForRecommendation' in product;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-lg border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="relative aspect-square overflow-hidden bg-primary/5">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10">
              <Package className="h-12 w-12 text-primary/30" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white dark:bg-black/80 dark:hover:bg-black rounded-full h-8 w-8"
            onClick={() => toggleWishlist(product)}
            disabled={isAddingToWishlist}
          >
            <Heart 
              className={`h-4 w-4 ${isInWishlist(product.id) ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'}`} 
            />
          </Button>
        </div>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-normal text-xs">
                  {product.category || 'Beauty'}
                </Badge>
                {product.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    <span className="text-xs font-medium">{product.rating}</span>
                  </div>
                )}
              </div>
              <h3 className="font-medium text-base line-clamp-1">{product.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{product.brand}</p>
            </div>
            
            {/* Display color swatches if available */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {product.colors.slice(0, 5).map((color, index) => (
                  <div 
                    key={index}
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{ backgroundColor: color.hex_value }}
                    title={color.colour_name || color.hex_value}
                  />
                ))}
                {product.colors.length > 5 && (
                  <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[8px] font-medium">
                    +{product.colors.length - 5}
                  </div>
                )}
              </div>
            )}
            
            {isRecommended && (
              <div className="flex items-start gap-2 p-2 bg-primary/5 rounded-md">
                <Sparkles className="h-4 w-4 text-primary mt-0.5" />
                <p className="text-xs line-clamp-3">{(product as RecommendedProduct).reasonForRecommendation}</p>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              {product.price ? (
                <p className="font-medium">${product.price.toFixed(2)}</p>
              ) : (
                <span className="text-muted-foreground text-sm">Price unavailable</span>
              )}
              <Button 
                size="sm" 
                className="gap-1"
                onClick={() => handleProductClick(product.url)}
              >
                <ExternalLink className="h-3 w-3" />
                Shop
              </Button>
            </div>
          </div>
        </CardContent>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
            <ShoppingCart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Beauty Marketplace</h1>
            <p className="text-muted-foreground">Discover beauty products tailored to your needs</p>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
            <TabsTrigger value="recommended" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>Recommended</span>
            </TabsTrigger>
            <TabsTrigger value="featured" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>Featured</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <span>Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}</span>
            </TabsTrigger>
          </TabsList>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 my-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              <Button
                variant={activeCategory === null ? "secondary" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(null)}
                className="whitespace-nowrap"
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={activeCategory === category ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Skin Profile Info Card */}
          <div className="bg-card border rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Your Beauty Profile</h3>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="bg-primary/10 font-normal">
                {skinType}
              </Badge>
              {skinConcerns.map((concern, index) => (
                <Badge key={index} variant="secondary" className="bg-primary/10 font-normal">
                  {concern}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              Products are recommended based on your beauty profile and preferences.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Loading beauty products...</p>
            </div>
          )}

          {/* Product Grids by Tab */}
          {!isLoading && (
            <>
              <TabsContent value="recommended" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {currentProducts.length > 0 ? (
                    currentProducts.map((product) => (
                      <div key={product.id}>
                        {renderProductCard(product)}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full flex items-center justify-center p-8 text-center">
                      <div className="space-y-2">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                        <h3 className="font-medium">No products found</h3>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search or filters to find what you're looking for.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Pagination Controls */}
                {filteredProducts.length > productsPerPage && (
                  <div className="flex items-center justify-center mt-8 space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={prevPage} 
                      disabled={currentPage === 1}
                      className="h-8 w-8"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    {/* Page number buttons */}
                    <div className="flex items-center space-x-1">
                      {/* Show first page */}
                      {currentPage > 3 && (
                        <>
                          <Button 
                            variant={currentPage === 1 ? "default" : "outline"}
                            size="sm" 
                            onClick={() => goToPage(1)}
                            className="h-8 w-8 px-0"
                          >
                            1
                          </Button>
                          {currentPage > 4 && (
                            <span className="text-muted-foreground px-1">...</span>
                          )}
                        </>
                      )}
                      
                      {/* Show nearby pages */}
                      {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                        // Calculate which page numbers to show
                        let pageNumber;
                        if (currentPage <= 3) {
                          // Show first 5 pages
                          pageNumber = i + 1;
                          // Don't show more pages than available
                          if (pageNumber > totalPages) return null;
                        } else if (currentPage >= totalPages - 2) {
                          // Show last 5 pages
                          pageNumber = totalPages - 4 + i;
                          // Don't show negative page numbers
                          if (pageNumber <= 0) return null;
                        } else {
                          // Show 2 pages before and after current
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button 
                            key={pageNumber}
                            variant={currentPage === pageNumber ? "default" : "outline"}
                            size="sm" 
                            onClick={() => goToPage(pageNumber)}
                            className="h-8 w-8 px-0"
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                      
                      {/* Show last page */}
                      {currentPage < totalPages - 2 && (
                        <>
                          {currentPage < totalPages - 3 && (
                            <span className="text-muted-foreground px-1">...</span>
                          )}
                          <Button 
                            variant={currentPage === totalPages ? "default" : "outline"}
                            size="sm" 
                            onClick={() => goToPage(totalPages)}
                            className="h-8 w-8 px-0"
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={nextPage} 
                      disabled={currentPage === totalPages}
                      className="h-8 w-8"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {/* Show pagination info */}
                {filteredProducts.length > 0 && (
                  <div className="text-center text-sm text-muted-foreground mt-2">
                    Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="featured" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {featuredProducts.length > 0 ? (
                    featuredProducts.map((product) => (
                      <div key={product.id}>
                        {renderProductCard(product)}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full flex items-center justify-center p-8 text-center">
                      <div className="space-y-2">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                        <h3 className="font-medium">No featured products available</h3>
                        <p className="text-sm text-muted-foreground">
                          Please check back later for featured products.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="wishlist" className="space-y-4">
                {wishlistLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground">Loading your wishlist...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Your Wishlist</h3>
                      {wishlistItems.length > 0 && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="gap-2 text-destructive hover:text-destructive"
                          onClick={async () => {
                            if (!currentUser) return;
                            try {
                              await clearWishlist(currentUser.uid);
                              setWishlistItems([]);
                              toast.success('Wishlist cleared');
                            } catch (error) {
                              console.error('Error clearing wishlist:', error);
                              toast.error('Could not clear wishlist');
                            }
                          }}
                        >
                          <Trash className="h-4 w-4" />
                          Clear Wishlist
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {wishlistItems.length > 0 ? (
                        wishlistItems.map((item) => {
                          // Create a product object from wishlist item
                          const product: Product = {
                            id: item.productId,
                            name: item.name || 'Unknown Product',
                            brand: item.brand || 'Unknown Brand',
                            category: item.category,
                            imageUrl: item.imageUrl,
                            price: item.price,
                          };
                          
                          return (
                            <div key={item.productId}>
                              {renderProductCard(product)}
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-full flex items-center justify-center p-8 text-center">
                          <div className="space-y-2">
                            <Heart className="h-8 w-8 text-muted-foreground mx-auto" />
                            <h3 className="font-medium">Your wishlist is empty</h3>
                            <p className="text-sm text-muted-foreground">
                              Click the heart icon on any product to add it to your wishlist.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* API Credit */}
        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>Powered by <a href="http://makeup-api.herokuapp.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">Makeup API</a> - a comprehensive database of makeup products.</p>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 border border-primary/20 rounded-lg bg-card/50">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium mb-1">About Our Recommendations</h3>
              <p className="text-sm text-muted-foreground">
                Products are recommended based on your beauty profile and preferences. 
                We're not affiliated with any brands and don't earn commission from purchases. 
                Always patch test new products before full application.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 