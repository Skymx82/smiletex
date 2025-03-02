import { supabase } from '../client';
import { Product, ProductVariant, Category } from '@/lib/products';

/**
 * Ajoute un nouveau produit dans la base de données
 */
export async function addProduct(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from('products')
    .insert([product])
    .select('id')
    .single();
  
  if (error) {
    console.error('Error adding product:', error);
    return null;
  }
  
  return data;
}

/**
 * Ajoute une variante de produit dans la base de données
 */
export async function addProductVariant(variant: Omit<ProductVariant, 'id' | 'created_at' | 'updated_at'>): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from('product_variants')
    .insert([variant])
    .select('id')
    .single();
  
  if (error) {
    console.error('Error adding product variant:', error);
    return null;
  }
  
  return data;
}

/**
 * Ajoute une nouvelle catégorie dans la base de données
 */
export async function addCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from('categories')
    .insert([category])
    .select('id')
    .single();
  
  if (error) {
    console.error('Error adding category:', error);
    return null;
  }
  
  return data;
}

/**
 * Met à jour un produit existant
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<boolean> {
  const { error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error(`Error updating product ${id}:`, error);
    return false;
  }
  
  return true;
}

/**
 * Met à jour une variante de produit existante
 */
export async function updateProductVariant(id: string, updates: Partial<ProductVariant>): Promise<boolean> {
  const { error } = await supabase
    .from('product_variants')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error(`Error updating product variant ${id}:`, error);
    return false;
  }
  
  return true;
}

/**
 * Supprime un produit et toutes ses variantes
 */
export async function deleteProduct(id: string): Promise<boolean> {
  // Les variantes seront supprimées automatiquement grâce à la contrainte ON DELETE CASCADE
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error deleting product ${id}:`, error);
    return false;
  }
  
  return true;
}

/**
 * Supprime une catégorie
 */
export async function deleteCategory(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error deleting category ${id}:`, error);
    return false;
  }
  
  return true;
}

/**
 * Télécharge une image de produit dans le bucket de stockage
 */
export async function uploadProductImage(file: File, fileName: string): Promise<string | null> {
  try {
    // Vérifier si le bucket existe
    const { data: buckets, error: bucketError } = await supabase.storage
      .listBuckets();
    
    const bucketName = 'product-images';
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    // Si le bucket n'existe pas, essayer de le créer
    if (!bucketExists) {
      try {
        const { error: createError } = await supabase.storage
          .createBucket(bucketName, {
            public: true
          });
        
        if (createError) {
          console.error('Error creating bucket:', createError);
          // Retourner une URL d'image placeholder
          return '/images/placeholder.jpg';
        }
      } catch (err) {
        console.error('Error creating bucket:', err);
        // Retourner une URL d'image placeholder
        return '/images/placeholder.jpg';
      }
    }
    
    // Télécharger le fichier
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading product image:', error);
      // Retourner une URL d'image placeholder
      return '/images/placeholder.jpg';
    }
    
    // Récupérer l'URL publique de l'image
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);
    
    return publicUrl;
  } catch (error) {
    console.error('Unexpected error in uploadProductImage:', error);
    // Retourner une URL d'image placeholder
    return '/images/placeholder.jpg';
  }
}

/**
 * Télécharge une image de produit via l'API locale (alternative à Supabase Storage)
 */
export async function uploadImageViaLocalApi(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading image via local API:', error);
    return '/images/placeholder.jpg';
  }
}
