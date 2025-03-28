import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { Product, Routine } from "@/lib/db";
import { useState, useEffect } from "react";
import { GoogleGenerativeAI } from '@google/generative-ai';

interface SkinAnalysisProps {
  products: Product[];
  routines: Routine[];
  skinType: string;
  skinConcerns: string[];
}

interface IngredientAnalysis {
  actives: number;
  moisturizers: number;
  cleansers: number;
  protectants: number;
  productIngredients: Map<string, string[]>;
  lastUpdated: number;
}

interface ProductAnalysis {
  name: string;
  ingredients: string[];
  categories: {
    hasActives: boolean;
    hasMoisturizers: boolean;
    hasCleansingAgents: boolean;
    hasSPF: boolean;
  };
}

// Create a custom Google provider with API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export function SkinAnalysis({ products, skinType, skinConcerns }: SkinAnalysisProps) {
  const [ingredientAnalysis, setIngredientAnalysis] = useState<IngredientAnalysis>({
    actives: 0,
    moisturizers: 0,
    cleansers: 0,
    protectants: 0,
    productIngredients: new Map(),
    lastUpdated: Date.now(),
  });
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    const loadCachedAnalysis = () => {
      const cached = localStorage.getItem('skinAnalysisCache');
      if (cached) {
        try {
          const { analysis, timestamp, productIds } = JSON.parse(cached);
          
          // Check if cache is still valid (within 24 hours) and products haven't changed
          const currentProductIds = products.map(p => p.id).sort().join(',');
          if (
            Date.now() - timestamp < CACHE_DURATION &&
            productIds === currentProductIds
          ) {
            // Convert the plain object back to a Map
            analysis.productIngredients = new Map(Object.entries(analysis.productIngredients));
            setIngredientAnalysis(analysis);
            setIsAnalyzing(false);
            return true;
          }
        } catch (error) {
          console.error('Error loading cached analysis:', error);
        }
      }
      return false;
    };

    const analyzeProductsWithAI = async () => {
      if (!products.length) {
        setIsAnalyzing(false);
        return;
      }

      // Check cache first
      if (loadCachedAnalysis()) {
        return;
      }

      try {
        setIsAnalyzing(true);

        // Create a detailed prompt for all products
        const productsPrompt = products
          .map(
            (p) => `
Product: ${p.name}
Brand: ${p.brand}
Category: ${p.category}
Description: ${p.description || "No description provided"}
            `
          )
          .join("\n\n");

        const prompt = `As a skincare expert, analyze these products and identify their likely ingredients based on their names, brands, and categories. For each product, list the key ingredients and categorize them.

Products to analyze:
${productsPrompt}

Respond with ONLY a JSON object in this exact format (no markdown, no backticks):
{
  "productAnalysis": [
    {
      "name": "product name",
      "ingredients": ["ingredient1", "ingredient2"],
      "categories": {
        "hasActives": boolean,
        "hasMoisturizers": boolean,
        "hasCleansingAgents": boolean,
        "hasSPF": boolean
      }
    }
  ]
}`;

        const result = await model.generateContent([{ text: prompt }]);
        const responseText = result.response.text().trim();
        
        // Remove any potential markdown formatting or backticks
        const cleanJson = responseText.replace(/^```json\s*|\s*```$/g, '').trim();
        console.log('Cleaned JSON:', cleanJson);
        
        let response;
        try {
          response = JSON.parse(cleanJson);
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          console.log('Raw response:', responseText);
          throw new Error('Failed to parse AI response');
        }
        
        // Process the analysis
        const analysis: IngredientAnalysis = {
          actives: 0,
          moisturizers: 0,
          cleansers: 0,
          protectants: 0,
          productIngredients: new Map(),
          lastUpdated: Date.now(),
        };

        response.productAnalysis.forEach((product: ProductAnalysis) => {
          // Store ingredients for each product
          analysis.productIngredients.set(product.name, product.ingredients);

          // Update category counts
          if (product.categories.hasActives) analysis.actives++;
          if (product.categories.hasMoisturizers) analysis.moisturizers++;
          if (product.categories.hasCleansingAgents) analysis.cleansers++;
          if (product.categories.hasSPF) analysis.protectants++;
        });

        // Cache the analysis
        const cacheData = {
          analysis: {
            ...analysis,
            productIngredients: Object.fromEntries(analysis.productIngredients),
          },
          timestamp: Date.now(),
          productIds: products.map(p => p.id).sort().join(','),
        };
        localStorage.setItem('skinAnalysisCache', JSON.stringify(cacheData));

        setIngredientAnalysis(analysis);
      } catch (error) {
        console.error("Error analyzing products:", error);
        // If there's an error, try to use cached data as fallback
        if (!loadCachedAnalysis()) {
          setIngredientAnalysis({
            actives: 0,
            moisturizers: 0,
            cleansers: 0,
            protectants: 0,
            productIngredients: new Map(),
            lastUpdated: Date.now(),
          });
        }
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeProductsWithAI();
  }, [products]);

  // Generate recommendations based on analysis
  const generateRecommendations = () => {
    const recommendations = [];

    // Check for essential steps
    if (ingredientAnalysis.cleansers === 0) {
      recommendations.push({
        type: "warning",
        message: "Your routine is missing a cleanser - this is essential for removing dirt, oil, and dead skin cells",
        icon: AlertCircle,
      });
    }

    if (ingredientAnalysis.moisturizers === 0) {
      recommendations.push({
        type: "warning",
        message: "A moisturizer is crucial for maintaining skin barrier health and hydration",
        icon: AlertCircle,
      });
    }

    if (ingredientAnalysis.protectants === 0) {
      recommendations.push({
        type: "warning",
        message: "SPF is essential for preventing sun damage and premature aging - add one to your morning routine",
        icon: AlertCircle,
      });
    }

    // Analyze product combinations and skin type specific recommendations
    const hasExfoliants = Array.from(ingredientAnalysis.productIngredients.values()).some(
      ingredients => ingredients.some(i => 
        i.toLowerCase().includes('acid') || 
        i.toLowerCase().includes('retinol') ||
        i.toLowerCase().includes('enzyme')
      )
    );

    const hasHydrators = Array.from(ingredientAnalysis.productIngredients.values()).some(
      ingredients => ingredients.some(i => 
        i.toLowerCase().includes('hyaluronic') || 
        i.toLowerCase().includes('glycerin') ||
        i.toLowerCase().includes('ceramide')
      )
    );

    // Skin type specific recommendations
    if (skinType === 'dry' && !hasHydrators) {
      recommendations.push({
        type: "warning",
        message: "For dry skin, consider adding products with hyaluronic acid or ceramides for extra hydration",
        icon: AlertCircle,
      });
    }

    if (skinType === 'oily' && !hasExfoliants) {
      recommendations.push({
        type: "warning",
        message: "For oily skin, consider adding a gentle exfoliant with salicylic acid",
        icon: AlertCircle,
      });
    }

    // Check for skin concerns
    if (skinConcerns.includes('acne') && !ingredientAnalysis.productIngredients.has('salicylic acid')) {
      recommendations.push({
        type: "info",
        message: "For acne concerns, consider adding products with salicylic acid or benzoyl peroxide",
        icon: AlertCircle,
      });
    }

    if (skinConcerns.includes('aging') && !Array.from(ingredientAnalysis.productIngredients.values()).some(
      ingredients => ingredients.some(i => i.toLowerCase().includes('retinol') || i.toLowerCase().includes('peptide'))
    )) {
      recommendations.push({
        type: "info",
        message: "For anti-aging benefits, consider adding retinol or peptides to your routine",
        icon: AlertCircle,
      });
    }

    // Positive feedback
    if (ingredientAnalysis.actives > 0) {
      recommendations.push({
        type: "success",
        message: `Great job including ${ingredientAnalysis.actives} active ingredients in your routine!`,
        icon: CheckCircle,
      });
    }

    if (hasHydrators) {
      recommendations.push({
        type: "success",
        message: "Your routine includes good hydrating ingredients!",
        icon: CheckCircle,
      });
    }

    if (ingredientAnalysis.protectants > 0) {
      recommendations.push({
        type: "success",
        message: "Excellent - you're protecting your skin with SPF!",
        icon: CheckCircle,
      });
    }

    // Product combination warnings
    if (hasExfoliants && ingredientAnalysis.actives > 2) {
      recommendations.push({
        type: "warning",
        message: "Be careful not to over-exfoliate - consider alternating your active ingredients",
        icon: AlertCircle,
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h2 className="text-xl font-semibold">Skin Analysis</h2>
        </div>

        {/* Skin Type and Concerns */}
        <div className="space-y-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Your Skin Profile</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm">
                {skinType}
              </span>
              {skinConcerns.map((concern, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm"
                >
                  {concern}
                </span>
              ))}
            </div>
          </div>

          {/* Routine Analysis */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Routine Analysis</h3>
            {isAnalyzing ? (
              <div className="text-sm text-muted-foreground animate-pulse">
                Analyzing your products...
              </div>
            ) : (
              <div className="space-y-2">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Actives</span>
                    <span className="text-muted-foreground">{ingredientAnalysis.actives} products</span>
                  </div>
                  <Progress value={(ingredientAnalysis.actives / products.length) * 100} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Moisturizers</span>
                    <span className="text-muted-foreground">{ingredientAnalysis.moisturizers} products</span>
                  </div>
                  <Progress value={(ingredientAnalysis.moisturizers / products.length) * 100} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Cleansers</span>
                    <span className="text-muted-foreground">{ingredientAnalysis.cleansers} products</span>
                  </div>
                  <Progress value={(ingredientAnalysis.cleansers / products.length) * 100} className="h-2" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Protectants</span>
                    <span className="text-muted-foreground">{ingredientAnalysis.protectants} products</span>
                  </div>
                  <Progress value={(ingredientAnalysis.protectants / products.length) * 100} className="h-2" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Recommendations</h3>
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 p-3 rounded-lg ${
                  rec.type === "warning"
                    ? "bg-yellow-50 dark:bg-yellow-900/20"
                    : rec.type === "info"
                    ? "bg-blue-50 dark:bg-blue-900/20"
                    : "bg-green-50 dark:bg-green-900/20"
                }`}
              >
                <rec.icon
                  className={`h-5 w-5 mt-0.5 ${
                    rec.type === "warning"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : rec.type === "info"
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                />
                <p className="text-sm">{rec.message}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 