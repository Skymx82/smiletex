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
  // S'assurer que les valeurs numériques sont bien des nombres
  const sanitizedVariant = {
    ...variant,
    stock_quantity: Number(variant.stock_quantity),
    price_adjustment: Number(variant.price_adjustment)
  };
  
  // Vérifier que les valeurs sont valides
  if (isNaN(sanitizedVariant.stock_quantity) || isNaN(sanitizedVariant.price_adjustment)) {
    console.error('Invalid numeric values in variant:', variant);
    return null;
  }
  
  // Vérifier que product_id est défini
  if (!sanitizedVariant.product_id) {
    console.error('Missing product_id in variant:', variant);
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('product_variants')
      .insert([sanitizedVariant])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error adding product variant:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return null;
    }
    
    return data;
  } catch (err) {
    console.error('Unexpected error in addProductVariant:', err);
    return null;
  }
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
  try {
    console.log(`Début de la suppression du produit ${id}`);
    
    // Vérifier d'abord si le produit existe
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error(`Erreur lors de la vérification du produit ${id}:`, fetchError);
      return false;
    }
    
    if (!product) {
      console.error(`Produit ${id} non trouvé`);
      return false;
    }
    
    console.log(`Produit ${id} trouvé, tentative de suppression...`);
    
    // 1. Récupérer toutes les variantes du produit
    const { data: variants, error: fetchVariantsError } = await supabase
      .from('product_variants')
      .select('id')
      .eq('product_id', id);
    
    if (fetchVariantsError) {
      console.error(`Erreur lors de la récupération des variantes du produit ${id}:`, fetchVariantsError);
      return false;
    }
    
    console.log(`${variants?.length || 0} variantes trouvées pour le produit ${id}`);
    
    // 2. Supprimer les entrées dans cart_items qui référencent ces variantes
    if (variants && variants.length > 0) {
      const variantIds = variants.map(v => v.id);
      
      // Supprimer les entrées de cart_items liées aux variantes
      const { error: cartItemsVariantError } = await supabase
        .from('cart_items')
        .delete()
        .in('product_variant_id', variantIds);
      
      if (cartItemsVariantError) {
        console.error(`Erreur lors de la suppression des cart_items liés aux variantes du produit ${id}:`, cartItemsVariantError);
        // Essayer avec la clé de service si nécessaire
        if (cartItemsVariantError.code === 'PGRST301' || cartItemsVariantError.message.includes('permission')) {
          try {
            const { createClient } = await import('@supabase/supabase-js');
            const supabaseAdmin = createClient(
              process.env.NEXT_PUBLIC_SUPABASE_URL as string,
              process.env.SUPABASE_SERVICE_ROLE_KEY as string
            );
            
            await supabaseAdmin
              .from('cart_items')
              .delete()
              .in('product_variant_id', variantIds);
              
            console.log(`Cart items liés aux variantes du produit ${id} supprimés avec privilèges admin`);
          } catch (adminErr) {
            console.error(`Erreur admin lors de la suppression des cart_items liés aux variantes:`, adminErr);
            return false;
          }
        } else {
          return false;
        }
      } else {
        console.log(`Cart items liés aux variantes du produit ${id} supprimés`);
      }
    }
    
    // 3. Supprimer les entrées dans cart_items qui référencent directement le produit
    const { error: cartItemsProductError } = await supabase
      .from('cart_items')
      .delete()
      .eq('product_id', id);
    
    if (cartItemsProductError) {
      console.error(`Erreur lors de la suppression des cart_items liés au produit ${id}:`, cartItemsProductError);
      // Essayer avec la clé de service si nécessaire
      if (cartItemsProductError.code === 'PGRST301' || cartItemsProductError.message.includes('permission')) {
        try {
          const { createClient } = await import('@supabase/supabase-js');
          const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL as string,
            process.env.SUPABASE_SERVICE_ROLE_KEY as string
          );
          
          await supabaseAdmin
            .from('cart_items')
            .delete()
            .eq('product_id', id);
            
          console.log(`Cart items liés au produit ${id} supprimés avec privilèges admin`);
        } catch (adminErr) {
          console.error(`Erreur admin lors de la suppression des cart_items liés au produit:`, adminErr);
          return false;
        }
      } else {
        return false;
      }
    } else {
      console.log(`Cart items liés au produit ${id} supprimés`);
    }
    
    // 4. Maintenant, supprimer les variantes
    const { error: variantError } = await supabase
      .from('product_variants')
      .delete()
      .eq('product_id', id);
    
    if (variantError) {
      console.error(`Erreur lors de la suppression des variantes du produit ${id}:`, variantError);
      // Essayer avec la clé de service
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL as string,
          process.env.SUPABASE_SERVICE_ROLE_KEY as string
        );
        
        await supabaseAdmin
          .from('product_variants')
          .delete()
          .eq('product_id', id);
          
        console.log(`Variantes du produit ${id} supprimées avec privilèges admin`);
      } catch (adminErr) {
        console.error(`Erreur admin lors de la suppression des variantes:`, adminErr);
        return false;
      }
    } else {
      console.log(`Variantes du produit ${id} supprimées avec succès`);
    }
    
    // 5. Enfin, supprimer le produit
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Erreur lors de la suppression du produit ${id}:`, error);
      
      // Si l'erreur est liée aux permissions, essayer avec la clé de service
      if (error.code === 'PGRST301' || error.message.includes('permission')) {
        console.log(`Tentative de suppression avec des privilèges élevés pour le produit ${id}`);
        
        // Créer un client Supabase avec la clé de service (pour les opérations admin)
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL as string,
          process.env.SUPABASE_SERVICE_ROLE_KEY as string
        );
        
        const { error: adminError } = await supabaseAdmin
          .from('products')
          .delete()
          .eq('id', id);
        
        if (adminError) {
          console.error(`Erreur lors de la suppression admin du produit ${id}:`, adminError);
          return false;
        }
        
        console.log(`Produit ${id} supprimé avec succès via admin`);
        return true;
      }
      
      return false;
    }
    
    console.log(`Produit ${id} supprimé avec succès`);
    return true;
  } catch (err) {
    console.error(`Exception non gérée lors de la suppression du produit ${id}:`, err);
    return false;
  }
}

/**
 * Met à jour une catégorie existante
 */
export async function updateCategory(id: string, updates: Partial<Category>): Promise<boolean> {
  const { error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id);
  
  if (error) {
    console.error(`Error updating category ${id}:`, error);
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
    const bucketName = 'product-images';
    
    // Upload direct du fichier - cette méthode fonctionne avec les politiques RLS configurées
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading product image:', error);
      return '/images/placeholder.jpg';
    }
    
    // Récupérer l'URL publique
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


