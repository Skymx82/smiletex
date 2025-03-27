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
      console.error('Tentative d\'accès non autorisé à l\'API de création de fonctions');
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }
    
    // Créer les fonctions RPC pour la suppression forcée
    
    // 1. Fonction pour supprimer les variantes de produit de force
    const forceDeleteVariantsQuery = `
      CREATE OR REPLACE FUNCTION force_delete_variants(product_id uuid)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        -- Supprimer d'abord les références dans order_items
        DELETE FROM order_items
        WHERE product_variant_id IN (
          SELECT id FROM product_variants WHERE product_id = $1
        );
        
        -- Supprimer les références dans cart_items
        DELETE FROM cart_items
        WHERE product_variant_id IN (
          SELECT id FROM product_variants WHERE product_id = $1
        );
        
        -- Supprimer les variantes
        DELETE FROM product_variants
        WHERE product_id = $1;
      END;
      $$;
    `;
    
    // 2. Fonction pour supprimer un produit de force
    const forceDeleteProductQuery = `
      CREATE OR REPLACE FUNCTION force_delete_product(product_id uuid)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        -- Supprimer les références dans cart_items
        DELETE FROM cart_items
        WHERE product_id = $1;
        
        -- Supprimer le produit
        DELETE FROM products
        WHERE id = $1;
      END;
      $$;
    `;
    
    // Exécuter les requêtes SQL
    try {
      // Créer la fonction force_delete_variants
      await supabaseAdmin.rpc('force_delete_variants', { product_id: '00000000-0000-0000-0000-000000000000' });
    } catch (err) {
      // Si la fonction n'existe pas, la créer
      console.log('Création de la fonction force_delete_variants...');
      const { error: error1 } = await supabaseAdmin.from('_sqlQueries').select('*').eq('id', 'force_delete_variants').single();
      
      if (error1) {
        // Exécuter la requête SQL directement via un endpoint personnalisé
        const response1 = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY as string,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({ sql: forceDeleteVariantsQuery })
        });
        
        if (!response1.ok) {
          console.error('Erreur lors de la création de force_delete_variants:', await response1.text());
        }
      }
    }
    
    try {
      // Créer la fonction force_delete_product
      await supabaseAdmin.rpc('force_delete_product', { product_id: '00000000-0000-0000-0000-000000000000' });
    } catch (err) {
      // Si la fonction n'existe pas, la créer
      console.log('Création de la fonction force_delete_product...');
      const { error: error2 } = await supabaseAdmin.from('_sqlQueries').select('*').eq('id', 'force_delete_product').single();
      
      if (error2) {
        // Exécuter la requête SQL directement via un endpoint personnalisé
        const response2 = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY as string,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
          },
          body: JSON.stringify({ sql: forceDeleteProductQuery })
        });
        
        if (!response2.ok) {
          console.error('Erreur lors de la création de force_delete_product:', await response2.text());
        }
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Fonctions de suppression forcée créées avec succès' 
    });
    
  } catch (err) {
    console.error('API: Exception non gérée lors de la création des fonctions:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
