import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// GET /api/inspirations - Récupérer toutes les inspirations actives
export async function GET(request: NextRequest) {
  try {
    const { data: inspirations, error } = await supabase
      .from('inspirations')
      .select('*')
      .eq('active', true)
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
