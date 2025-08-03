import { 
  addProduct, 
  addProductVariant, 
  uploadProductImage, 
  addProductImage 
} from '@/lib/supabase/services/adminService';
import { v4 as uuidv4 } from 'uuid';

// Types
export interface ProductData {
  name: string;
  description: string;
  base_price: number;
  weight_gsm: number | null;
  supplier_reference: string;
  material: string;
  is_featured: boolean;
  is_new: boolean;
  category_id: string;
  image_url?: string; // Champ requis par l'API
}

export interface VariantData {
  product_id: string;
  size: string;
  color: string | null;
  color_url?: string;
  stock_quantity: number;
  price_adjustment: number;
  sku: string;
}

export interface ImageData {
  url: string;
  is_primary: boolean;
  product_id: string;
  variant_id?: string;
}

/**
 * Ajoute un produit dans la base de données
 */
export async function createProduct(productData: ProductData) {
  try {
    console.log('Tentative de création du produit:', productData);
    
    // Ajouter une URL d'image vide si non fournie
    const productToAdd = {
      ...productData,
      image_url: productData.image_url || ''
    };
    
    console.log('Appel de addProduct avec:', productToAdd);
    const newProduct = await addProduct(productToAdd);
    
    if (!newProduct) {
      console.error('addProduct a retourné null, échec silencieux');
      return { 
        success: false, 
        error: 'Le produit n\'a pas pu être créé dans la base de données' 
      };
    }
    
    console.log('Produit créé avec succès:', newProduct);
    return { success: true, product: newProduct };
  } catch (error: any) {
    console.error('Erreur lors de la création du produit:', error);
    return { 
      success: false, 
      error: `Erreur lors de la création du produit: ${error?.message || 'Erreur inconnue'}` 
    };
  }
}

/**
 * Ajoute une variante de produit dans la base de données
 */
export async function createVariant(variantData: VariantData) {
  try {
    console.log('Tentative de création de la variante:', variantData);
    
    const newVariant = await addProductVariant(variantData);
    
    if (!newVariant) {
      console.error('addProductVariant a retourné null, échec silencieux');
      return { 
        success: false, 
        error: 'La variante n\'a pas pu être créée dans la base de données' 
      };
    }
    
    console.log('Variante créée avec succès:', newVariant);
    return { success: true, variant: newVariant };
  } catch (error: any) {
    console.error('Erreur lors de la création de la variante:', error);
    return { 
      success: false, 
      error: `Erreur lors de la création de la variante: ${error?.message || 'Erreur inconnue'}` 
    };
  }
}

/**
 * Ajoute une image depuis une URL externe directement dans la base de données
 */
export async function addImageFromUrl(
  imageUrl: string,
  productId: string,
  variantId: string | undefined,
  isPrimary: boolean
) {
  try {
    console.log(`Tentative d'ajout d'image depuis URL externe: ${imageUrl}`);
    console.log(`Pour le produit: ${productId}, variante: ${variantId || 'aucune'}, isPrimary: ${isPrimary}`);
    
    // Vérifier que l'URL est accessible (optionnel)
    try {
      const response = await fetch(imageUrl, { method: 'HEAD' });
      if (!response.ok) {
        console.warn(`L'URL de l'image pourrait ne pas être accessible: ${response.status} ${response.statusText}`);
        // On continue quand même, car l'URL pourrait être temporairement inaccessible
      }
    } catch (fetchError) {
      console.warn(`Impossible de vérifier l'URL de l'image: ${fetchError}`);
      // On continue quand même, car l'erreur pourrait être temporaire
    }
    
    // Ajouter directement l'entrée dans la table product_images avec l'URL externe
    const imageData = {
      product_id: productId,
      variant_id: variantId,
      image_url: imageUrl, // Utiliser directement l'URL externe
      is_primary: isPrimary
    };
    
    console.log('Tentative d\'ajout dans la table product_images:', imageData);
    const addedImage = await addProductImage(imageData);
    
    if (!addedImage) {
      console.error('addProductImage a retourné null, échec silencieux');
      return { 
        success: false, 
        error: 'L\'image n\'a pas pu être ajoutée dans la base de données' 
      };
    }
    
    console.log('Image ajoutée avec succès:', addedImage);
    return { 
      success: true, 
      image: addedImage 
    };
    
  } catch (error: any) {
    console.error('Erreur lors de l\'ajout de l\'image:', error);
    return { 
      success: false, 
      error: `Erreur lors de l'ajout de l'image: ${error?.message || 'Erreur inconnue'}` 
    };
  }
}
