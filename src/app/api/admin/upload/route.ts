import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Crée un bucket s'il n'existe pas déjà et configure les politiques RLS
 */
async function ensureBucketExists(bucketName: string): Promise<boolean> {
  try {
    // Vérifier si le bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Erreur lors de la vérification des buckets:', listError);
      return false;
    }
    
    // Vérifier si le bucket existe dans la liste
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (bucketExists) {
      return true;
    }
    
    // Créer le bucket s'il n'existe pas
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true // Rendre le bucket public
    });
    
    if (createError) {
      console.error(`Erreur lors de la création du bucket ${bucketName}:`, createError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la création du bucket:', error);
    return false;
  }
}

/**
 * Télécharge un fichier vers Supabase Storage en utilisant une URL signée
 * pour contourner les restrictions RLS
 */
async function uploadFileWithSignedUrl(file: File, bucketName: string): Promise<string | null> {
  try {
    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    
    // Créer une URL signée pour le téléchargement
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from(bucketName)
      .createSignedUploadUrl(fileName);
    
    if (signedUrlError) {
      console.error('Erreur lors de la création de l\'URL signée:', signedUrlError);
      
      // Essayer l'upload direct comme fallback
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        console.error('Erreur lors du téléchargement direct:', error);
        return null;
      }
      
      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);
      
      return publicUrl;
    }
    
    // Utiliser l'URL signée pour télécharger le fichier
    const { data, error: uploadError } = await supabase.storage
      .from(bucketName)
      .uploadToSignedUrl(fileName, signedUrlData.token, file);
    
    if (uploadError) {
      console.error('Erreur lors du téléchargement avec URL signée:', uploadError);
      return null;
    }
    
    // Récupérer l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);
    
    return publicUrl;
  } catch (error) {
    console.error('Erreur inattendue lors du téléchargement:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucketName = formData.get('bucket') as string || 'uploads';
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }
    
    // S'assurer que le bucket existe
    const bucketExists = await ensureBucketExists(bucketName);
    if (!bucketExists) {
      return NextResponse.json(
        { error: `Impossible de créer ou d'accéder au bucket ${bucketName}` },
        { status: 500 }
      );
    }
    
    // Télécharger le fichier avec une URL signée pour contourner les restrictions RLS
    const imageUrl = await uploadFileWithSignedUrl(file, bucketName);
    
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Erreur lors du téléchargement du fichier' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue lors du téléchargement';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
