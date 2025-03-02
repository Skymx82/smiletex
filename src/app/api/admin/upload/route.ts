import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }
    
    // Créer un nom de fichier unique
    const originalName = file.name;
    const extension = originalName.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${extension}`;
    
    // Convertir le fichier en ArrayBuffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Chemin où sauvegarder l'image
    const imagesDirectory = path.join(process.cwd(), 'public/images');
    const filePath = path.join(imagesDirectory, fileName);
    
    // Écrire le fichier
    await writeFile(filePath, buffer);
    
    // Retourner l'URL relative
    const imageUrl = `/images/${fileName}`;
    
    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error('Erreur lors du téléchargement du fichier:', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement du fichier' },
      { status: 500 }
    );
  }
}
