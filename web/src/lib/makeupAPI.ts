// API service for accessing the Makeup API
// Based on http://makeup-api.herokuapp.com/

const API_BASE_URL = 'https://makeup-api.herokuapp.com/api/v1/products.json';

export interface MakeupProduct {
  id: number;
  brand: string;
  name: string;
  price: string;
  price_sign?: string;
  currency?: string;
  image_link: string;
  product_link: string;
  website_link: string;
  description: string;
  rating?: number;
  category?: string;
  product_type: string;
  tag_list: string[];
  created_at: string;
  updated_at: string;
  product_api_url: string;
  api_featured_image: string;
  product_colors: {
    hex_value: string;
    colour_name?: string;
  }[];
}

/**
 * Fetch all products from the Makeup API
 * @returns Promise containing an array of products
 */
export const getAllProducts = async (): Promise<MakeupProduct[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}`);
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
 * Search for products by brand
 * @param brand Brand name
 * @returns Promise containing an array of matching products
 */
export const getProductsByBrand = async (brand: string): Promise<MakeupProduct[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}?brand=${encodeURIComponent(brand.toLowerCase())}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching products for brand ${brand}:`, error);
    return [];
  }
};

/**
 * Search for products by product type
 * @param productType Product type (e.g., "lipstick", "foundation")
 * @returns Promise containing an array of matching products
 */
export const getProductsByType = async (productType: string): Promise<MakeupProduct[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}?product_type=${encodeURIComponent(productType.toLowerCase())}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching products of type ${productType}:`, error);
    return [];
  }
};

/**
 * Search for products by tag (e.g., "vegan", "natural")
 * @param tag Product tag
 * @returns Promise containing an array of matching products
 */
export const getProductsByTag = async (tag: string): Promise<MakeupProduct[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}?product_tags=${encodeURIComponent(tag.toLowerCase())}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching products with tag ${tag}:`, error);
    return [];
  }
};

/**
 * Search for products with a combination of parameters
 * @param params Object containing search parameters
 * @returns Promise containing an array of matching products
 */
export const searchProducts = async (
  params: {
    brand?: string;
    productType?: string;
    category?: string;
    tags?: string[];
    priceGreaterThan?: number;
    priceLessThan?: number;
    ratingGreaterThan?: number;
    ratingLessThan?: number;
  }
): Promise<MakeupProduct[]> => {
  try {
    const queryParams = [];
    
    if (params.brand) {
      queryParams.push(`brand=${encodeURIComponent(params.brand.toLowerCase())}`);
    }
    
    if (params.productType) {
      queryParams.push(`product_type=${encodeURIComponent(params.productType.toLowerCase())}`);
    }
    
    if (params.category) {
      queryParams.push(`product_category=${encodeURIComponent(params.category.toLowerCase())}`);
    }
    
    if (params.tags && params.tags.length > 0) {
      queryParams.push(`product_tags=${params.tags.map(tag => encodeURIComponent(tag.toLowerCase())).join(',')}`);
    }
    
    if (params.priceGreaterThan !== undefined) {
      queryParams.push(`price_greater_than=${params.priceGreaterThan}`);
    }
    
    if (params.priceLessThan !== undefined) {
      queryParams.push(`price_less_than=${params.priceLessThan}`);
    }
    
    if (params.ratingGreaterThan !== undefined) {
      queryParams.push(`rating_greater_than=${params.ratingGreaterThan}`);
    }
    
    if (params.ratingLessThan !== undefined) {
      queryParams.push(`rating_less_than=${params.ratingLessThan}`);
    }
    
    const url = `${API_BASE_URL}${queryParams.length > 0 ? '?' + queryParams.join('&') : ''}`;
    const response = await fetch(url);
    
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
 * Convert a MakeupProduct to our app's Product format
 */
export const convertToAppProduct = (makeupProduct: MakeupProduct) => {
  // Parse price from string to number, default to random price if not available
  const price = makeupProduct.price 
    ? parseFloat(makeupProduct.price) 
    : Math.floor(Math.random() * 4500 + 500) / 100;
  
  // Extract skin concerns based on tags
  const skinConcerns: string[] = [];
  if (makeupProduct.tag_list) {
    if (makeupProduct.tag_list.some(tag => 
      tag.toLowerCase().includes('oil free') || 
      tag.toLowerCase().includes('matte'))) {
      skinConcerns.push('oiliness');
    }
    
    if (makeupProduct.tag_list.some(tag => 
      tag.toLowerCase().includes('hydrating') || 
      tag.toLowerCase().includes('moisturizing'))) {
      skinConcerns.push('dryness');
    }
    
    if (makeupProduct.tag_list.some(tag => 
      tag.toLowerCase().includes('hypoallergenic') || 
      tag.toLowerCase().includes('sensitive'))) {
      skinConcerns.push('sensitivity');
    }
  }
  
  // Map product type to our category
  const category = mapProductTypeToCategory(makeupProduct.product_type);
  
  return {
    id: makeupProduct.id.toString(),
    name: makeupProduct.name,
    brand: makeupProduct.brand,
    description: makeupProduct.description || `${makeupProduct.name} by ${makeupProduct.brand}`,
    category,
    imageUrl: makeupProduct.image_link || getFallbackImageUrl(category),
    price,
    rating: makeupProduct.rating || (Math.floor(Math.random() * 15) + 35) / 10,
    reviewCount: Math.floor(Math.random() * 4900 + 100),
    ingredients: makeupProduct.tag_list,
    url: makeupProduct.product_link || makeupProduct.website_link,
    skinConcerns,
    colors: makeupProduct.product_colors,
  };
};

/**
 * Map product type from the API to our app's categories
 */
const mapProductTypeToCategory = (productType: string): string => {
  const typeMap: Record<string, string> = {
    'lipstick': 'lip',
    'lip_liner': 'lip',
    'lip gloss': 'lip',
    'lip stain': 'lip',
    'foundation': 'face',
    'blush': 'face',
    'bronzer': 'face',
    'concealer': 'face',
    'contour': 'face',
    'highlighter': 'face',
    'eyeshadow': 'eye',
    'eyeliner': 'eye',
    'eyebrow': 'eye',
    'mascara': 'eye',
    'nail_polish': 'nail',
  };
  
  return typeMap[productType.toLowerCase()] || 'skincare';
};

/**
 * Get a relevant fallback image URL based on category
 */
const getFallbackImageUrl = (category: string): string => {
  const fallbackImages: Record<string, string> = {
    'lip': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    'face': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    'eye': 'https://images.unsplash.com/photo-1583241801138-a172949167e6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    'nail': 'https://images.unsplash.com/photo-1579298245158-33e8f568f7d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
    'skincare': 'https://images.unsplash.com/photo-1556229010-6c3f59c9e6e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300&q=80',
  };
  
  return fallbackImages[category] || fallbackImages.skincare;
};

/**
 * Get a product type that best matches the search term or skin concern
 */
export const getBestProductTypeForSearch = (searchTerm: string): string | undefined => {
  const searchTermLower = searchTerm.toLowerCase();
  
  // Map skin concerns to product types
  if (searchTermLower.includes('acne') || searchTermLower.includes('blemish')) {
    return 'foundation';
  }
  
  if (searchTermLower.includes('dry') || searchTermLower.includes('hydrat')) {
    return 'foundation';
  }
  
  if (searchTermLower.includes('sensitive')) {
    return 'foundation';
  }
  
  if (searchTermLower.includes('lip') || searchTermLower.includes('mouth')) {
    return 'lipstick';
  }
  
  if (searchTermLower.includes('eye') || searchTermLower.includes('lash')) {
    return 'mascara';
  }
  
  if (searchTermLower.includes('nail') || searchTermLower.includes('polish')) {
    return 'nail_polish';
  }
  
  if (searchTermLower.includes('face') || searchTermLower.includes('foundation')) {
    return 'foundation';
  }
  
  if (searchTermLower.includes('blush') || searchTermLower.includes('cheek')) {
    return 'blush';
  }
  
  return undefined;
};

/**
 * Get product types available in the API
 */
export const getProductTypes = (): string[] => {
  return [
    'blush',
    'bronzer',
    'eyebrow',
    'eyeliner',
    'eyeshadow',
    'foundation',
    'lip_liner',
    'lipstick',
    'mascara',
    'nail_polish'
  ];
};

/**
 * Get popular tags from the API
 */
export const getPopularTags = (): string[] => {
  return [
    'Vegan',
    'Natural',
    'Gluten Free',
    'Canadian',
    'Organic',
    'Cruelty Free',
    'Oil Free',
    'Hypoallergenic',
    'No Talc',
    'Purpicks',
    'EWG Verified',
    'Silicone Free',
    'Water Free',
    'Alcohol Free'
  ];
};

/**
 * Get popular brands from the API
 */
export const getPopularBrands = (): string[] => {
  return [
    'maybelline',
    'covergirl',
    'nyx',
    'revlon',
    'l\'oreal',
    'milani',
    'essie',
    'e.l.f.',
    'almay',
    'physicians formula',
    'wet n wild'
  ];
}; 