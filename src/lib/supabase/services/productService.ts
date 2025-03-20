import { supabase } from '../client';
import { Product, ProductVariant, Category } from '@/lib/products';

export async function fetchAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*');
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return data || [];
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    return null;
  }
  
  return data;
}

export async function fetchProductVariants(productId: string): Promise<ProductVariant[]> {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId);
  
  if (error) {
    console.error(`Error fetching variants for product ${productId}:`, error);
    return [];
  }
  
  return data || [];
}

export async function fetchCategories(parentIdFilter?: boolean): Promise<Category[]> {
  let query = supabase
    .from('categories')
    .select('*');
    
  // Si parentIdFilter est true, ne récupérer que les catégories principales (sans parent_id)
  if (parentIdFilter) {
    query = query.is('parent_id', null);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  
  return data || [];
}

// Récupérer une catégorie par son ID
export async function fetchCategoryById(id: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching category with id ${id}:`, error);
    return null;
  }
  
  return data;
}

// Récupérer toutes les sous-catégories d'une catégorie parent
export async function fetchSubcategories(parentId: string): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parentId);
  
  if (error) {
    console.error(`Error fetching subcategories for parent ${parentId}:`, error);
    return [];
  }
  
  return data || [];
}

// Récupérer le chemin complet d'une catégorie (catégorie -> parent -> grand-parent...)
export async function fetchCategoryPath(categoryId: string): Promise<Category[]> {
  const path: Category[] = [];
  let currentCategoryId = categoryId;
  
  while (currentCategoryId) {
    const category = await fetchCategoryById(currentCategoryId);
    
    if (!category) break;
    
    path.unshift(category); // Ajouter au début du tableau pour avoir le chemin dans l'ordre
    
    if (!category.parent_id) break;
    
    currentCategoryId = category.parent_id;
  }
  
  return path;
}

export async function fetchProductsByCategory(categoryId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId);
  
  if (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    return [];
  }
  
  return data || [];
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true);
  
  if (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
  
  return data || [];
}

export async function fetchNewProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_new', true);
  
  if (error) {
    console.error('Error fetching new products:', error);
    return [];
  }
  
  return data || [];
}

export async function updateProductStock(variantId: string, quantityChange: number): Promise<boolean> {
  // D'abord, récupérer la quantité actuelle
  const { data: variant, error: fetchError } = await supabase
    .from('product_variants')
    .select('stock_quantity')
    .eq('id', variantId)
    .single();
  
  if (fetchError || !variant) {
    console.error(`Error fetching stock for variant ${variantId}:`, fetchError);
    return false;
  }
  
  // Calculer la nouvelle quantité
  const newQuantity = variant.stock_quantity + quantityChange;
  
  // S'assurer que la quantité ne devient pas négative
  if (newQuantity < 0) {
    console.error(`Cannot update stock: would result in negative quantity for variant ${variantId}`);
    return false;
  }
  
  // Mettre à jour la quantité
  const { error: updateError } = await supabase
    .from('product_variants')
    .update({ stock_quantity: newQuantity })
    .eq('id', variantId);
  
  if (updateError) {
    console.error(`Error updating stock for variant ${variantId}:`, updateError);
    return false;
  }
  
  return true;
}

// Fonction pour vérifier si un produit est en stock
export async function checkProductStock(variantId: string, requestedQuantity: number = 1): Promise<boolean> {
  const { data, error } = await supabase
    .from('product_variants')
    .select('stock_quantity')
    .eq('id', variantId)
    .single();
  
  if (error || !data) {
    console.error(`Error checking stock for variant ${variantId}:`, error);
    return false;
  }
  
  return data.stock_quantity >= requestedQuantity;
}
