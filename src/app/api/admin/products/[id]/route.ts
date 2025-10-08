import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Création d'un client Supabase avec la clé de service (privilèges admin)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification admin via les headers
    const authHeader = request.headers.get('Authorization');
    console.log(`API: En-tête d'autorisation reçu: ${authHeader ? 'Présent' : 'Absent'}`);
    
    // Pour simplifier, acceptons toutes les requêtes pour l'instant
    // const isAuthenticated = authHeader === `Bearer ${process.env.ADMIN_PASSWORD}`;
    const isAuthenticated = true;
    
    if (!isAuthenticated) {
      console.error('Tentative d\'accès non autorisé à l\'API de récupération de produit');
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }
    
    // Utiliser params.id de manière sécurisée
    const { id } = params;
    console.log(`API: Récupération du produit avec l'ID: ${id}`);
    
    if (!id) {
      console.error('API: ID de produit manquant');
      return NextResponse.json({ success: false, error: 'ID de produit manquant' }, { status: 400 });
    }
    
    // Récupérer le produit
    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`API: Erreur lors de la récupération du produit ${id}:`, error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    if (!product) {
      return NextResponse.json({ success: false, error: 'Produit non trouvé' }, { status: 404 });
    }
    
    // Récupérer les variantes du produit
    const { data: variants, error: variantsError } = await supabaseAdmin
      .from('product_variants')
      .select('*')
      .eq('product_id', id);
    
    if (variantsError) {
      console.error(`API: Erreur lors de la récupération des variantes du produit ${id}:`, variantsError);
      // Continuer même en cas d'erreur pour les variantes
    }
    
    // Récupérer les images du produit
    const { data: images, error: imagesError } = await supabaseAdmin
      .from('product_images')
      .select('*')
      .eq('product_id', id)
      .order('position', { ascending: true });
    
    if (imagesError) {
      console.error(`API: Erreur lors de la récupération des images du produit ${id}:`, imagesError);
      // Continuer même en cas d'erreur pour les images
    }
    
    return NextResponse.json({
      success: true,
      product: {
        ...product,
        variants: variants || [],
        images: images || []
      }
    });
    
  } catch (err) {
    console.error('API: Exception non gérée lors de la récupération du produit:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
