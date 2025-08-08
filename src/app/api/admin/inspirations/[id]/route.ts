import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/admin/inspirations/[id] - Récupérer une inspiration spécifique
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const { data: inspiration, error } = await supabase
      .from('inspirations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Erreur lors de la récupération de l\'inspiration:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération de l\'inspiration' },
        { status: 500 }
      );
    }
    
    if (!inspiration) {
      return NextResponse.json(
        { error: 'Inspiration non trouvée' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ inspiration });
  } catch (error: any) {
    console.error('Erreur lors de la récupération de l\'inspiration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'inspiration', details: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/inspirations/[id] - Mettre à jour une inspiration
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
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
      .update({
        title: body.title,
        description: body.description,
        image_url: body.image_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la mise à jour de l\'inspiration:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de l\'inspiration' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ inspiration });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l\'inspiration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'inspiration', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/inspirations/[id] - Mettre à jour partiellement une inspiration (ex: activer/désactiver)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    
    const { data: inspiration, error } = await supabase
      .from('inspirations')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la mise à jour de l\'inspiration:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour de l\'inspiration' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ inspiration });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de l\'inspiration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'inspiration', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/inspirations/[id] - Supprimer une inspiration
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    const { error } = await supabase
      .from('inspirations')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erreur lors de la suppression de l\'inspiration:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'inspiration' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erreur lors de la suppression de l\'inspiration:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'inspiration', details: error.message },
      { status: 500 }
    );
  }
}
