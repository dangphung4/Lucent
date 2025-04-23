// API service for accessing the Skincare API
// Based on https://github.com/LauraAddams/skincareAPI

const API_BASE_URL = 'https://skincare-api.herokuapp.com';

export interface SkincareProduct {
  id: number;
  brand: string;
  name: string;
  ingredient_list: string[];
}

export interface SkincareIngredient {
  id: number;
  ingredient: string;
}

/**
 * Fetch all products from the Skincare API
 * @returns Promise containing an array of products
 */
export const getAllProducts = async (): Promise<SkincareProduct[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

/**
 * Fetch a single product by ID
 * @param id Product ID
 * @returns Promise containing a product
 */
export const getProductById = async (id: number): Promise<SkincareProduct | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
};

/**
 * Search for products by query
 * @param query Search query (brand, name, or ingredient)
 * @param limit Number of results to return (default: 10)
 * @param page Page number for pagination (default: 1)
 * @returns Promise containing an array of matching products
 */
export const searchProducts = async (
  query: string,
  limit: number = 10,
  page: number = 1
): Promise<SkincareProduct[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/product?q=${encodeURIComponent(query)}&limit=${limit}&page=${page}`
    );
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

/**
 * Get all ingredients
 * @returns Promise containing an array of ingredients
 */
export const getAllIngredients = async (): Promise<SkincareIngredient[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ingredients`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    return [];
  }
};

/**
 * Search for ingredients by query
 * @param query Search query
 * @returns Promise containing an array of matching ingredients
 */
export const searchIngredients = async (query: string): Promise<SkincareIngredient[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ingredient?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching ingredients:', error);
    return [];
  }
};

/**
 * Convert a SkincareProduct to our app's Product format
 */
export const convertToAppProduct = (skincareProduct: SkincareProduct) => {
  // Generate a random price between $5 and $50
  const price = Math.floor(Math.random() * 4500 + 500) / 100;
  
  // Generate a random rating between 3.5 and 5.0
  const rating = (Math.floor(Math.random() * 15) + 35) / 10;
  
  // Generate random review count between 100 and 5000
  const reviewCount = Math.floor(Math.random() * 4900 + 100);
  
  // Determine product category based on name or brand (crude but effective for demo)
  let category = 'skincare';
  const nameLower = skincareProduct.name.toLowerCase();
  if (nameLower.includes('cleanser') || nameLower.includes('wash')) {
    category = 'cleanser';
  } else if (nameLower.includes('moisturizer') || nameLower.includes('cream') || nameLower.includes('lotion')) {
    category = 'moisturizer';
  } else if (nameLower.includes('serum')) {
    category = 'serum';
  } else if (nameLower.includes('toner')) {
    category = 'toner';
  } else if (nameLower.includes('spf') || nameLower.includes('sunscreen') || nameLower.includes('sun')) {
    category = 'sunscreen';
  } else if (nameLower.includes('mask')) {
    category = 'mask';
  } else if (nameLower.includes('oil')) {
    category = 'oil';
  } else if (nameLower.includes('essence')) {
    category = 'essence';
  } else if (nameLower.includes('exfoliant') || nameLower.includes('scrub') || nameLower.includes('peel')) {
    category = 'exfoliant';
  }
  
  return {
    id: skincareProduct.id.toString(),
    name: skincareProduct.name,
    brand: skincareProduct.brand,
    description: `${skincareProduct.name} by ${skincareProduct.brand} with ${skincareProduct.ingredient_list.slice(0, 3).join(", ")}...`,
    category,
    imageUrl: getProductImageUrl(skincareProduct.brand, category),
    price,
    rating,
    reviewCount,
    ingredients: skincareProduct.ingredient_list,
    url: `https://www.google.com/search?q=${encodeURIComponent(`${skincareProduct.brand} ${skincareProduct.name}`)}`
  };
};

/**
 * Get a relevant placeholder image URL based on brand and category
 */
const getProductImageUrl = (brand: string, category: string): string => {
  // Use different image sources for different categories/brands
  const brandLower = brand.toLowerCase();
  
  if (brandLower.includes('cerave')) {
    return 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80';
  } else if (brandLower.includes('ordinary')) {
    return 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80';
  } else if (category === 'sunscreen') {
    return 'https://images.unsplash.com/photo-1556229010-6c3f59c9e6e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80';
  } else if (category === 'serum' || category === 'essence') {
    return 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80';
  } else if (category === 'cleanser') {
    return 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80';
  } else {
    // Default skincare image
    return 'https://images.unsplash.com/photo-1556229010-6c3f59c9e6e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80';
  }
}; 