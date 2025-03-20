import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Vérifier si l'utilisateur est connecté et est un admin
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    
    // Vérifier si l'utilisateur a un rôle admin (à adapter selon votre logique d'autorisation)
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();
      
    if (!userRole || userRole.role !== 'admin') {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    
    // Récupérer les utilisateurs depuis la table auth.users via RPC (nécessite une fonction SQL)
    // Alternativement, vous pouvez récupérer directement les profils clients
    const { data: profiles, error } = await supabase
      .from('customer_profiles')
      .select('*');
      
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ profiles });
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
