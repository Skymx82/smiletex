import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// GET /api/admin/inspirations - Récupérer toutes les inspirations (admin)
export async function GET(request: NextRequest) {
  try {
    const { data: inspirations, error } = await supabase
      .from('inspirations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des inspirations:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des inspirations' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ inspirations });
  } catch (error: any) {
    console.error('Erreur lors de la récupération des inspirations:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des inspirations', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/inspirations - Créer une nouvelle inspiration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    if (!body.title || !body.image_url) {
      return NextResponse.json(
        { error: 'Le titre et l\'image sont requis' },
        { status: 400 }
      );
    }

    const { data: inspiration, error } = await supabase
      .from('inspirations')
      .insert({
        title: body.title,
        description: body.description,
        image_url: body.image_url,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la création de l\'inspiration:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'inspiration' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ inspiration }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur lors de la création de l\'inspiration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'inspiration', details: error.message },
      { status: 500 }
    );
  }
}
