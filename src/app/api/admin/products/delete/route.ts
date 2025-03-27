import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Création d'un client Supabase avec la clé de service (privilèges admin)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin via les headers
    const authHeader = request.headers.get('Authorization');
    const isAuthenticated = authHeader === `Bearer ${process.env.ADMIN_PASSWORD}`;
    
    if (!isAuthenticated) {
      console.error('Tentative d\'accès non autorisé à l\'API de suppression de produit');
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }
    
    // Récupérer l'ID du produit à supprimer
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID de produit manquant' }, { status: 400 });
    }
    
    console.log(`API: Début de la suppression du produit ${id}`);
    
    // Vérifier d'abord si le produit existe
    const { data: product, error: fetchError } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error(`API: Erreur lors de la vérification du produit ${id}:`, fetchError);
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 404 });
    }
    
    if (!product) {
      console.error(`API: Produit ${id} non trouvé`);
      return NextResponse.json({ success: false, error: 'Produit non trouvé' }, { status: 404 });
    }
    
    // 1. D'abord, récupérer toutes les variantes du produit
    const { data: variants, error: fetchVariantsError } = await supabaseAdmin
      .from('product_variants')
      .select('id')
      .eq('product_id', id);
    
    if (fetchVariantsError) {
      console.error(`API: Erreur lors de la récupération des variantes du produit ${id}:`, fetchVariantsError);
      return NextResponse.json({ success: false, error: fetchVariantsError.message }, { status: 500 });
    }
    
    console.log(`API: ${variants?.length || 0} variantes trouvées pour le produit ${id}`);
    
    // 2. Supprimer les entrées dans cart_items qui référencent ces variantes
    if (variants && variants.length > 0) {
      const variantIds = variants.map(v => v.id);
      
      // Supprimer les entrées de cart_items liées aux variantes
      const { error: cartItemsVariantError } = await supabaseAdmin
        .from('cart_items')
        .delete()
        .in('product_variant_id', variantIds);
      
      if (cartItemsVariantError) {
        console.error(`API: Erreur lors de la suppression des cart_items liés aux variantes du produit ${id}:`, cartItemsVariantError);
        // Continuer même en cas d'erreur
      } else {
        console.log(`API: Cart items liés aux variantes du produit ${id} supprimés`);
      }
      
      // Supprimer les références dans order_items
      const { error: orderItemsError } = await supabaseAdmin
        .from('order_items')
        .delete()
        .in('product_variant_id', variantIds);
      
      if (orderItemsError) {
        console.error(`API: Erreur lors de la suppression des order_items liés aux variantes du produit ${id}:`, orderItemsError);
        // Continuer même en cas d'erreur
      } else {
        console.log(`API: Order items liés aux variantes du produit ${id} supprimés`);
      }
    }
    
    // 3. Supprimer les entrées dans cart_items qui référencent directement le produit
    const { error: cartItemsProductError } = await supabaseAdmin
      .from('cart_items')
      .delete()
      .eq('product_id', id);
    
    if (cartItemsProductError) {
      console.error(`API: Erreur lors de la suppression des cart_items liés au produit ${id}:`, cartItemsProductError);
      // Continuer même en cas d'erreur
    } else {
      console.log(`API: Cart items liés au produit ${id} supprimés`);
    }
    
    // 4. Maintenant, supprimer les variantes
    const { error: variantError } = await supabaseAdmin
      .from('product_variants')
      .delete()
      .eq('product_id', id);
    
    if (variantError) {
      console.error(`API: Erreur lors de la suppression des variantes du produit ${id}:`, variantError);
      // Forcer la suppression en ignorant les contraintes (DANGEREUX mais efficace)
      try {
        // Exécuter une requête SQL directe pour forcer la suppression
        const { error: forceDeleteError } = await supabaseAdmin.rpc('force_delete_variants', { product_id: id });
        if (forceDeleteError) {
          console.error(`API: Échec de la suppression forcée des variantes:`, forceDeleteError);
          // Continuer quand même pour essayer de supprimer le produit
        } else {
          console.log(`API: Variantes du produit ${id} supprimées de force`);
        }
      } catch (err) {
        console.error(`API: Exception lors de la suppression forcée des variantes:`, err);
        // Continuer quand même
      }
    } else {
      console.log(`API: Variantes du produit ${id} supprimées`);
    }
    
    // 5. Enfin, supprimer le produit
    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`API: Erreur lors de la suppression du produit ${id}:`, error);
      // Forcer la suppression en ignorant les contraintes (DANGEREUX mais efficace)
      try {
        // Exécuter une requête SQL directe pour forcer la suppression
        const { error: forceDeleteError } = await supabaseAdmin.rpc('force_delete_product', { product_id: id });
        if (forceDeleteError) {
          console.error(`API: Échec de la suppression forcée du produit:`, forceDeleteError);
          return NextResponse.json({ success: false, error: 'Impossible de supprimer le produit même avec une méthode forcée' }, { status: 500 });
        } else {
          console.log(`API: Produit ${id} supprimé de force`);
          return NextResponse.json({ success: true });
        }
      } catch (err) {
        console.error(`API: Exception lors de la suppression forcée du produit:`, err);
        return NextResponse.json({ success: false, error: 'Exception lors de la suppression forcée' }, { status: 500 });
      }
    }
    
    console.log(`API: Produit ${id} supprimé avec succès`);
    return NextResponse.json({ success: true });
    
  } catch (err) {
    console.error('API: Exception non gérée lors de la suppression du produit:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
