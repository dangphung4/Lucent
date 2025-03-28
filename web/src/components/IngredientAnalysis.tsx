import { Card, CardContent } from "./ui/card";
import { Info, Droplets, Shield, Sparkles, Zap } from "lucide-react";
import { Product } from "@/lib/db";
import { useState, useEffect } from "react";

interface IngredientAnalysisProps {
  products: Product[];
}

interface IngredientInteraction {
  type: "warning" | "info" | "success";
  products: string[];
  message: string;
}

interface IngredientCategory {
  name: string;
  icon: typeof Droplets;
  products: string[];
  description: string;
}

export function IngredientAnalysis({ products }: IngredientAnalysisProps) {
  const [interactions, setInteractions] = useState<IngredientInteraction[]>([]);
  const [categories, setCategories] = useState<IngredientCategory[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const analyzeIngredientInteractions = () => {
      const newInteractions: IngredientInteraction[] = [];
      const newCategories: IngredientCategory[] = [];
      
      // Get cached skin analysis data
      const cached = localStorage.getItem('skinAnalysisCache');
      if (!cached) {
        setInteractions([]);
        setCategories([]);
        setIsAnalyzing(false);
        return;
      }

      try {
        const { analysis } = JSON.parse(cached);
        const productIngredients = new Map<string, string[]>(
          Object.entries(analysis.productIngredients as Record<string, string[]>)
        );

        // Initialize ingredient category tracking
        const hydrators = new Set<string>();
        const antioxidants = new Set<string>();
        const exfoliants = new Set<string>();
        const soothing = new Set<string>();
        const retinolProducts = new Set<string>();
        const vitaminCProducts = new Set<string>();
        const ahaProducts = new Set<string>();
        const bhaProducts = new Set<string>();
        const peptideProducts = new Set<string>();
        const benzoylPeroxideProducts = new Set<string>();

        // Analyze ingredients by category
        productIngredients.forEach((ingredients: string[], productName: string) => {
          const lowerIngredients = ingredients.map((i: string) => i.toLowerCase());
          
          // Hydrating ingredients
          if (lowerIngredients.some((i: string) => 
            i.includes('hyaluronic') || 
            i.includes('glycerin') || 
            i.includes('ceramide') ||
            i.includes('squalane') ||
            i.includes('panthenol') ||
            i.includes('mucin')
          )) {
            hydrators.add(productName);
          }

          // Antioxidants
          if (lowerIngredients.some((i: string) => 
            i.includes('vitamin c') ||
            i.includes('ascorb') ||
            i.includes('vitamin e') ||
            i.includes('tocopherol') ||
            i.includes('niacinamide') ||
            i.includes('green tea') ||
            i.includes('resveratrol')
          )) {
            antioxidants.add(productName);
          }

          // Exfoliants
          if (lowerIngredients.some((i: string) => 
            i.includes('glycolic') || 
            i.includes('lactic') || 
            i.includes('mandelic') ||
            i.includes('salicylic') ||
            i.includes('bha') ||
            i.includes('aha')
          )) {
            exfoliants.add(productName);
          }

          // Soothing ingredients
          if (lowerIngredients.some((i: string) => 
            i.includes('centella') ||
            i.includes('aloe') ||
            i.includes('chamomile') ||
            i.includes('allantoin') ||
            i.includes('panthenol') ||
            i.includes('madecassoside')
          )) {
            soothing.add(productName);
          }

          // Specific actives tracking
          if (lowerIngredients.some((i: string) => i.includes('retinol') || i.includes('retinyl'))) {
            retinolProducts.add(productName);
          }
          if (lowerIngredients.some((i: string) => 
            i.includes('ascorbic') || 
            i.includes('vitamin c') || 
            i.includes('ascorbyl')
          )) {
            vitaminCProducts.add(productName);
          }
          if (lowerIngredients.some((i: string) => 
            i.includes('glycolic') || 
            i.includes('lactic') || 
            i.includes('mandelic')
          )) {
            ahaProducts.add(productName);
          }
          if (lowerIngredients.some((i: string) => i.includes('salicylic'))) {
            bhaProducts.add(productName);
          }
          if (lowerIngredients.some((i: string) => 
            i.includes('peptide') ||
            i.includes('palmitoyl') ||
            i.includes('matrixyl')
          )) {
            peptideProducts.add(productName);
          }
          if (lowerIngredients.some((i: string) => i.includes('benzoyl peroxide'))) {
            benzoylPeroxideProducts.add(productName);
          }
        });

        // Add categories to display
        if (hydrators.size > 0) {
          newCategories.push({
            name: "Hydrating Ingredients",
            icon: Droplets,
            products: Array.from(hydrators),
            description: "These ingredients help maintain skin hydration and strengthen the moisture barrier."
          });
        }

        if (antioxidants.size > 0) {
          newCategories.push({
            name: "Antioxidants",
            icon: Shield,
            products: Array.from(antioxidants),
            description: "These ingredients protect against environmental damage and help prevent premature aging."
          });
        }

        if (exfoliants.size > 0) {
          newCategories.push({
            name: "Exfoliants",
            icon: Sparkles,
            products: Array.from(exfoliants),
            description: "These ingredients help remove dead skin cells and improve skin texture."
          });
        }

        if (soothing.size > 0) {
          newCategories.push({
            name: "Soothing Ingredients",
            icon: Zap,
            products: Array.from(soothing),
            description: "These ingredients help calm irritation and reduce inflammation."
          });
        }

        // Check for potential conflicts
        if (retinolProducts.size > 0 && vitaminCProducts.size > 0) {
          newInteractions.push({
            type: "warning",
            products: [...retinolProducts, ...vitaminCProducts],
            message: "Avoid using Retinol and Vitamin C together as they can make each other less effective. Use Vitamin C in the morning and Retinol at night."
          });
        }

        if (retinolProducts.size > 0 && (ahaProducts.size > 0 || bhaProducts.size > 0)) {
          newInteractions.push({
            type: "warning",
            products: [...retinolProducts, ...ahaProducts, ...bhaProducts],
            message: "Be careful using Retinol with AHA/BHA exfoliants. This combination can be irritating. Consider using them on alternate days."
          });
        }

        if (benzoylPeroxideProducts.size > 0 && vitaminCProducts.size > 0) {
          newInteractions.push({
            type: "warning",
            products: [...benzoylPeroxideProducts, ...vitaminCProducts],
            message: "Benzoyl Peroxide can oxidize Vitamin C, making it less effective. Use these ingredients at different times of day."
          });
        }

        // Add beneficial combinations
        if (hydrators.size > 0 && peptideProducts.size > 0) {
          newInteractions.push({
            type: "success",
            products: [...hydrators, ...peptideProducts],
            message: "Great combination! Hydrating ingredients enhance the effectiveness of peptides."
          });
        }

        if (antioxidants.size > 0 && exfoliants.size > 0) {
          newInteractions.push({
            type: "success",
            products: [...antioxidants, ...exfoliants],
            message: "Good mix! Antioxidants help protect newly exfoliated skin."
          });
        }

        // Add general information
        newInteractions.push({
          type: "info",
          products: [],
          message: `Analyzed ${productIngredients.size} products with ${
            hydrators.size + antioxidants.size + exfoliants.size + soothing.size
          } beneficial ingredient categories.`
        });

        setInteractions(newInteractions);
        setCategories(newCategories);
      } catch (error) {
        console.error('Error analyzing ingredient interactions:', error);
        setInteractions([]);
        setCategories([]);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeIngredientInteractions();
  }, [products]);

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Info className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-semibold">Ingredient Analysis</h2>
        </div>

        {isAnalyzing ? (
          <div className="text-sm text-muted-foreground animate-pulse">
            Analyzing ingredient interactions...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Ingredient Categories */}
            {categories.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Ingredient Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <category.icon className="h-4 w-4 text-purple-500" />
                        <h4 className="font-medium">{category.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {category.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {category.products.map((product, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
                          >
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredient Interactions */}
            {interactions.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Ingredient Interactions</h3>
                <div className="space-y-3">
                  {interactions.map((interaction, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg ${
                        interaction.type === "warning"
                          ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200"
                          : interaction.type === "success"
                          ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                          : "bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
                      }`}
                    >
                      <p className="text-sm mb-1">{interaction.message}</p>
                      {interaction.products.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {interaction.products.map((product, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-1 rounded-full ${
                                interaction.type === "warning"
                                  ? "bg-yellow-100 dark:bg-yellow-900"
                                  : interaction.type === "success"
                                  ? "bg-green-100 dark:bg-green-900"
                                  : "bg-blue-100 dark:bg-blue-900"
                              }`}
                            >
                              {product}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!categories.length && !interactions.length && (
              <p className="text-sm text-muted-foreground">
                No significant ingredient interactions found in your current routine.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 