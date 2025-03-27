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
    // Pour simplifier, acceptons toutes les requêtes pour l'instant
    const isAuthenticated = true;
    
    if (!isAuthenticated) {
      console.error('Tentative d\'accès non autorisé à l\'API de récupération de catégorie');
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }
    
    const id = params.id;
    console.log(`API: Récupération de la catégorie avec l'ID: ${id}`);
    
    if (!id) {
      console.error('API: ID de catégorie manquant');
      return NextResponse.json({ success: false, error: 'ID de catégorie manquant' }, { status: 400 });
    }
    
    // Récupérer la catégorie
    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`API: Erreur lors de la récupération de la catégorie ${id}:`, error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    if (!category) {
      return NextResponse.json({ success: false, error: 'Catégorie non trouvée' }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      category
    });
    
  } catch (err) {
    console.error('API: Exception non gérée lors de la récupération de la catégorie:', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}
