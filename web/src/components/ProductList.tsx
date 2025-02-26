import { useEffect, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Star, Plus, Trash, Loader2, Droplets, FlaskConical, CircleDot, Sun, Layers, Sparkles, Eye, Zap, Package } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { EditProductDialog } from './EditProductDialog';
import { useAuth } from '@/lib/AuthContext';
import { getUserProducts, deleteProduct, Product } from '@/lib/db';
import { cn } from '@/lib/utils';

export type { Product };

export interface ProductStats {
  total: number;
  active: number;
  finished: number;
  repurchase: number;
}

export interface ProductListProps {
  filter?: 'all' | 'active' | 'finished' | 'repurchase';
  onProductsChange?: () => void;
  onStatsChange?: (stats: ProductStats) => void;
}

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

export const ProductList = forwardRef<{ loadProducts: () => Promise<void> }, ProductListProps>(
  ({ filter = 'all', onProductsChange, onStatsChange }, ref) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { currentUser } = useAuth();
    
    const loadProducts = async () => {
      if (!currentUser?.uid) return;
      
      setLoading(true);
      try {
        const fetchedProducts = await getUserProducts(currentUser.uid);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Error loading products', {
          description: 'Please try again later.'
        });
      } finally {
        setLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      loadProducts,
    }));

    useEffect(() => {
      loadProducts();
    }, [currentUser]);

    const stats = useMemo<ProductStats>(() => {
      return products.reduce((acc, product) => ({
        total: acc.total + 1,
        active: acc.active + (product.status === 'active' ? 1 : 0),
        finished: acc.finished + (product.status === 'finished' ? 1 : 0),
        repurchase: acc.repurchase + (product.wouldRepurchase ? 1 : 0),
      }), {
        total: 0,
        active: 0,
        finished: 0,
        repurchase: 0,
      });
    }, [products]);

    useEffect(() => {
      onStatsChange?.(stats);
    }, [stats, onStatsChange]);

    const filteredProducts = useMemo(() => {
      switch (filter) {
        case 'active':
          return products.filter(p => p.status === 'active' || !p.status);
        case 'finished':
          return products.filter(p => p.status === 'finished');
        case 'repurchase':
          return products.filter(p => p.wouldRepurchase === true);
        default:
          return products;
      }
    }, [products, filter]);

    const handleDelete = async (product: Product) => {
      setIsDeleting(true);
      try {
        await deleteProduct(product.id);
        await loadProducts();
        onProductsChange?.();
        toast.success('Product deleted', {
          description: 'The product has been successfully deleted.'
        });
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Error deleting product', {
          description: 'Please try again later.'
        });
      } finally {
        setIsDeleting(false);
        setDeleteDialogOpen(false);
        setProductToDelete(null);
      }
    };

    if (loading) {
      return (
        <div className="min-h-[200px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (filteredProducts.length === 0) {
      return (
        <Card className="min-h-[200px]">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center">
            <Plus className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No products found</h3>
            <p className="text-sm text-muted-foreground">
              {filter === 'all' 
                ? 'Start by adding your first skincare product.'
                : 'No products match the selected filter.'}
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className={cn(
                "group relative overflow-hidden transition-all hover:shadow-md cursor-pointer border",
                // Default gradient (for active products)
                product.status !== 'finished' && !product.wouldRepurchase && [
                  "bg-gradient-to-br from-blue-50 via-blue-50/50 to-transparent",
                  "dark:from-blue-950/20 dark:via-transparent dark:to-transparent",
                  "hover:from-blue-100/80 hover:via-blue-50/40 hover:to-transparent",
                  "dark:hover:from-blue-950/30 dark:hover:via-transparent dark:hover:to-transparent",
                  "border-blue-200/50 dark:border-blue-800/30"
                ],
                // Finished products gradient
                product.status === 'finished' && !product.wouldRepurchase && [
                  "bg-gradient-to-br from-purple-50 via-purple-50/50 to-transparent",
                  "dark:from-purple-950/20 dark:via-transparent dark:to-transparent",
                  "hover:from-purple-100/80 hover:via-purple-50/40 hover:to-transparent",
                  "dark:hover:from-purple-950/30 dark:hover:via-transparent dark:hover:to-transparent",
                  "border-purple-200/50 dark:border-purple-800/30"
                ],
                // Would repurchase gradient (takes precedence over finished)
                product.wouldRepurchase && [
                  "bg-gradient-to-br from-green-50 via-green-50/50 to-transparent",
                  "dark:from-green-950/20 dark:via-transparent dark:to-transparent",
                  "hover:from-green-100/80 hover:via-green-50/40 hover:to-transparent",
                  "dark:hover:from-green-950/30 dark:hover:via-transparent dark:hover:to-transparent",
                  "border-green-200/50 dark:border-green-800/30"
                ]
              )}
              onClick={() => setEditingProduct(product)}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-primary",
                      product.status !== 'finished' && !product.wouldRepurchase && "bg-blue-500/10",
                      product.status === 'finished' && !product.wouldRepurchase && "bg-purple-500/10",
                      product.wouldRepurchase && "bg-green-500/10"
                    )}>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        getCategoryIcon(product.category)
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <h3 className="font-semibold leading-none line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{product.brand}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click
                      setProductToDelete(product);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex flex-wrap gap-1.5">
                    {product.category && (
                      <Badge variant="secondary" className="text-xs">
                        {product.category}
                      </Badge>
                    )}
                    {product.size && (
                      <Badge variant="outline" className="text-xs">
                        {product.size}
                      </Badge>
                    )}
                    {product.price && (
                      <Badge variant="outline" className="text-xs">
                        ${product.price}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {product.status === 'finished' && (
                      <Badge variant="default" className={cn(
                        "text-xs",
                        product.wouldRepurchase
                          ? "bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20"
                          : "bg-purple-500/10 text-purple-700 dark:text-purple-400 hover:bg-purple-500/20"
                      )}>
                        Finished
                      </Badge>
                    )}
                    {product.wouldRepurchase && (
                      <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20">
                        <Star className="mr-1 h-3 w-3" />
                        Would Repurchase
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <EditProductDialog
          product={editingProduct}
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
          onProductUpdated={() => {
            loadProducts();
            onProductsChange?.();
          }}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product
                "{productToDelete?.name}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  const product = productToDelete;
                  if (product) {
                    handleDelete(product);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
); 