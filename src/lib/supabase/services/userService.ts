import { supabase } from '@/lib/supabase/client';

export type CustomerProfile = {
  id: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  created_at?: string;
  updated_at?: string;
};

/**
 * Récupère le profil client depuis Supabase
 * @param userId ID de l'utilisateur
 * @returns Profil client ou null si non trouvé
 */
export async function fetchCustomerProfile(userId: string): Promise<CustomerProfile | null> {
  const { data, error } = await supabase
    .from('customer_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Erreur lors de la récupération du profil client:', error);
    return null;
  }

  return data;
}

/**
 * Crée ou met à jour un profil client dans Supabase
 * @param profile Données du profil client
 * @returns Profil mis à jour ou null en cas d'erreur
 */
export async function upsertCustomerProfile(profile: CustomerProfile): Promise<CustomerProfile | null> {
  const { data, error } = await supabase
    .from('customer_profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de la mise à jour du profil client:', error);
    return null;
  }

  return data;
}
